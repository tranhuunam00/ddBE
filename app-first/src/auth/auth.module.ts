import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { DatabaseModule } from '../database/database.module';


@Module({
  imports:[UserModule,DatabaseModule],
  controllers: [AuthController],
  
})
export class AuthModule {}
