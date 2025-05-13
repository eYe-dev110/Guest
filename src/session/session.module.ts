import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomerModule } from '../customer/customer.module';
import { HistoryModule } from 'src/history/history.module';
import { ImageModule } from 'src/image/image.module';
import { CameraModule } from 'src/camera/camera.module';

@Module({
  imports: [PrismaModule, CustomerModule, HistoryModule, ImageModule, CameraModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}