import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/user.dto";
import { User, UserDocument } from "./scheme/user.schema";
import { UserService } from "./user.service";


@Injectable()
export  class UserRepository{
    constructor( @Inject("USER_MODEL")  private userModel:Model<UserDocument>){}
    async create(createUserDto: CreateUserDto): Promise<User> {
        let newUser=
        new this.userModel({
          ...createUserDto,
          createdAt: new Date(),
        })
        return await newUser.save()
      }
      async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
      }
    
      async findOne(id: string): Promise<User> {
        return await this.userModel.findById(id).exec();
      }
      // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      //   return await this.userModel.findByIdAndUpdate(id, updateUserDto).exec();
      // }
    
      async delete(id: string): Promise<User> {
        return await this.userModel.findByIdAndDelete(id).exec();
      }
}