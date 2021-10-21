import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import {  User, UserSchema } from './scheme/user.schema';
import { UserController } from './user.controller';
import { usersProviders } from './user.providers';
import { UserService } from './user.service';

import { UserSql } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserSql]),DatabaseModule,MongooseModule.forFeature([{name:User.name,schema:UserSchema}])],
  controllers: [UserController],
  providers: [UserService,...usersProviders,],
  exports: [UserService]
})
export class UserModule {
  // constructor(private usersService: UserService) {}
}
