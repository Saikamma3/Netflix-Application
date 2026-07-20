FROM node:20-alpine
WORKDIR /backend

COPY shared/ ./shared/

COPY services/streaming-service/package*.json ./
RUN npm install

COPY services/streaming-service/src/ ./services/streaming-service/src/
COPY services/streaming-service/tsconfig.json ./services/streaming-service/

EXPOSE 3004
WORKDIR /backend/services/streaming-service
CMD ["/backend/node_modules/.bin/ts-node", "--transpile-only", "src/index.ts"]
