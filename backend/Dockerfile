FROM node:18.18.0-alpine

COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force

COPY ./ ./

CMD ["node", "app.js"]