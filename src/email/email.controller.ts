import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('booking-completed')
  async sendEmail(@Payload() event: any, @Ctx() context: KafkaContext) {
    const { offset } = context.getMessage();
    const partition = context.getPartition();
    const topic = context.getTopic();

    await this.emailService.sendBookingConfirmation(event.booking_id, {
      topic,
      partition,
      offset,
    });
  }
}
