FROM node:18.18.0-alpine

COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

COPY ./ ./

RUN npm run build

CMD ["npm", "start"]