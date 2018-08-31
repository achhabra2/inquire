FROM node:carbon

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV production

# Bundle app source
COPY . /usr/src/app

# Install app dependencies
RUN npm install --production

# Log volume if Not using PaperTrail
VOLUME ["/usr/src/app/logs"]

EXPOSE 3000
CMD [ "npm", "start" ]
