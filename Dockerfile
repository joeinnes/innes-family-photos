FROM node:18 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine

USER node:node

WORKDIR /app
COPY — from=builder — chown=node:node /app/build ./build
COPY — from=builder — chown=node:node /app/node_modules ./node_modules
COPY — chown=node:node package.json .
ENV PORT 3000
EXPOSE 3000
CMD ["node","build"]
	