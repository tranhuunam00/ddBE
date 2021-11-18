import { Body, Controller, Delete, ValidationPipe, Get, Param, ParseIntPipe, Post, Put, Req, Res, Session, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserI } from './interfaces/user.interface';
import { BaseUserDto, CreateUserDto, UpdateUserDto, CreateUserComfirmDto } from './dto/user.dto';

import { Request } from 'express';
import { RolesGuard } from '../core/guard/user.guard';
import { LoggingInterceptor } from 'src/core/interceptor/logger';
import { User } from './scheme/user.schema';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { FilterMessageDto } from '../message/dto/message_param.dto';
import { FileService } from '../file/file.service';




@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService ,
     private jwtService: JwtService,

     ) {}
  //........................update Pw...............................
  @Put('/updatePassword')
  async updatePassword(@Req() req: Request,@Body() body:{password:string}){
    await this.userService.updatePassword(req.user["userName"],body.password)
  }
  // lấy thông tin qua jwt có header là cookie jwt
  @Get("userJwt")
  async getUserJwt(@Req() request: Request,@Res() res: Response) {
    try{
      
      const cookie = request.cookies["jwt"];
      const data =await this.jwtService.verifyAsync(cookie) ;
      if(!data){
        return res.json("error")
      }
      console.log(data)
      const token = await this.userService.findOneJwt(cookie)
      const user=await this.userService.findOne(data.userName);  
      if(token.isLogin==true){  return res.json(user);}
      else{return res.json("error")}
    } catch(e){return res.json("error")}
  }
  // =-------------------đăng xuất và xóa jwt người dùng--------------
  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response){
    response.clearCookie("jwt");
    return "logout"
  } 
  //-------------------addfr---------------------------------------
 
  @Get("addfr/:data")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFr(@Res ({ passthrough: true }) response: Response,
  @Param("data") data: string,
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(data)
    let result = await this.userService.addFr(request.user,data)
    
    response.json(result)
  } 
  @Get("addfrConfirm/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFrConfirm(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await this.userService.addFrConfirm(request.user,id)
    
     response.json(result) 
  } 

  @Get("removeFriend/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFriend(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await this.userService.removeFriend(request.user,id)
    if(result !="error"){ response.json(result) }
    else{ response.json("not") }
  } 

  @Get("removeFrRequest/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFrRequest(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await this.userService.removeFrRequest(request.user,id)
    response.json(result) 
    
  } 
  

  //--------------------change avatar or ảnh bìa----------
  
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
