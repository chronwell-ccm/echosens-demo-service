FROM node:18-alpine@sha256:0fe7402d11d8c85474c6ec6f9c9c8048cd0549c95535832b7f0735a4b47690a5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ENV NODE_ENV production
COPY package.json /usr/src/app/
COPY . /usr/src/app
USER node

CMD [ "npm", "start" ]