
import { BadRequestException, Injectable, NestMiddleware, Req, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService,private userService: UserService) {}

  async use(@Req() req: Request, res: Response, next: NextFunction) {
    try{
        const cookie = req.cookies["jwt"];
      
        const token =await this.jwtService.verifyAsync(cookie) ;
        
        if(token){
            const user=await this.userService.findOne(token.userName) ;
            req.user = user;
            next();
        }else{
            console.log("jwt hết hạn")
            res.json("not jwt")
        }
        
      } catch(e){
        res.json("not jwt")
        return null}

    // if(headers.authorization){ next();}
    // throw new UnauthorizedException();
  }
}
