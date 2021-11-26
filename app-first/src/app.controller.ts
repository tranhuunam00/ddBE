import { Controller, Get, Param, ParseIntPipe, Post, Query, Render, Req, Session, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }
  @Get("save")
  save(@Req() request: Request){
    request.session["hihi"]=  "oki"
  }
  @Get("ss")
  findAll(@Session() session: Record<string, any>) {
    return session["hihi"]
  }
  //
  @Post()
  create(@Req() req): string {
    console.log(req.body);
    return 'This action adds a new cat';
  }
  @Get(":roomId/messages")
  async findMessages(
    @Param("roomId", ParseIntPipe) roomId: number,
    @Query("limit", ParseIntPipe) limit: number = 10,
   
  ) {
  console.log("roomId++"+roomId);
  console.log("limit++"+limit);

    return "hihi";
  }
  
  
}

