import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { deleteFile, doesFileExist, uploadFile } from './s3';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32));
if (!process.env.ENCRYPTION_KEY) {
  console.warn('No encryption key specified. A random key has been generated, but all users will need to log in again every time the app restarts.')
}

//https://stackoverflow.com/questions/53269132/aes-256-gcm-encryption-decryption-in-nodejs
export const encrypt = (dataBuffer: Buffer) => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encryptedBuffer = Buffer.concat([cipher.update(dataBuffer), cipher.final()])
  const authTag = cipher.getAuthTag()
  const bufferLength = Buffer.alloc(1)
  bufferLength.writeUInt8(iv.length, 0)
  return Buffer.concat([bufferLength, iv, authTag, encryptedBuffer])
}

export const decrypt = (dataBuffer: Buffer) => {
  const ivSize = dataBuffer.readUInt8(0)
  const iv = dataBuffer.slice(1, ivSize + 1)
  // The authTag is by default 16 bytes in AES-GCM
  const authTag = dataBuffer.slice(ivSize + 1, ivSize + 17)
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(dataBuffer.slice(ivSize + 17)), decipher.final()]).toString('utf-8');
}

type AuthStatus =
  'admin' | 'user' | null;

export const getAuthStatus = (req: Request): AuthStatus => {
  let returnVal: AuthStatus = null;
  try {
    const { headers } = req;
    const cookie = headers.get('cookie');
    let token = '';
    if (cookie && cookie.substring(0, 6) === 'token=') {
      token = cookie.substring(6);
    }
    if (!token) return null;
    const payload = jwt.verify(token, process.env.ENCRYPTION_SECRET);
    const { password } = payload;

    const decryptedPassword = decrypt(Buffer.from(password));
    if (decryptedPassword === process.env.ADMIN_PASSWORD) {
      returnVal = 'admin';
    } else if (decryptedPassword === process.env.USER_PASSWORD) {
      returnVal = 'user';
    } else {
      returnVal = null;
    }
    return returnVal;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export const validateMagicLink = async (magiclink: string) => {
  try {
    type TokenType = 'persistent' | 'temp' | null;
    let tokenType: TokenType = null; if (await doesFileExist('magiclinks/' + magiclink + '-temp')) {
      tokenType = 'temp';
    } else if (await doesFileExist('magiclinks/' + magiclink + '-persist')) {
      tokenType = 'persistent'
    }
    if (!tokenType) throw 'Token not valid';
    if (tokenType === 'temp') {
      deleteFile('magiclinks/' + magiclink + '-temp');
    }
    const encryptedPass = encrypt(Buffer.from(process.env.USER_PASSWORD || ''));
    const token = jwt.sign({ password: encryptedPass }, process.env.ENCRYPTION_SECRET, {
      expiresIn: `${process.env.COOKIE_VALIDITY} days`
    })
    const d = new Date();
    const expiryDays = parseInt(process.env.COOKIE_VALIDITY || '7', 10);
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    return `token=${token};expires=${d.toUTCString()};path=/;Secure; HttpOnly;SameSite=Strict`;
  } catch (e) {
    return '';
  }
}

export const generateMagicLink = async (persistent: boolean) => {
  const randomBytes = crypto.randomBytes(12).toString('hex');
  const fileName = `magiclinks/${randomBytes}-${persistent ? 'persist' : 'temp'}`;
  await uploadFile(Buffer.from(randomBytes), fileName, 'text/plain')
  return randomBytes;
}