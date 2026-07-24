import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from '../../config';
import { Bookings } from '../bookings/models/bookings.model';
import { User } from '../user/models/user.model';
import { Vehicle } from '../vehicle/models/vehicle.model';
import { Location } from '../location/models/location.model';
import { ProcessedEvent } from '../processed-events/models/processed-event.model';

interface KafkaMeta {
  topic: string;
  partition: number;
  offset: string;
}

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });

  async sendBookingConfirmation(
    bookingId: string,
    meta: KafkaMeta,
  ): Promise<void> {
    // Store event record with pending status before any processing
    const eventRecord = await ProcessedEvent.create({
      event_id: `${meta.topic}-${meta.partition}-${meta.offset}`,
      service_name: 'email-service',
      status: 'pending',
    });

    try {
      const booking = await Bookings.findOne({
        where: { id: bookingId },
        include: [
          { model: Vehicle },
          { model: User },
          { model: Location, as: 'pickupLocation' },
          { model: Location, as: 'dropLocation' },
        ],
      });

      if (!booking) {
        await eventRecord.update({
          status: 'failed',
          error: 'Booking not found',
        });
        return;
      }

      // status remains 'pending' while processing

      const b = booking.dataValues;

      let toEmail: string;
      let recipientName: string;

      if (b.guest_email) {
        toEmail = b.guest_email;
        recipientName = b.guest_name || 'Guest';
      } else if (b.user_id) {
        const user = await User.findOne({ where: { id: b.user_id } });
        if (!user) {
          await eventRecord.update({
            status: 'failed',
            error: 'User not found',
          });
          return;
        }
        toEmail = user.dataValues.email as string;
        recipientName = user.dataValues.name as string;
      } else {
        await eventRecord.update({
          status: 'failed',
          error: 'No recipient found',
        });
        return;
      }

      const vehicle = b.vehicle?.dataValues ?? {};
      const pickup = b.pickup_location?.dataValues ?? {};
      const drop = b.drop_location?.dataValues ?? null;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2c3e50;">Booking Confirmed!</h2>
          <p>Hi <strong>${recipientName}</strong>, your booking has been confirmed. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">Booking ID</td>
              <td style="padding: 10px;">${b.id}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Vehicle</td>
              <td style="padding: 10px;">${vehicle.brand ?? ''} ${vehicle.name ?? ''}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">Pickup Location</td>
              <td style="padding: 10px;">${pickup.name ?? ''}, ${pickup.city ?? ''}, ${pickup.state ?? ''}</td>
            </tr>
            ${
              drop
                ? `
            <tr>
              <td style="padding: 10px; font-weight: bold;">Drop Location</td>
              <td style="padding: 10px;">${drop.name}, ${drop.city}, ${drop.state}</td>
            </tr>`
                : ''
            }
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">From</td>
              <td style="padding: 10px;">${b.start_date} at ${b.start_time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">To</td>
              <td style="padding: 10px;">${b.to_date} at ${b.end_time}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">Total Price</td>
              <td style="padding: 10px;">₹${b.total_price}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Status</td>
              <td style="padding: 10px; color: #27ae60; font-weight: bold;">${b.status}</td>
            </tr>
          </table>

          <p style="margin-top: 24px; color: #7f8c8d; font-size: 13px;">
            Thank you for booking with us. If you have any questions, reply to this email.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"Rental Cars" <${config.gmail.user}>`,
        to: toEmail,
        subject: `Booking Confirmed — ${vehicle.brand} ${vehicle.name}`,
        html,
      });

      await eventRecord.update({ status: 'success' });
    } catch (err) {
      await eventRecord.update({
        status: 'failed',
        error: err?.message ?? 'Unknown error',
      });
    }
  }
}
