import fs from "fs";
import path from "path";
import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, label, errors, prettyPrint } = winston.format;

// Ensure logs dir exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const myFormat = printf(({ level, message, timestamp, label, stack }) => {
  if (level === "error" && stack) {
    // Only errors get pretty-printed stack traces
    return `${timestamp} [${label}] ${level}: ${message}\n${stack}`;
  }
  // Everything else stays one-liner
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const ProdLogger = (labelName: string) => {
  return winston.createLogger({
    level: "info",
    format: combine(
      label({ label: labelName }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }), // attach error.stack
      myFormat
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.DailyRotateFile({
        dirname: logDir,
        filename: "app-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        level: "info",
      }),
      new winston.transports.DailyRotateFile({
        dirname: logDir,
        filename: "error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
        level: "error",
      }),
    ],
  });
};

export default ProdLogger;
