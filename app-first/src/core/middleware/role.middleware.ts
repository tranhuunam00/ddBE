
import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RoleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headers= req.headers;
    
    console.log('Middle ware......');
    next();
    // if(headers.authorization){ next();}
    // throw new UnauthorizedException();
  }
}
