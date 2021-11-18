import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import path, { join } from 'path';
import { LoggingInterceptor } from './core/interceptor/logger';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { NestExpressApplication } from '@nestjs/platform-express';
import *as express from 'express';
import fastifyCookie from 'fastify-cookie';
import * as session from 'express-session';
declare const module: any;
async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(bodyParser.urlencoded({ extended: false }));
  //HBS.........................
  app.useStaticAssets(join(__dirname, '..', 'src/public'));
  app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
  app.use(cookieParser());
  app.setViewEngine('hbs');
  app.enableCors({
    credentials:true
  });//UPLOAD ẢNH.......
  app.use("/upload",express.static(join(__dirname,"..",'../upload')));

  console.log(__dirname)
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  await app.listen(3000);
  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
}
bootstrap();
