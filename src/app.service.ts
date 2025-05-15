import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getPut():string{
    return 'Welcome to using the put method'
  }
  
}
