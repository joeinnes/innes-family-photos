import webpush from 'web-push';
import { listItems, getFile, deleteFile } from '$lib/s3';

webpush.setVapidDetails(
  'mailto:' + process.env.VITE_SITE_CONTACT,
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const notifyAll = async (message: string) => {
  const subscriptions = await listItems({
    Bucket: process.env.S3_BUCKET || '',
    Prefix: 'subscriptions/'
  })

  subscriptions.forEach(async (file) => {
    try {
      const subDetails = await getFile(file.Key);
      const sub = JSON.parse(subDetails.Body.toString());
      await webpush.sendNotification(sub, 'Test payload');
    } catch (e) {
      if (e.statusCode === 401) {
        deleteFile(file.Key);
      }
      // console.log(e)
    }
  })

}