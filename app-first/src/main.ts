import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { LoggingInterceptor } from './core/interceptor/logger';
import * as bodyParser from 'body-parser';

import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { NestExpressApplication } from '@nestjs/platform-express';
declare const module: any;
async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.useStaticAssets(join(__dirname, '..', 'src/public'));
  app.setBaseViewsDir(join(__dirname, '..', 'src/views'));
  app.setViewEngine('hbs');
  app.enableCors();
  await app.listen(3000);
  // if (module.hot) {
  //   module.hot.accept();
  //   module.hot.dispose(() => app.close());
  // }
}
bootstrap();
