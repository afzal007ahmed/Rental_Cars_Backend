import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('booking-completed')
  async sendEmail(@Payload() event: any) {
    await this.emailService.sendBookingConfirmation(event.booking_id);
  }
}
