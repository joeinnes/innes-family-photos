import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
})
const ep = new AWS.Endpoint(process.env.S3_ENDPOINT || '');
const s3 = new AWS.S3({ endpoint: ep });
export const listItems = async ({ count = 1000, prefix = '', startAfter = '' }) => {
  try {
    const params = {
      MaxKeys: count,
      Prefix: prefix,
      Bucket: process.env.S3_BUCKET || '',
      StartAfter: startAfter
    };
    const list = await s3.listObjectsV2(params).promise();
    return list;
  } catch (e) {
    console.error(e);
  }
}

export const uploadFile = async (file: Buffer, key: string, type: string) => {
  try {
    let params = {
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
    let params = {
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
    console.error(e);
    return e;
  }
}

export const deleteFile = async (key: string) => {
  try {
    if (!key) {
      throw new Error('No key provided');
    }
    const params = {
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
    const params = {
      Bucket: process.env.S3_BUCKET || '',
      Key: key
    }
    const res = await s3.headObject(params).promise();
    return true;
  } catch (e) {
    //console.error(e);
    return false;
  }
}