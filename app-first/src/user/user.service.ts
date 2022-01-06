

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
import { MessageService } from '../message/message.service';

@WebSocketGateway()
@Injectable()
export class UserService {
  constructor( @Inject("USER_MODEL")  private userModel:Model<UserDocument> ,
  @Inject("TOKEN_MODEL") private tokenModel:Model<TokenDocument>,
  // @InjectRepository(UserSql)
  // private usersRepository: Repository<UserSql>,
  private jwtService: JwtService,
  private mailService: MailService,
 
  ){}
      @WebSocketServer()
      server: Server
      //......................................đăng kí.....................................
      async register(data){
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
                      feedImg:[],
                      feedVideo:[],
                      seenTimeNotifi:"",
                      createdAt: (new Date()).toString(),
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
      // findAllSql(): Promise<UserSql[]> {
      //   return this.usersRepository.find();
      // }
      //............................................
      async findAll(): Promise<User[]> {
        return await this.userModel.find({}).exec();
      }
      async findById(id: string): Promise<any>{
        try{
          const userMongo= await this.userModel.findOne({_id:id}).exec();
          if(userMongo==null){return {}}
          else{let user = userMongo.toObject();
          const {password,...result}=user;
          return result}
          
        }catch(e){return {}}
        
      }
      //---tim bằng email---------
      async findByEmail(email:string){
        try{
          let userMongo= await this.userModel.findOne({ email:email }).exec();
          if(userMongo!=null){
            let user = userMongo.toObject();
            const {password,...result}=user;
            return result
          }else{return "error"}
        }catch(e){return "error"}
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
                  userName:data.userName,
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
          if(userMongo==null){return {}}
          else{ 
            let user = userMongo.toObject();
            const {password,...result}=user;
            return result
          }
        
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
        let result =await Promise.all([
          this.userModel.findOneAndUpdate({userName:userName},{password:hashedPassword}),
          this.deleteJwt(userName)
        ])
        if(result[0]!=null){
          return "done"
        }else{
          return "error"
        }
      }
      //-----xóa jwt khi đang dùng
      async deleteJwt(userName:string){
        var result = await this.tokenModel.deleteMany({userName:userName})
        console.log("kết quả khi tìm kiếm jwt là")
        console.log(result)
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
          var c= await this.userModel.findOne({_id:data}).exec()
          console.log("c là ")
          console.log(c)
          var a =await this.userModel.findOne({userName:data}).exec()
        
          var b= await this.userModel.findOne({email:data}).exec()
          console.log("tên người đang truy cập  "+userOwn.userName )
         
          if(a!=null||b!=null||c!=null){
            console.log("có người dùng.....")
            let find =5;
            let user
            if(a!=null){find = 0,user=a.toObject()};
            if(b!=null){find = 1,user=b.toObject()};
            if(c!=null){find = 2,user=c.toObject()};


            console.log(find)

            console.log(user)
            //nhận lời mời
            let friendConfirm=user.friendConfirm
            for(let i=0;i<userOwn.friendConfirm.length;i++){
            
              if(friendConfirm[i]==user._id.toString())
              return "had friendConfirm"
            }

            friendConfirm.push(userOwn._id.toString())

            // gửi lời mời đi
            let friendRequest=user.friendRequest
            for(let i=0;i<friendRequest.length;i++){
              if(friendRequest[i]==userOwn._id.toString())
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
            }
            if(find==1){
              await this.userModel.findOneAndUpdate({email:data},{friendConfirm:friendConfirm})
            }
            if(find==2){
              await this.userModel.findOneAndUpdate({_id:data},{friendConfirm:friendConfirm})
            }
            return user._id
          }
          else{
            return "error"
          }
        }catch(err){
          return "error"
        }
        // this.server.emit('test'," test ");
      }
      async addFrConfirm(userOwn,id:string) : Promise<any>{
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
              return user;
            }
            return "error"
          }else{return "error"}
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
            }else{return "not friend"}
            
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
      /// ------- get all fr-------------------------------------------------------------
      async getallFrAvatar(listFr:string[]){
        try{
          let listAvatarFr={}
          for(let i=0;i<listFr.length;i++){
            if(listFr[i]!=null){ 
              let result=await this.userModel.findOne({_id:listFr[i]})
              if(result!=null){
                let  avatar = "";
                if(result.avatarImg == []||result.avatarImg==undefined||result.avatarImg==null){
                   avatar="avatarNull.jpg"
                }else{avatar=result.avatarImg.pop();}
                
                const realName=result.realName
                const id=result._id.toString();
                const data= [avatar,realName,id]
                listAvatarFr[listFr[i]]=data
              }
            } 
          }
          return listAvatarFr;
        }catch(e){return "error"}
      }
      //---------------------------show messsages Fr------------
      // async getAllMesssageFr(listFr:string[],limit:number,offset:number,sourceId,targetId){
      //   try{
      //     for(let i=0;i<=listFr.length;i++){
      //       let result = await this.messageService.findLimit(limit,offset,sourceId,targetId);
      //       if(result != null){
      //         console.log(result)
      //         return result
      //       }
      //     }
      //   }catch(e){
      //     return "error"
      //   }
      // }
      async test1(id){
        var a= await this.userModel.findOne({_id:id})
        return a
      }
      //-------------------setting -----------------------
      async setting(data:{sex:string,addressTinh:string,addressDetails:string,birthDate:string,realName:string},id:string){
        
        try{
          const result = await this.userModel.findOneAndUpdate({_id:id},
            {realName:data.realName,sex:data.sex,addressTinh:data.addressTinh,addressDetails:data.addressDetails,birthDate:data.birthDate});
          console.log("kết quả khi setting");
          console.log(result)
          if(result!= null){
            return result;
          }else{return "error"}
        }catch(e){return "error"}
      }
      //---------------create new user chat-----------------
      async newHadUserChat(idFr:string,id: string,listHadMsgUser:string[]){
        try{
          console.log("fr id là")
          console.log(idFr)
          console.log(id)
          let result = await this.userModel.findOne({_id:idFr})
          if(result!=null){
            let listHadMsgFr = result.hadMessageList;
            if(listHadMsgFr.indexOf(id)<0){ 
              listHadMsgFr.push(id);
            }

            if(listHadMsgUser.indexOf(idFr)<0){
               listHadMsgUser.push(idFr);
            }
           
            let resultAll = await Promise.all([
                this.userModel.findByIdAndUpdate({_id:id},{hadMessageList:listHadMsgUser}),
                this.userModel.findByIdAndUpdate({_id:idFr},{hadMessageList:listHadMsgFr})]);
              
            if(resultAll[0]!=null&&resultAll[1]!=null){
                return "done"
            }else{return "error"}
          }else{return "error"}
        }catch(e){return "error"}
      }
      ///.............
      async deleteHadUserChat(idFr:string,idUser: string){
        try{
          console.log("fr id là")
          console.log(idFr)
          let result = await Promise.all([
              this.userModel.findOne({_id:idUser}),
            ])
          
          if(result[0]!=null){

            let listHadMsgUser = result[0].hadMessageList;

            if(listHadMsgUser.indexOf(idFr)>-1){
              
              for(let i=0;i<listHadMsgUser.length;i++){
                if(listHadMsgUser[i]==idFr){
                  listHadMsgUser.splice(i,1);
                  i--
                }
              }
              
              let resultAll = await Promise.all([
                this.userModel.findByIdAndUpdate({_id:idUser},{hadMessageList:listHadMsgUser}),  
              ]);
              
              if(resultAll[0]!=null){
                return "done"
              }else{return "error"}
            }else{return "error"}
            
          }else{return "error"}
        }catch(e){return "error"}
      }
      ///----------------------------------------
      async addOneHadUserChat(idFr:string,idUser: string){
        try{
          console.log("fr id là")
          console.log(idFr)
          let result = await Promise.all([
              this.userModel.findOne({_id:idFr}),
            ])
          
          if(result[0]!=null){

            let listHadMsgFr = result[0].hadMessageList;

            if(listHadMsgFr.indexOf(idUser)==-1){
              
              listHadMsgFr.push(idUser);
              
              let resultAll = await Promise.all([
                this.userModel.findByIdAndUpdate({_id:idFr},{hadMessageList:listHadMsgFr}),  
              ]);
              
              if(resultAll[0]!=null){
                return "done"
              }else{return "error"}
            }else{return "error"}
            
          }else{return "error"}
        }catch(e){return "error"}
      }
    
    async updateFeedImg(newFeedImg :string[],userId){
      try{
        const user = await this.userModel.findOne({_id:userId})
          if(user!=null){
            let feedImg = user.feedImg;
           let path= feedImg.concat(newFeedImg);
            console.log("Mảng img mới là ------------------------")
            console.log(path)
            await this.userModel.updateOne({_id:userId},{feedImg:path})
            return "done"
          }else{return "error"}
        
      }catch(e){return "error"}
    }
    async updateManyFeedImg(newFeedImg:string [],listUserId:string[]){
      try{
          var api = []
          listUserId.map(idUser=>api.push(this.updateFeedImg(newFeedImg,idUser)))
          await Promise.all([api])
          return "done"
      }catch(e){return "error"}
    }
    async updateFeedVideo(newFeedVideo :string[],userId){
      try{
        const user = await this.userModel.findOne({_id:userId})
          if(user!=null){
            let feedVideo = user.feedVideo;
           let path= feedVideo.concat(newFeedVideo);
            console.log("Mảng Video mới là ------------------------")
            console.log(path)
            await this.userModel.updateOne({_id:userId},{feedVideo:path})
            return "done"
          }else{return "error"}
        
      }catch(e){return "error"}
    }
    async updateManyFeedVideo(newFeedVideo:string [],listUserId:string[]){
      try{
          var api = []
          listUserId.map(idUser=>api.push(this.updateFeedVideo(newFeedVideo,idUser)))
          await Promise.all([api])
          return "done"
      }catch(e){return "error"}
    }
    async updateSeenTimeNotifi(userId,newSeenTime){
      try{
        let user =await this.userModel.findOneAndUpdate({_id:userId},{seenTimeNotifi:newSeenTime});
        if(user!=null){
          return "done"  
        }else{return "error"}
      }catch(e){return "error"}
    }
}
