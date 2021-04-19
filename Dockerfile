FROM node:12.18.3

COPY . /src/

EXPOSE 3000

WORKDIR /src/

RUN npm install

CMD node index.js