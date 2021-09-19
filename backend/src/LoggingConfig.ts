import * as winston from 'winston';
export const logger = winston.createLogger({
    transports: [
        //new winston.transports.Console()
        new winston.transports.File({ filename: 'info.log', level: 'info'}),
        new winston.transports.File({ filename: 'error.log', level: 'error'})
    ]
});