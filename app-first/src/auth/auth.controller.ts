import { Body, Controller, Post, Req, Res, Session } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto, CreateUserComfirmDto, BaseUserDto } from '../user/dto/user.dto';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService ){}

    @Post("/register")
    async create(@Body()   createUserDto :CreateUserDto, @Req() request :Request){
    const data= await this.userService.register(createUserDto);
    console.log(data);
    if(data){
      request.session[data.userName]= data.token
    
      return data;
    }
    return "register false"
  }
 
  //................................................
  @Post('/registerConfirm')
  async confirm(@Body()   data: CreateUserComfirmDto, @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(data)
    console.log(session[data.userName])
    if(data.token==session[data.userName]){
      await this.userService.registerConfirm(data)
      delete request.session[data.userName]
      return "resgister true"
    }
    return "register false"
  }

  //login và trả về Jwt nếu đăng nhâp thành công nếu không trả về string rỗng 
  @Post("/login")
  async login(@Body() data:BaseUserDto ,@Req() req , @Res({ passthrough: true }) response: Response) {
    const jwt =await this.userService.login(data)
    console.log(jwt)
    if (jwt){ 
      response.cookie("jwt",jwt,{httpOnly:true});
      return jwt;
    }
    else {return ""}
  }
  //...........................................................................
  @Post("/forgotPassword")
  async forgot(@Body() data :{userName:string,email:string},@Req() request :Request){
    const token= await this.userService.forgot(data.userName,data.email);
    request.session[data.userName]= token
    return {...data,token:token}
  }
  //
  @Post("/forgotPasswordConfirm")
  async forgotConfirm(@Body() data :{userName:string,email:string,token:string},
    @Req() request :Request ,@Session() session: Record<string, any>
  ){
    
    if(data.token==session[data.userName]){
      
      delete request.session[data.userName]
      return "forgot true"
    }
    return "forgot false"
  }
}
