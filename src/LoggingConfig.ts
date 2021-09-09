import * as winston from 'winston';
export const config={
    url: 'http://localhost:3000/api',
}
export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});