import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, label, errors, prettyPrint } = winston.format;

// Custom log format
const myFormat = printf(({ level, message, timestamp, label, stack }) => {
  if (level === "error" && stack) {
    return `${timestamp} [${label}] ${level}: ${message}\n${stack}`;
  }
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const DevLogger = (labelName: string) => {
  return winston.createLogger({
    level: "debug",
    format: combine(
      errors({ stack: true }), // attach error.stack first
      label({ label: labelName }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      colorize({ all: true }), // colorize *after* timestamp & level
      myFormat // finally apply your custom printf
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });
};

export default DevLogger;
