import winston from "winston";
const { combine, timestamp, printf, errors } = winston.format;

const fmt = printf(({ level, message, label, timestamp: ts, stack }) => {
  const base = `${ts} [${label ?? "atos"}] ${level}: ${message}`;
  return stack ? `${base}\n${stack}` : base;
});

export function createLogger(label: string) {
  return winston.createLogger({
    level: process.env.LOG_LEVEL ?? "info",
    format: combine(errors({ stack: true }), timestamp({ format: "HH:mm:ss.SSS" }), winston.format.label({ label }), fmt),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `logs/${label}.log`, maxsize: 5_242_880, maxFiles: 3 }),
    ],
  });
}
