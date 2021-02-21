FROM node:14

WORKDIR /app
ADD package.json .
ADD yarn.lock .

RUN yarn

ADD src .
RUN yarn build

CMD ["node", "build/index.js"]
