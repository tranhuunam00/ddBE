import { Body, Controller, Post, Req, Res, Session } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto, CreateUserComfirmDto, BaseUserDto } from '../user/dto/user.dto';
import { Request, Response } from 'express';
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
  async forgot(@Body() data :{userName:string,email:string},@Req() request :Request,@Res() res){
    const user= await this.userService.forgotPassword(data.userName,data.email);
    console.log(data)
    if(user){request.session[data.userName]= user["token"];
         a[data.userName]=user["token"];
            res.json(user)
    }
    else{res.json("error");}
  }
  //
  @Post("/forgotPasswordConfirm")
  async forgotConfirm(@Body() data :{userName:string,email:string,token:string,password:string},
    @Req() request :Request ,@Session() session: Record<string, any> ,@Res() res)  {
    
    if(data.token==session[data.userName] || a[data.userName]==data.token){
      await this.userService.updatePassword(data.userName,data.password);
      delete request.session[data.userName]
      // delete a[data.userName]
      res.json("done");
    }else{res.json("error")}
      
  }
}
