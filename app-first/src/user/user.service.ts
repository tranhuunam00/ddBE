

import { Injectable, Inject, Module, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './scheme/user.schema';
import { UserI } from './interfaces/user.interface';
import { UserModule } from './user.module';
import { UserRepository } from './user.repository';
import { UserSql } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()

export class UserService {
  
  
  constructor( @Inject("USER_MODEL")  private userModel:Model<UserDocument>,
  @InjectRepository(UserSql)
  private usersRepository: Repository<UserSql>,){}
      //đăng kí
      async register(data:CreateUserDto){
        const userMongo =await this.userModel.findOne({userName:data.userName}).exec();
        const user = userMongo?userMongo.toObject():userMongo;
          console.log(user)
          if(user==null){
            console.log("dang ki oki.....");
            let newUser=
                    new this.userModel({
                      ...data,
                      createdAt: new Date(),
                    })
                    return await newUser.save()
          }
          else{
            console.log("đang ki that bai ....")
            return null;
          }  
      
       
      }
      //sql.......................................
      findAllSql(): Promise<UserSql[]> {
        return this.usersRepository.find();
      }
      //............................................
      async findAll(): Promise<User[]> {
        return await this.userModel.find({}).exec();
      }
      
      async findOne(id: string): Promise<User> {
        return await this.userModel.findById({_id:id}).exec();
      }
      async login(data): Promise<object> {
        const userMongo = await this.userModel.findOne({userName:data.userName}).exec();
        if(userMongo&&userMongo.password === data.password){
          //importand
          let user = userMongo.toObject();
          const {password,...result}=user;
          console.log(result);
          return user;
        }
          
        return null
      }
      async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        return await this.userModel.findByIdAndUpdate({_id:id},updateUserDto).exec();
      }

      async delete(id: string): Promise<User> {
        return await this.userModel.findByIdAndDelete({_id:id}).exec();
      }
}
