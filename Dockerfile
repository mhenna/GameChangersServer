FROM node:8

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN npm install

COPY . /usr/src/app

EXPOSE 4040:4040

CMD npm start