

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
import { TokenDocument, TokenSchema } from './scheme/token.schema';
import { MailService } from '../mail/mail.service';
var tokenUser =[]

@Injectable()
export class UserService {
  constructor( @Inject("USER_MODEL")  private userModel:Model<UserDocument> ,
  @Inject("TOKEN_MODEL") private tokenModel:Model<TokenDocument>,
  @InjectRepository(UserSql)
  private usersRepository: Repository<UserSql>,
  private jwtService: JwtService,
  private mailService: MailService
  ){}
      
      //......................................đăng kí.....................................
      async register(data:CreateUserDto){
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
        const userMongo= await this.userModel.findOne().exec();
        let user = userMongo.toObject();
          const {password,...result}=user;
          return result
      }
      
      //.....................................login..........................................
      async login(data )  {
        const isLogin=0;
        const userMongo = await this.userModel.findOne({userName:data.userName}).exec();//
        const tokensMongo = await this.tokenModel.find().exec();
        console.log(tokensMongo.length)
        if(userMongo && await bcrypt.compare(data.password,userMongo.password)){
          //importand
          if(tokensMongo){
            tokensMongo.map((tokensMongo) => tokensMongo.toObject());
            for(let i=0;i<tokensMongo.length;i++) {
            
              try{
                let dataJwt = await this.jwtService.verifyAsync(tokensMongo[i].Token) ;
                if(dataJwt) {
                  console.log(dataJwt)
                  if(data.userName=dataJwt.userName ) {
                              return "isLogin"
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
        let userMongo= await this.userModel.findOne({userName:userName}).exec();
        let user = userMongo.toObject();
         const {password,...result}=user;
         return result
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
}
