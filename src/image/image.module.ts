import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomerModule } from '../customer/customer.module';
import { CameraModule } from '../camera/camera.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [PrismaModule, CustomerModule, CameraModule, HistoryModule],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService]
})
export class ImageModule {}