FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /backend

COPY shared/ ./shared/
COPY prisma/ ./prisma/

COPY services/user-service/package*.json ./
RUN npm install

COPY services/user-service/src/ ./services/user-service/src/
COPY services/user-service/tsconfig.json ./services/user-service/

EXPOSE 3003
WORKDIR /backend/services/user-service
CMD ["/backend/node_modules/.bin/ts-node", "--transpile-only", "src/index.ts"]
