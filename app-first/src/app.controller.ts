import { Controller, Get, Param, ParseIntPipe, Post, Query, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }
  //
  @Post()
  create(@Req() req): string {
    console.log(req.body);
    return 'This action adds a new cat';
  }
  
  // @Get("/:id")
  // async findOne(@Param('id', ParseIntPipe) id: number) {
  //   return id;
  // }
}
