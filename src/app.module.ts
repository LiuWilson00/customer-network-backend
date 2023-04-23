import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PolicyholderModule} from './feature/policyholder/policyholder.module';
import {PolicyholderEntity} from './common/models/policyholder.entity';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({path: '.env.prod'});
} else {
  dotenv.config();
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [PolicyholderEntity],
      synchronize: true,
    }),
    PolicyholderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
