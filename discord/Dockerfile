FROM node:18-alpine AS builder

COPY package*.json ./

RUN npm install

COPY . .

FROM node:18-alpine

COPY --from=builder . .

CMD ["node", "."]