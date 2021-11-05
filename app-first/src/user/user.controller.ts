import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, Res, Session, UnauthorizedException, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { UserI } from './interfaces/user.interface';
import { BaseUserDto, CreateUserDto, UpdateUserDto, CreateUserComfirmDto } from './dto/user.dto';
import { ValidationPipe } from '../core/validate/validate.pipe';
import { Request } from 'express';
import { RolesGuard } from '../core/guard/user.guard';
import { LoggingInterceptor } from 'src/core/interceptor/logger';
import { User } from './scheme/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';



@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService , private jwtService: JwtService) {}
  //........................update Pw...............................
  @Put('/updatePassword')
  async updatePassword(@Req() req: Request,@Body() body:{password:string}){
    await this.userService.updatePassword(req.user["userName"],body.password)
  }
  // lấy thông tin qua jwt có header là cookie jwt
  @Get("userJwt")
  async getUserJwt(@Req() request: Request) {
    try{
      const cookie = request.cookies["jwt"];
      const data =await this.jwtService.verifyAsync(cookie) ;
      if(!data){
        return null
      }
      const user=await this.userService.findById(data._id) ;  
      return user;
    } catch(e){return null}
  }
  // đăng xuất và xóa jwt người dùng
  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response){
    response.clearCookie("jwt");
    return "logout"
  } 
  
  @Get()
  async index() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
