

import { Injectable, Inject, Module, forwardRef, Res } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto, CreateUserComfirmDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './scheme/user.schema';
import { UserI } from './interfaces/user.interface';
import { UserModule } from './user.module';

import { UserSql } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenDocument, TokenSchema, Token } from './scheme/token.schema';
import { MailService } from '../mail/mail.service';
import {  BaseTokenDto } from './dto/token.dto';
var tokenUser =[]
import { Server,Socket  } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway()
@Injectable()
export class UserService {
  constructor( @Inject("USER_MODEL")  private userModel:Model<UserDocument> ,
  @Inject("TOKEN_MODEL") private tokenModel:Model<TokenDocument>,
  @InjectRepository(UserSql)
  private usersRepository: Repository<UserSql>,
  private jwtService: JwtService,
  private mailService: MailService,
  
  ){}
      @WebSocketServer()
      server: Server
      //......................................đăng kí.....................................
      async register(data:CreateUserDto){
        if(data.userName.length<6) {return null}
        if(data.password.length<6) {return null}
        const userMongo =await this.userModel.findOne({userName:data.userName}).exec(); 
        const userMongoEmail=await this.userModel.findOne({email:data.email}).exec();
        const user = userMongo?userMongo.toObject():userMongo;
        const userEmail = userMongoEmail?userMongoEmail.toObject():userMongoEmail;

          console.log(user)
          if(user==null && userEmail==null){
            console.log("dang ki oki.....");
            
            const token = Math.floor(1000 + Math.random() * 9000).toString();
            await this.mailService.sendUserConfirmation(data.userName,data.email,token);
            console.log(token);
            return {...data,token:token}
          }
          else{
            console.log("register false")
            return null;
          } 
      }
      async registerConfirm(data:CreateUserComfirmDto) {
        const hashedPassword = await bcrypt.hash(data.password,12);
            data.password = hashedPassword;
            let newUser=
                    new this.userModel({
                      ...data,
                      createdAt: new Date(),
                    })
            await newUser.save()
      }

      //forgot.................................
      async forgotPassword(userName:string,email: string){
        const userMongo =await this.userModel.findOne({userName:userName,email:email}).exec(); 
        
        const user = userMongo?userMongo.toObject():userMongo;
        
        if(user!=null){
          console.log("..forgot ..----ok--------------------");
          const token = Math.floor(1000 + Math.random() * 9000).toString();
          await this.mailService.sendUserConfirmation(userName,email,token);
          console.log(token);
          return {userName: userName, email: email, token: token}
        }
        else{
          console.log("email và tài khoản chưa đúng")
          return null;
        } 
        const token = Math.floor(1000 + Math.random() * 9000).toString();
        await this.mailService.sendUserConfirmation(userName, email, token);
        return token
      }
      async forgotConfirm(){

      }
      
      //sql.......................................
      findAllSql(): Promise<UserSql[]> {
        return this.usersRepository.find();
      }
      //............................................
      async findAll(): Promise<User[]> {
        return await this.userModel.find({}).exec();
      }
      async findById(id: string): Promise<any>{
        try{
          const userMongo= await this.userModel.findOne({id:id}).exec();
          let user = userMongo.toObject();
          const {password,...result}=user;
          return result
        }catch(e){return null}
        
      }
      
