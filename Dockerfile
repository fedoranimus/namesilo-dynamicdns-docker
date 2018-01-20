FROM node:8

LABEL Tim Turner <timdturner@gmail.com>

WORKDIR /namesilo

ADD . .

CMD [ "npm", "start" ]