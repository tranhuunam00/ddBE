import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, Res, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { UserI } from './interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ValidationPipe } from '../core/validate/validate.pipe';
import { Response,Request } from 'express';
import { RolesGuard } from '../core/guard/user.guard';
import { LoggingInterceptor } from 'src/core/interceptor/logger';
import { User } from './scheme/user.schema';

@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get('/:id')
  // getHello(@Req() req:Request): string {
  //   return req.params.id;
  // }
  @Post("/register")
  async create(@Body()   createUserDto :CreateUserDto, @Req() req){
    
    const result= await this.userService.register(createUserDto);
    console.log(result);
    if(result!=null){
      return "chuyển trang"
    }
    return "đăng kí thất bại"
  }
  //login
  @Post("/login")
  async hehe( @Req() req){
    const result =await this.userService.login(req.body)
    if (result){return "chuyển trang"}
    else {return "đăng nhập thất bại"}
  }

  @Get()
  async index() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.userService.findOne(id);
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
