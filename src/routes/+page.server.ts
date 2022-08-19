import type { PageServerLoad, Action } from './$types';
import type { Object as S3Object } from 'aws-sdk/clients/s3';
import { error } from '@sveltejs/kit';
import { listItems, uploadFile } from '$lib/s3';
import { ExifParserFactory } from 'ts-exif-parser';
import { getAuthStatus } from '$lib/auth_middleware';

export const load: PageServerLoad = async ({ request }) => {
  const auth = getAuthStatus(request);
  let list: S3Object[] = [];
  if (!auth) {
    throw error(401, 'Not authorised');
  }

  try {
    const query = {
      Bucket: process.env.S3_BUCKET || ''
    };

    const res = await listItems(query);

    let unsortedList: S3Object[] = [];

    if (res.length) {
      unsortedList = res.filter(el => {
        if (el && el.Key && el.Key.substring(0, 11) !== 'magiclinks/') {
          return true;
        }
        return false;
      });
    }

    if (!unsortedList?.length) {
      return {
        list: []
      }
    }
    list = unsortedList.sort((a, b) => a.Key?.localeCompare(b.Key || '') || 0);

    // TODO: Work this out, types are not right
    const ListString = JSON.stringify(list);
    const ListJson = JSON.parse(ListString);
    return { list: ListJson };
  } catch (e) {
    console.error(e);
    throw error(500, 'Something went wrong');
  }
}
export const POST: Action = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not Logged In')

  } else if (auth !== 'admin') {
    throw error(403, 'Upload Not Authorised')
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const type = file.type;
      let fileName
      try {
        const parser = ExifParserFactory.create(fileBuffer);
        const parsed = parser.parse();
        if (!parsed?.tags?.DateTimeOriginal) {
          throw new Error('No DateTimeOriginal');
        }
        const exifDTO = parsed.tags.DateTimeOriginal
        const DateTime = new Date(exifDTO * 1000);

        const month = (DateTime.getMonth() + 1).toString().padStart(2, '0');
        const year = DateTime.getFullYear();
        const day = DateTime.getDate();
        const hour = DateTime.getHours();
        const minute = DateTime.getMinutes();
        const second = DateTime.getSeconds();
        fileName = `${year}-${month}/${day}-${hour}-${minute}-${second}-${file.name}`;
      } catch (e) {
        console.error('failed to read EXIF data - using Last Modified Date', e)
        const { lastModified } = file;
        const DateTime = new Date(lastModified);
        const month = (DateTime.getMonth() + 1).toString().padStart(2, '0');
        const year = DateTime.getFullYear();
        const day = DateTime.getDate();
        const hour = DateTime.getHours();
        const minute = DateTime.getMinutes();
        const second = DateTime.getSeconds();
        fileName = `${year}-${month}/${day}-${hour}-${minute}-${second}-${file.name}`;
      }
      uploadFile(fileBuffer, fileName, type)
    }
    return;
  } catch (e) {
    console.error(e)
    throw error(500, 'Could not upload files.')
  }
}