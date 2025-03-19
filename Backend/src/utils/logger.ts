import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

interface LogInfo {
  level: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

export const formatLogMessage = ({ level, message, timestamp, ...rest }: LogInfo): string => {
  const baseMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  if (Object.keys(rest).length > 0) {
    return `${baseMessage}\n${JSON.stringify(rest, null, 2)}`;
  }
  return baseMessage;
};

export default logger;
