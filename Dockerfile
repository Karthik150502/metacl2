FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY . .

RUN  pnpm install

EXPOSE 3000


CMD ["pnpm", "run", "dev:docker"]