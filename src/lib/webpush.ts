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
  });

  console.log(`Notifying ${subscriptions.length} subscriber(s)`);
  let stale = 0;
  subscriptions.forEach(async (file) => {
    try {
      const subDetails = await getFile(file.Key);
      const sub = JSON.parse(subDetails.Body.toString());
      await webpush.sendNotification(sub, message);
    } catch (e) {
      // Clean up stale subscriptions
      if (e.statusCode === 410 && file.Key) {
        try {
          stale++;
          deleteFile(file.Key);
        } catch (e) {
          console.error(e);
        }
      } else {
        console.error(e);
      }
    }
  });
  console.log(`${stale} stale subscription(s) removed.`);
};
