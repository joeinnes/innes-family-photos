import AWS from 'aws-sdk';
import type { DeleteObjectRequest, GetObjectRequest, HeadObjectRequest, ListObjectsV2Request, PutObjectRequest } from 'aws-sdk/clients/s3';

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
})
const ep = new AWS.Endpoint(process.env.S3_ENDPOINT || '');
const s3 = new AWS.S3({ endpoint: ep });

export const listItems = async (bucketParams: ListObjectsV2Request) => {

  const items: AWS.S3.Object[] = [];
  let truncated = true;

  let pageMarker;
  let nextBucketParams = bucketParams;
  if (!nextBucketParams.Bucket) {
    nextBucketParams = {
      ...bucketParams,
      Bucket: process.env.S3_BUCKET || '',
    }
  }
  while (truncated) {
    try {
      const response = await s3.listObjectsV2(nextBucketParams).promise();
      response?.Contents?.forEach((item) => {
        items.push(item);
      });
      truncated = response.IsTruncated ?? false;
      if (truncated && response && response.Contents) {
        pageMarker = response.Contents.slice(-1)[0].Key;
        nextBucketParams.StartAfter = pageMarker;
      }
    } catch (e) {
      console.error(e);
      truncated = false;
    }
  }
  return items;
}

export const uploadFile = async (file: Buffer, key: string, type: string) => {
  try {
    let params: PutObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Body: file,
      Key: key,
      ContentType: type
    }
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      }
    }
    const res = await s3.putObject(params).promise();
    return res;
  } catch (e) {
    console.error(e);
    return e;
  }
}

export const getFile = async (key: string) => {
  try {
    if (!key) {
      throw new Error('No key provided');
    }
    let params: GetObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    };
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      }
    }
    const res = await s3.getObject(params).promise();
    return res;
  } catch (e) {
    return e;
  }
}

export const deleteFile = async (key: string) => {
  try {
    if (!key) {
      throw new Error('No key provided');
    }
    const params: DeleteObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    }
    const res = await s3.deleteObject(params).promise();

    return res;
  } catch (e) {
    console.error(e);
    return e;
  }
}

export const doesFileExist = async (key: string) => {
  try {
    if (!key) {
      throw new Error('No key provided');
    }
    let params: HeadObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    }
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      }
    }
    const res = await s3.headObject(params).promise();

    return !!res;
  } catch (e) {
    console.error(e);
    return false;
  }
}

