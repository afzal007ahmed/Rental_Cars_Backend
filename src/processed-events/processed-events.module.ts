import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProcessedEvent } from './models/processed-event.model';

@Module({
  imports: [SequelizeModule.forFeature([ProcessedEvent])],
})
export class ProcessedEventsModule {}
