import { Injectable } from '@nestjs/common';
import * as bodyParser from 'body-parser';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World'
  }
}
