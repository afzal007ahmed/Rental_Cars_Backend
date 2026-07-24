import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Images } from './models/image.model';

@Module({
  imports: [SequelizeModule.forFeature([Images])],
})
export class ImagesModule {}
