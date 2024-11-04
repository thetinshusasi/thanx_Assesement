import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { NextFunction, Request, Response } from 'express';


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) { }


  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Logging HTTP request ${req.method} ${req.url} ${res.statusCode}`,);
    next();
  }
}
