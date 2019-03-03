FROM node:10

WORKDIR /financial

COPY . /financial

RUN npm install

RUN npm install -g nodemon

EXPOSE 80

CMD ["npm", "start"]