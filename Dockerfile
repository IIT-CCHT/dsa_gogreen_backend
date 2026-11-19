#FROM node:14.16.0-alpine3.13
FROM node:20.3.0-alpine
RUN addgroup app && adduser -S -G app app
USER root
WORKDIR '/app'
COPY package*.json ./
RUN npm install
COPY . .
# Questo aggiunge una variabile env all'ubuntu alpine
ENV API_URL=http://localhost/
EXPOSE 3000
CMD ["npm", "run", "build"]
