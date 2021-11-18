import { Body, Controller, Post, Req, Res, Session } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto, CreateUserComfirmDto, BaseUserDto } from '../user/dto/user.dto';
import { Request, Response } from 'express';
import { Server,Socket  } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
var a=[]
@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService ) {}

    @Post("/register")
    async create(@Body()   createUserDto :CreateUserDto, @Req() request :Request) :Promise<CreateUserComfirmDto>{
    const data= await this.userService.register(createUserDto);
    console.log(data);
    if(data){
      request.session[data.userName]= data.token
      a[data.userName]=data.token
      return data;
    }
    return new CreateUserComfirmDto()
  }
 
  //................................................
  @Post('/registerConfirm')
  async confirm(@Body()   data: CreateUserComfirmDto, @Req() request :Request ,@Session() session: Record<string, any >,@Res() res) :Promise<String> {
    console.log(data)
    console.log(session[data.userName])
    console.log(a[data.userName])

    if(data.token==session[data.userName]||data.token==a[data.userName]){
      await this.userService.registerConfirm(data)
      delete request.session[data.userName]
      return res.json("done")
    }else{return res.json("error")}
    
  }
  
  //login và trả về Jwt nếu đăng nhâp thành công nếu không trả về string rỗng 
  @Post("/login")
  async login(@Body() data :{userName:string,password:string} ,@Req() req , socket: Socket,
  @Res({ passthrough: true }) response: Response,@Session() session: Record<string, any>) {
   
    const jwt =await this.userService.login(data)
      // console.log(clients)
    console.log(jwt)
    if (jwt){
      let clients={};
      console.log(clients)
      session.clients= clients;
      response.cookie("jwt",jwt,{httpOnly:true});
      return jwt;
    }
    else {return ""}
  }
  //...........................................................................
  @Post("/forgotPassword")
  async forgot(@Body() data :{userName:string,email:string},@Req() request :Request
  ,@Res() res,@Session() session: Record<string, any>){
    const user= await this.userService.forgotPassword(data.userName,data.email);
    console.log(data)
    if(user){
      session[data.userName]= user["token"];
      a[data.userName]=user["token"];
      
      res.json(user)
    }
    else{res.json("error");}
  }
  //

  @Post("/forgotPasswordConfirm")
  async forgotConfirm(@Body() data :{userName:string,email:string,token:string},
    @Req() request :Request ,@Session() session: Record<string, any> ,@Res() res)  {
    console.log(data)
    console.log(a[data.userName]);
    console.log()
    if(data.token==session[data.userName] || data.token==a[data.userName]){
      delete request.session[data.userName]
      return res.json("done")
    }else{return res.json("error")}
  }
  
  @Post("forgotNewPassword")
  async forgotNewPassword(@Body() data :{userName:string,email:string,token:string,password:string},
    @Req() request :Request ,@Session() session: Record<string, any> ,@Res() res)  {
    console.log(data)
    console.log(a[data.userName]);
    console.log()
    if(data.token==session[data.userName] || data.token==a[data.userName]){
      await this.userService.updatePassword(data.userName,data.password);
      delete request.session[data.userName]
      return res.json("done")
    }else{return res.json("error")}
  }

  @Post("logout")
  async logout(@Body() data:{jwt:string} , @Res() res){
    console.log("-------------run logout------------------")
    console.log(data.jwt)
    let  a= await this.userService.logout(data.jwt)
    if(a=="done"){
       res.json("done")
    }else{ res.json("error")}
   
  }
}
