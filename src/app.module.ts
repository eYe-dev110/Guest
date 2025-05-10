import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CameraModule } from './camera/camera.module';
import { ConstantModule } from './constant/constant.module';
import { CustomerModule } from './customer/customer.module';
import { HistoryModule } from './history/history.module';
import { ImageModule } from './image/image.module';
import { RoleModule } from './role/role.module';
import { SessionModule } from './session/session.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '..', 'images'),  // Dynamically resolve the absolute path
      serveRoot: '/images/',  // The URL where images will be served from
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CameraModule,
    ConstantModule,
    CustomerModule,
    HistoryModule,
    ImageModule,
    RoleModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
