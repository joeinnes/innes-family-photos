# Traist Photos

Developed with `pnpm` -> `pnpm install`

```bash
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENCRYPTION_KEY=
ENCRYPTION_SECRET=
ENCRYPTION_KEY=
COOKIE_VALIDITY=
ADMIN_PASSWORD=
USER_PASSWORD=
MAIN_COLOUR=
VITE_BASE_URL=
VITE_SITE_NAME=
VITE_SITE_TAGLINE=
VITE_SITE_OWNER=
VITE_SITE_CONTACT=
```

Creating an encryption key:
`openssl enc -d -a -md sha1 -aes-256-cbc -nosalt -p`

# Settings

## S3 Settings
`S3_ENDPOINT`, `S3_BUCKET`. `S3_ACCESS_KEY`, and `S3_SECRET_KEY` are all what you would expect, and should be provided by your S3 host.

`S3_ENCRYPTION_KEY` is a secret key which will be used to encrypt your files if your S3 host supports SSE-C encryption. You can generate a key using the following: `openssl enc -d -a -md sha1 -aes-256-cbc -nosalt -p`.

**IF YOU LOSE THIS KEY, YOUR PHOTOS CANNOT BE DECRYPTED. BACK THIS UP AND KEEP IT SAFE**

Also note that you cannot have both unencrypted and encrypted photos in the same Traist Photos instance.

## JWT/Cookie Settings

`ENCRYPTION_SECRET` is a secret used to _sign_ the JWT

`ENCRYPTION_KEY` is a secret used to _encrypt_ the contents of the JWT.

Both of these can be generated at random at a site like https://randomkeygen.com/, but they should be 32 hexadecimal characters.

`COOKIE_VALIDITY` is the validity period of the cookie stored on visitor's computers in days. Users will need to log in again if the cookie expires.

## Personalisation Options
`ADMIN_PASSWORD` is the password used to unlock admin features (upload, delete)

`USER_PASSWORD` is the password used to enable access to the site.

`MAIN_COLOUR` is a hex code (including the hash) which will be used to calculate the accent colour on the site.

`VITE_BASE_URL` is the base URL of the site, needed for generating links.

`VITE_SITE_NAME` is the name of the site

`VITE_SITE_TAGLINE` is the tagline for the site

`VITE_SITE_OWNER` is the name of the site owner

`VITE_SITE_CONTACT` is the email address for the site owner.
