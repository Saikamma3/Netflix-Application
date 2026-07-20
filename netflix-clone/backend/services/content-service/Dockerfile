FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /backend

COPY shared/ ./shared/
COPY prisma/ ./prisma/

COPY services/content-service/package*.json ./
RUN npm install

COPY services/content-service/src/ ./services/content-service/src/
COPY services/content-service/tsconfig.json ./services/content-service/

EXPOSE 3002
WORKDIR /backend/services/content-service
CMD ["/backend/node_modules/.bin/ts-node", "--transpile-only", "src/index.ts"]