      //.....................................login..........................................
      async login(data )  {
        
        let isLogin=0;
        const userMongo = await this.userModel.findOne({userName:data.userName}).exec();//
        const tokensMongo = await this.tokenModel.find().exec();
        console.log(tokensMongo.length)
        let Token ;
        if(userMongo && await bcrypt.compare(data.password,userMongo.password)){
          //importand
          if(tokensMongo){
            tokensMongo.map((tokensMongo) => tokensMongo.toObject());
            for(let i=0;i<tokensMongo.length;i++) {
              
              try{
                let dataJwt = await this.jwtService.verifyAsync(tokensMongo[i].Token) ;
                console.log("data khi verify")
                console.log(dataJwt)
                if(dataJwt) {
                  if(tokensMongo[i].isLogin == true && data.userName==dataJwt.userName){
                    console.log(dataJwt)
                    return "isLogin"
                  }

                  if(tokensMongo[i].isLogin == false && data.userName==dataJwt.userName ){
                      isLogin=1;
                      console.log("chay khi bang ")
                      Token=tokensMongo[i].Token;
                      await this.tokenModel.findOneAndUpdate({Token:Token},{isLogin:true})
                      return Token
                  }
                  
                }
              }catch(e) {
                
                }
            }
          }
          if(isLogin==0) {
            let user = userMongo.toObject();
                const {password,...result}=user;
                console.log(result);
                const jwt =await this.jwtService.signAsync({userName:result.userName},{})
                let newToken=
                new this.tokenModel({
                  Token: jwt,
                  createdAt: new Date(),
                  isLogin:true
                })
                await newToken.save()
                console.log(tokenUser)
                return jwt;
          }
        }else{
          return null
        }

      }
      //............................tìm kiếm theo tên......................................
      async findOne(userName: string): Promise<Object> {
        try{let userMongo= await this.userModel.findOne({userName:userName}).exec();
         let user = userMongo.toObject();
         const {password,...result}=user;
         return result
        }catch(e){return {} }
         
       }
      async findOneJwt(jwt:string):Promise<Token>{
        try{let userToken=await this.tokenModel.findOne({Token:jwt})
        return userToken.toObject()
       
        } catch(err){return null}
      }
      //...................................update pw.............................
      async updatePassword(userName: string,password: string){
        const hashedPassword = await bcrypt.hash(password,12);
        await this.userModel.findOneAndUpdate({userName:userName},{password:hashedPassword})
        
      }
      //.........................................update..........................
      async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        return await this.userModel.findByIdAndUpdate({_id:id},updateUserDto).exec();
      }
      
      async delete(id: string): Promise<User> {
        return await this.userModel.findByIdAndDelete({_id:id}).exec();
      }
      //------------------------logout-----------------------------
      async logout(jwt) : Promise<String> {
        try{
          let a = await this.tokenModel.findOne({Token:jwt}).exec();
          if(a._id!=null){
            console.log(a);
            let token=a.toObject();
            await this.tokenModel.findOneAndUpdate({Token:jwt},{isLogin:false})
            return "done";
          }
          return "error";
        }catch(e) {return "error";}
        
      }
      //------------------------add fr------------------------------
      async addFr(userOwn,data) : Promise<String>{
        try{
          var a =await this.userModel.findOne({userName:data}).exec()
        var b= await this.userModel.findOne({email:data}).exec()
        console.log("tên người đang truy cập  "+userOwn.userName )
        console.log("người đã yêu cầu kết bạn "+a.userName)
        
        if(a!=null||b!=null){
          console.log("có người dùng.....")
          const find = a!=null ? 0:1
          console.log(find)
          let user = a!=null?a.toObject():b.toObject()
          
          //nhận lời mời
          let friendConfirm=user.friendConfirm
          for(let i=0;i<friendConfirm.length;i++){
          
            if(friendConfirm[i]==userOwn._id.toString())
            return "had friendConfirm"
          }
          friendConfirm.push(userOwn._id.toString())

          // gửi lời mời đi
          let friendRequest=userOwn.friendRequest
          for(let i=0;i<friendRequest.length;i++){
            if(friendRequest[i]==user._id.toString())
            return "had friendRequest"
          }
          friendRequest.push(user._id.toString())
          //bạn của chủ sở hữu
          let friendOwn=userOwn.friend
          for(let i=0;i<friendOwn.length;i++){
            if(friendOwn[i]==user._id.toString())
            return "had friend"
          }
          
          console.log(friendConfirm)
          console.log(friendRequest)
          await this.userModel.findOneAndUpdate({_id:userOwn._id.toString()},{friendRequest:friendRequest})
          
          if(find==0){
            await this.userModel.findOneAndUpdate({userName:data},{friendConfirm:friendConfirm})
          }else{
            await this.userModel.findOneAndUpdate({email:data},{friendConfirm:friendConfirm})
          }
          return user._id
        }
        else{
          return "had not user"
        }
        }catch(err){
          return "error"
        }
        // this.server.emit('test'," test ");
      }
      async addFrConfirm(userOwn,id:string) : Promise<String>{
        try{
          var a =await this.userModel.findOne({_id:id})
          console.log("tên người đang truy cập  "+userOwn.userName )
          console.log("người đã yêu cầu kết bạn "+a.userName)
          if(a!=null){
            let i=0
            let isRequest=false;
            let isConfirm=false
            console.log("có người dùng.....")
            let user= a.toObject()
            //ban của chu sở hữu
            let friendOwn=userOwn.friend
            for(let i=0;i<friendOwn.length;i++){
              if(friendOwn[i]==user._id.toString())
              return "had friend"
            }
            friendOwn.push(id)
            let friend1=user.friend
            friend1.push(userOwn._id.toString())
            
            let friendRequest = user.friendRequest 
            let friendConfirm = userOwn.friendConfirm
            console.log("yseu cầu kết bạn")
            console.log(friendRequest)
            console.log("chấp thuận")
            console.log(friendConfirm)
            for(let i=0; i<friendRequest.length; i++){
              if(friendRequest[i]==userOwn._id.toString()||friendRequest[i]==null){
                console.log("bằng")
                if(friendRequest[i]==userOwn._id.toString()){ isRequest=true}
                friendRequest.splice(i, 1);
                i=i-1
                
              
              }
            }
            console.log("đã xóa yêu cầu kêt bạn")
            console.log(friendRequest)
            console.log("hihi")
            for(let i=0;i<friendConfirm.length;i++){
              if (friendConfirm[i]==id||friendConfirm[i]==null){
                if(friendConfirm[i]==id){  isConfirm=true}
                console.log("cũng băng")
                friendConfirm.splice(i, 1);
                i=i-1
              }
            }
            if(isRequest==false){
              return "had not request"
            }
            if(isConfirm==false){
              return "had not confirm"
            }
            if(isRequest==true&&isConfirm==true){
              await this.userModel.findOneAndUpdate({_id:userOwn._id.toString()},{friendConfirm:friendConfirm,friend:friendOwn})
              await this.userModel.findOneAndUpdate({_id:id},{friendRequest:friendRequest,friend:friend1})
              return "done"
            }
            return "error"
          }else{return "had not user"}
        }catch(e){return "error"}
        // this.server.emit('test'," test ");
        
      }

      //------------hủy kết bạn-----------------------------
      async removeFriend(userOwn,id:string){
        try{
          var a =await this.userModel.findOne({_id:id})
          console.log("tên người đang truy cập  "+userOwn.userName )
          console.log("người đã yêu cầu bị hủy "+a.userName)
          if(a!=null){
            let j=0
            console.log("có người dùng.....")
            let user= a.toObject()
            let friendOwn=userOwn.friend
            for(let i=0; i<friendOwn.length; i++){
              if(friendOwn[i]==id||friendOwn[i]==null){
                if(friendOwn[i]==id){j=1}
                console.log(" bằng")
                friendOwn.splice(i, 1); 
                i=i-1
              }
            }
            let friend1=user.friend
            friend1.push(userOwn.id)
            for(let i=0; i<friend1.length; i++){
              if(friend1[i]==userOwn._id.toString()||friend1[i]==null){
                console.log("cũng bằng")
                friend1.splice(i, 1);
                i=i-1
              }
            }
            console.log("bạn của chủ")
            console.log(friendOwn)
            console.log("bạn của người bị xóa")
            console.log(friend1)
            console.log(j)
            if(j==1){
              await this.userModel.findOneAndUpdate({_id:userOwn._id.toString()},{friend:friendOwn})
                await this.userModel.findOneAndUpdate({_id:id},{friend:friend1})
              return "done"
            }else{return "error"}
            
          }else{return "error"}
        }catch(e){return "error"}
      }
      
      //.........................remove fr request...................
      async removeFrRequest(userOwn,id){
        try{
          let isRequest = false;
          let isConfirm = false;
          var a =await this.userModel.findOne({_id:id})
          console.log("tên người đang truy cập  "+userOwn.userName )
          console.log("người đã yêu cầu bị hủy "+a.userName)
          if(a!=null){
            let j=0
            console.log("có người dùng.....")
            let user= a.toObject()
            let friendRequestOwn=userOwn.friendRequest
            for(let i=0; i<friendRequestOwn.length; i++){
              if(friendRequestOwn[i]==id||friendRequestOwn[i]==null){
                if(friendRequestOwn[i]==id){isRequest=true}
                console.log(" bằng ")
                friendRequestOwn.splice(i, 1); 
                i=i-1
              }
            }

            let friendConfirm = user.friendConfirm
            friendConfirm.push(userOwn.id)
            for(let i=0; i<friendConfirm.length; i++){
              if(friendConfirm[i]==userOwn._id.toString()||friendConfirm[i]==null){
                if(friendConfirm[i]==userOwn._id.toString()){ isConfirm = true;}
                console.log("cũng bằng")
                friendConfirm.splice(i, 1);
                i=i-1
              }
            }
            console.log("request của chủ")
            console.log(friendRequestOwn)
            console.log("confirm của người bị xóa")
            console.log(friendConfirm)
            if(isRequest==false){
              return "had not request"
            }
            if(isConfirm==false){
              return "had not confirm"
            }
            if(isRequest==true && isConfirm==true){
              await this.userModel.findOneAndUpdate({_id:userOwn._id.toString()},{friendRequest:friendRequestOwn})
              await this.userModel.findOneAndUpdate({_id:id},{friendConfirm:friendConfirm})
              return "done"
            }else{return "error"}
            
          }else{return "error"}
        }catch(e){return "error"}
      }
      //...............................remove confirm ............
      async removeFrConfirm(userOwn,id){
        try{
          let isRequest = false;
          let isConfirm = false;
          var a =await this.userModel.findOne({_id:id})
          console.log("tên người đang truy cập  "+userOwn.userName )
          console.log("người đã yêu cầu bị hủy "+a.userName)
          if(a!=null){
            let j=0
            console.log("có người dùng.....")
            let user= a.toObject()
            let friendConfirmOwn=userOwn.friendConfirm
            for(let i=0; i<friendConfirmOwn.length; i++){
              if(friendConfirmOwn[i]==id||friendConfirmOwn[i]==null){
                if(friendConfirmOwn[i]==id){isConfirm=true}
                console.log(" bằng ")
                friendConfirmOwn.splice(i, 1); 
                i=i-1
              }
            }

            let friendRequest = user.friendRequest
            friendRequest.push(userOwn.id)
            for(let i=0; i<friendRequest.length; i++){
              if(friendRequest[i]==userOwn._id.toString()||friendRequest[i]==null){
                if(friendRequest[i]==userOwn._id.toString()){ isRequest = true;}
                console.log("cũng bằng")
                friendRequest.splice(i, 1);
                i=i-1
              }
            }
            console.log("comfirm của chủ")
            console.log(friendConfirmOwn)
            console.log("request của người bị xóa")
            console.log(friendRequest)
            
            if(isConfirm==false){
              return "had not confirm"
            }
            if(isRequest==false){
              return "had not request"
            }
            if(isRequest==true && isConfirm==true){
              await this.userModel.findOneAndUpdate({_id:userOwn._id.toString()},{friendConfirm:friendConfirmOwn})
              await this.userModel.findOneAndUpdate({_id:id},{friendRequest:friendRequest})
              return "done"
            }else{return "error"}
            
          }else{return "error"}
        }catch(e){return "error"}
      }
      //-------------thay đổi avatar hoặc ảnh bìa-------------
      async changeUserImg(event:string,path: string,sourceUserId:string){
        try{
          let userName = await this.userModel.findOne({_id:sourceUserId})
          
          if(event=="avatar"){
            let listImg =userName.avatarImg;
            listImg.push(path)
            await this.userModel.findByIdAndUpdate({_id:sourceUserId},{avatarImg:listImg});
            return "done"
          }else{if(event=="cover"){
            let listImg =userName.coverImg;
            listImg.push(path)
            await this.userModel.findByIdAndUpdate({_id:sourceUserId},{coverImg:listImg});
            return "done"
            }else{return "error"}
          }
        }
        catch(e){return "error"}
      }
      
}
