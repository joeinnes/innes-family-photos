import type { PageServerLoad, Action } from './$types';
import type { Object as S3Object } from 'aws-sdk/clients/s3';
import { error } from '@sveltejs/kit';
import { listItems, uploadFile } from '$lib/s3';
import { ExifParserFactory } from 'ts-exif-parser';
import { getAuthStatus } from '$lib/auth_middleware';
import { sub, add } from 'date-fns';
import { notifyAll } from '$lib/webpush';

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
        if (el && el.Key && el.Key.substring(0, 11) !== 'magiclinks/' && el.Key.substring(0, 12) !== 'collections/' && el.Key.substring(0, 14) !== 'subscriptions/') {
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
      // TODO: Until #11 is implemented, hardcode the UTC offset. 
      const utcOffset = '+0200';
      let DateTime;

      try {
        const parser = ExifParserFactory.create(fileBuffer);
        const parsed = parser.parse();
        if (!parsed?.tags?.DateTimeOriginal) {
          throw new Error('No DateTimeOriginal');
        }
        const exifDTO = parsed.tags.DateTimeOriginal;
        // TODO: no accounting for UTC offset
        const DTOasDate = new Date(exifDTO * 1000);
        if (utcOffset[0] === '+') {
          DateTime = sub(DTOasDate, {
            hours: parseInt(utcOffset.substring(1, 3), 10),
            minutes: parseInt(utcOffset.substring(3, 5), 10)
          });
        } else {
          DateTime = add(DTOasDate, {
            hours: parseInt(utcOffset.substring(1, 3), 10),
            minutes: parseInt(utcOffset.substring(3, 5), 10)
          });
        }
      } catch (e) {
        console.error('failed to read EXIF data - using Last Modified Date', e)
        const { lastModified } = file;
        // Seems that this is good enough to create a correct date :)
        DateTime = new Date(lastModified);
      }
      const month = (DateTime.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = DateTime.getUTCFullYear();
      const day = DateTime.getUTCDate();
      const hour = DateTime.getUTCHours();
      const minute = DateTime.getUTCMinutes();
      const second = DateTime.getUTCSeconds();
      const fileName = `${year}/${month}/${day}/${hour}:${minute}:${second}Z${utcOffset}-${file.name}`;
      uploadFile(fileBuffer, fileName, type);
    }
    notifyAll(`${files.length} new photo${files.length > 1 ? 's' : ''} added!`)
    return;
  } catch (e) {
    console.error(e)
    throw error(500, 'Could not upload files.')
  }
}