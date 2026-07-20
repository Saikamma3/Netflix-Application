FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /backend

# Recreate host directory structure so ../../../shared resolves from services/auth-service/src/
COPY shared/ ./shared/
COPY prisma/ ./prisma/

# Install at /backend root so both shared/ and service src/ can resolve node_modules
COPY services/auth-service/package*.json ./
RUN npm install

COPY services/auth-service/src/ ./services/auth-service/src/
COPY services/auth-service/tsconfig.json ./services/auth-service/

EXPOSE 3001
WORKDIR /backend/services/auth-service
CMD ["/backend/node_modules/.bin/ts-node", "--transpile-only", "src/index.ts"]
