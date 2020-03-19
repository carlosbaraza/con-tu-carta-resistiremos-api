import winston from 'winston';

export const log = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.prettyPrint()
  ),
  transports: [new winston.transports.Console()]
});

if (process.env.NODE_ENV === 'production') {
  // - Write to all logs with level `info` and below to `combined.log`
  log.add(
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  );
  // - Write all logs error (and below) to `error.log`.
  log.add(new winston.transports.File({ filename: 'combined.log' }));
}
