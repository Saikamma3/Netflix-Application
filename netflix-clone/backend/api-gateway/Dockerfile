FROM node:20-alpine
WORKDIR /backend

# shared at /backend/shared/ — from api-gateway/src/, ../../shared resolves here
COPY shared/ ./shared/

# Install at /backend root so shared/ files can also resolve node_modules
COPY api-gateway/package*.json ./
RUN npm install

COPY api-gateway/src/ ./api-gateway/src/
COPY api-gateway/tsconfig.json ./api-gateway/

EXPOSE 3000
WORKDIR /backend/api-gateway
CMD ["/backend/node_modules/.bin/ts-node", "--transpile-only", "src/index.ts"]
