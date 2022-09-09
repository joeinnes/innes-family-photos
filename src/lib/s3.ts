import AWS from 'aws-sdk';
import type {
  DeleteObjectRequest,
  GetObjectRequest,
  HeadObjectRequest,
  CopyObjectRequest,
  ListObjectsV2Request,
  PutObjectRequest
} from 'aws-sdk/clients/s3';

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY
});
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
      Bucket: process.env.S3_BUCKET || ''
    };
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
};

export const uploadFile = async (file: Buffer | string, key: string, type: string) => {
  try {
    let params: PutObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Body: file,
      Key: key,
      ContentType: type
    };
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      };
    }
    const res = await s3.putObject(params).promise();
    return res;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const createCollection = async (file: string, key: string) => {
  try {
    let params: PutObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Body: file,
      Key: key,
      ContentType: 'text/plain'
    };
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      };
    }
    const res = await s3.putObject(params).promise();
    return res;
  } catch (e) {
    console.error(e);
    return e;
  }
};

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
      };
    }
    const res = await s3.getObject(params).promise();
    return res;
  } catch (e) {
    return e;
  }
};

export const renameFile = async (oldKey: string, newKey: string) => {
  try {
    if (!oldKey && !newKey) {
      throw new Error('One or more keys were not provided');
    }
    let params: CopyObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      CopySource: process.env.S3_BUCKET + oldKey,
      Key: newKey
    };
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      };
    }
    await s3.copyObject(params).promise();
    await deleteFile(oldKey);
    return;
  } catch (e) {
    return e;
  }
};

export const deleteFile = async (key: string) => {
  try {
    if (!key) {
      throw new Error('No key provided');
    }
    const params: DeleteObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    };
    const res = await s3.deleteObject(params).promise();

    return res;
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const doesFileExist = async (key: string) => {
  try {
    if (!key) {
      throw new Error('No key provided');
    }
    let params: HeadObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    };
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      };
    }
    const res = await s3.headObject(params).promise();

    return !!res;
  } catch (e) {
    // console.error(e);
    return false;
  }
};

export const createFile = async (key: string) => {
  try {
    let params: PutObjectRequest = {
      Bucket: process.env.S3_BUCKET || '',
      Body: '',
      Key: key,
      ContentType: 'text/plain'
    };
    if (process.env.S3_ENCRYPTION_KEY) {
      const ssecKey = Buffer.alloc(32, process.env.S3_ENCRYPTION_KEY);
      params = {
        ...params,
        SSECustomerAlgorithm: 'AES256',
        SSECustomerKey: ssecKey
      };
    }
    const res = await s3.putObject(params).promise();
    return res;
  } catch (e) {
    console.error(e);
    return e;
  }
};
