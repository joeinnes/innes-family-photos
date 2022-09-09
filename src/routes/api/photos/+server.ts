import type { Action } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { uploadFile } from '$lib/s3';
import { ExifParserFactory } from 'ts-exif-parser';
import { getAuthStatus } from '$lib/auth_middleware';
import { sub, add } from 'date-fns';

export const POST: Action = async ({ request }) => {
  const auth = getAuthStatus(request);
  if (!auth) {
    throw error(401, 'Not Logged In');
  } else if (auth !== 'admin') {
    throw error(403, 'Upload Not Authorised');
  }

  try {
    const formData = await request.formData();
    const utcOffset = (formData.get('offset') as string) || '+0200';
    const files = formData.getAll('files') as File[];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      const type = file.type;
      // TODO: Until #11 is implemented, hardcode the UTC offset.
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
        console.error('failed to read EXIF data - using Last Modified Date', e);
        const { lastModified } = file;
        // Seems that this is good enough to create a correct date :)
        DateTime = new Date(lastModified);
      }
      const month = (DateTime.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = DateTime.getUTCFullYear();
      const day = DateTime.getUTCDate().toString().padStart(2, '0');
      const hour = DateTime.getUTCHours().toString().padStart(2, '0');
      const minute = DateTime.getUTCMinutes().toString().padStart(2, '0');
      const second = DateTime.getUTCSeconds().toString().padStart(2, '0');
      const fileName = `${year}/${month}/${day}/${hour}:${minute}:${second}Z${utcOffset}-${file.name}`;
      uploadFile(fileBuffer, fileName, type);
    }
    return;
  } catch (e) {
    console.error(e);
    throw error(500, 'Could not upload photo');
  }
};
