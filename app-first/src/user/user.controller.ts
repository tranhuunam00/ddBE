import { Body, Controller, Delete, ValidationPipe, Get, Param, ParseIntPipe, Post, Put, Req, Res, Session, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserI } from './interfaces/user.interface';
import { BaseUserDto, CreateUserDto, UpdateUserDto, CreateUserComfirmDto } from './dto/user.dto';

import { Request, Response,} from 'express';
import { RolesGuard } from '../core/guard/user.guard';
import { LoggingInterceptor } from 'src/core/interceptor/logger';
import { User } from './scheme/user.schema';
import { JwtService } from '@nestjs/jwt';

import { FilterMessageDto } from '../message/dto/message_param.dto';
import { FileService } from '../file/file.service';
import { MessageService } from '../message/message.service';
import { IsNotEmpty } from 'class-validator';
import { EventsGateway } from '../events/event,gateway';
import { NotificationService } from '../notification/notification.service';





@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService ,
      private jwtService: JwtService,
      private eventsGateway:EventsGateway,
      private notifiService: NotificationService,
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
  
  @Post("addfr/:data")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFr(@Res ({ passthrough: true }) response: Response,
  @Param("data") data: string,
  @Req() request :Request , @Body() body:{createdAt:string}, @Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log("data là")
    console.log(data)
    let result= await Promise.all([this.userService.addFr(request.user,data),
      this.notifiService.create({"type":"addFr","createdAt":body.createdAt,"content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[data]})])
    await this.eventsGateway.handleFr({"type":"addFr","createdAt":body.createdAt,"content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[data]},data)
    console.log(result[0])
    
    response.json(result[0])
  } 
  @Post("addfrConfirm/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async addFrConfirm(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,@Body() body:{createdAt:string},
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await Promise.all([this.userService.addFrConfirm(request.user,id),
      this.notifiService.create({"type":"confirmFr","createdAt":body.createdAt,"content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[id]})])
      await this.eventsGateway.handleFr({"type":"confirmFr","createdAt":body.createdAt,"content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[id]},id)
    
     response.json(result[0]) 
  } 

  @Post("removeFriend/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFriend(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,@Body() body:{createdAt:string},
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await Promise.all([this.userService.removeFriend(request.user,id),
       this.eventsGateway.handleFr({"type":"removeFriend","createdAt":"","content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[id]},id)]) 
    
    if(result[0] !="error"){ response.json(result) }
    else{ response.json("error") }
  }

  @Post("removeFrRequest/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFrRequest(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,@Body() body:{createdAt:string},
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await Promise.all([this.userService.removeFrRequest(request.user,id),
      this.eventsGateway.handleFr({"type":"removeFrRequest","createdAt":"","content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[id]},id)]) 

    response.json(result[0]) 
    
  } 
  @Post("removeFrConfirm/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFrConfirm(@Res ({ passthrough: true }) response: Response,
  @Param("id") id: string,
  @Req() request :Request ,@Session() session: Record<string, any>){
    console.log(request.user)
    let user=request.user;
    console.log(id)
    let result = await Promise.all([this.userService.removeFrConfirm(request.user,id),
      this.eventsGateway.handleFr({"type":"removeFrConfirm","createdAt":"","content":"","sourceUserId":request.user["_id"].toString(),"targetUserId":[id]},id)]) 

    response.json(result[0]) 
    
  } 

  @Post("addOneHadMsgList")
  async addOneHadMsgList(@Res() res, @Req() req ,@Body() body :{idFr:string, idUser:string}){
    let result = await this.userService.addOneHadUserChat(body.idFr,body.idUser);
    res.json(result);
  }

  @Get("test/:id")
  @UsePipes(new ValidationPipe({ transform: true }))
  async test(@Res() response: Response,@Param() params){
    console.log(params.id)
    let a = await this.userService.test1(params.id);
    console.log("a la : ")
    console.log(a)
    response.json(a)
  }
  
  //--------------------get avatar Fr----------
  @Get("allAvatarFr/:id")
  async getAllFrAvatar(@Req() req: Request,@Res() res: Response,@Param() params){
    try{
      let user=await this.userService.findById(params.id);
      if(user!={}){
        console.log(user["friend"])
        let result = await this.userService.getallFrAvatar(user["friend"])
        console.log(result)
        if(result == "error"){return res.json("error")}
        else{return res.json(result)}
      }else{
        return res.json("error")
      }
      
      
    }catch(err){return res.json("error")}
  }
  //-----------------------get information Hadchat-------
  @Get("allInforHadChat")
  async getAllHadChat(@Req() req: Request,@Res() res: Response){
    try{
      console.log("chạy ")
      let result = await this.userService.getallFrAvatar(req.user["hadMessageList"])
      console.log(result)
      if(result == "error"){return res.json("error")}
      else{return res.json(result)}
      
    }catch(err){return res.json("error")}
  }
  
  @Get("email/:email")
    async findByEmail(@Req() req: Request,@Res() res: Response,@Param("email") email: string){
    console.log("chạy tim email")
    console.log(email)
    const result =await this.userService.findByEmail(email)
    res.json(result)
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    console.log(id)
    let result= await this.userService.findById(id);
    console.log(result)
    return result;
  }

  
  @Post("listUser")
    async GetListUser(@Req() req: Request,@Res() res: Response){
      console.log("--hàm get user list --------đang chạy")
      console.log(req.body.listUser)
      let users=[]
      if(req.body.listUser!=undefined){
        for(let i=0;i<req.body.listUser.length;i++){
          const user= await this.userService.findById(req.body.listUser[i])
          console.log(user)
          if(user["userName"]!=undefined){
            users.push(user)

          }
        }
        console.log("------length")
        console.log(users.length)
        if(users.length>0){
          return res.json(users)
        }else{return res.json("error")}
        
      }else{return res.json("error")}
    }

  @Post("setting")
  async settingUser(@Res() res: Response,@Req() req,@Param() params
   ,@Body() data:{sex:string,addressTinh:string,addressDetails:string,birthDate:string,realName:string,}){
    console.log("data nhận vào");
    console.log(req.user["_id"])
    console.log(data)
    let result =await this.userService.setting(data,req.user["_id"]);
    if(result!="error"){
      res.json("done");
    }else{return res.json("error")}
   
  }
  //------------------g
  @Post("createHadMsg")
  async createHadMsg(@Res() res:Response,@Req() req:Request,@Body() data:{frId:string}){
    console.log("createHadMsg --new ")
    let result = await this.userService.newHadUserChat(data.frId,req.user["_id"].toString(),req.user["hadMessageList"])
    return res.json(result)
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
