import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === "development"
      ? winston.format.prettyPrint()
      : winston.format.json()
  ),
  defaultMeta: { service: "user-service" },
  transports: [new winston.transports.Console()],
});
