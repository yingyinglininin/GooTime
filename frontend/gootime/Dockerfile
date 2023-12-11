FROM node:18.18.0-alpine

ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

COPY ./ ./

RUN npm run build

CMD ["npm", "start"]