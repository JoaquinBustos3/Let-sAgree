import winston from "winston";
import "winston-daily-rotate-file";
import dotenv from "dotenv";

dotenv.config();

const { combine, timestamp, printf, colorize, label, errors, prettyPrint } = winston.format;

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
      new winston.transports.Console()
    ],
  });
};

export default ProdLogger;
