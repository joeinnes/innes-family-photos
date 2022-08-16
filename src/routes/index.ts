import type { RequestHandler, ResponseBody } from '@sveltejs/kit';
import { listItems, uploadFile } from '$lib/s3';
import exif from "jpeg-exif";
import type { JSONValue } from '@sveltejs/kit/types/private';

export const GET: RequestHandler = async ({ locals }) => {
  let body: ResponseBody = {
    status: 200,
    list: []
  };

  const auth = locals.auth;

  if (!auth) {
    return {
      status: 401,
      error: {
        message: 'Not authorised'
      }
    }
  }


  try {
    const query = {
      Bucket: process.env.S3_BUCKET || ''
    };

    const res = await listItems(query);

    if (!res?.length) {
      return {
        body,
        status: 204
      }
    }


    const unsortedList = res.filter(el => {
      if (el && el.Key && el.Key.substring(0, 11) !== 'magiclinks/') {
        return true;
      }
      return false;
    });

    if (!unsortedList?.length) {
      return {
        body,
        status: 204
      }
    }

    const list = unsortedList.sort((a, b) => a.Key?.localeCompare(b.Key || '') || 0) as JSONValue

    body = {
      ...body,
      list: list
    }
    return {
      status: 200,
      body
    }
  } catch (e) {
    console.error(e);
    return {
      body,
      status: 500,
      error: {
        name: 'Server Error',
        message: 'Something went wrong'
      },
      list: []
    }
  }
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const auth = locals.auth;
  if (!auth) {
    return {
      status: 401,
      error: {
        message: 'Not Logged In'
      }
    }
  } else if (auth !== 'admin') {
    return {
      status: 403,
      error: {
        message: 'Upload Not Authorised'
      }
    }
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
        const data = exif.fromBuffer(fileBuffer);
        const exifDTO = data.SubExif.DateTimeOriginal
        const [date, time] = exifDTO.split(' ');
        const [year, month, day] = date.split(':');
        const [hour, minute, second] = time.split(':');
        fileName = `${year}-${month}/${day}-${hour}-${minute}-${second}-${file.name}`;
      } catch (e) {
        console.log('failed to read EXIF data', e)
        const { lastModified } = file;
        const LMD = new Date(lastModified);
        const month = (LMD.getMonth() + 1).toString().padStart(2, '0');
        const year = LMD.getFullYear();
        const day = LMD.getDate();
        const hour = LMD.getHours();
        const minute = LMD.getMinutes();
        const second = LMD.getSeconds();
        fileName = `${year}-${month}/${day}-${hour}-${minute}-${second}-${file.name}`;
      }
      uploadFile(fileBuffer, fileName, type)
    }
    return {
      status: 202
    }
  } catch (e) {
    console.log(e)
    return {
      status: 500,
      error: {
        message: 'Could not upload files.'
      }
    }
  }
}