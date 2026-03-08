import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  // Welcome Email
  async sendWelcomeEmail(email: string, username: string) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to YatraSecure! 🎉',
      template: './welcome',
      context: {
        username,
        appUrl,
      },
    });
  }

  // Join Request Notification (to Admin)
  async sendJoinRequestNotification(
    adminEmail: string,
    adminName: string,
    tripName: string,
    requesterName: string,
  ) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';

    await this.mailerService.sendMail({
      to: adminEmail,
      subject: `New Join Request for ${tripName}`,
      template: './join-request',
      context: {
        adminName,
        tripName,
        requesterName,
        appUrl,
      },
    });
  }

  // Join Request Accepted (to User)
  async sendJoinRequestAccepted(
    userEmail: string,
    username: string,
    tripName: string,
    tripId: string,
  ) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    const tripUrl = `${appUrl}/trips/${tripId}`;

    await this.mailerService.sendMail({
      to: userEmail,
      subject: `🎉 Your request to join ${tripName} was accepted!`,
      template: './request-accepted',
      context: {
        username,
        tripName,
        tripUrl,
      },
    });
  }

  // Join Request Rejected (to User)
  async sendJoinRequestRejected(
    userEmail: string,
    username: string,
    tripName: string,
  ) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: `Update on your request for ${tripName}`,
      template: './request-rejected',
      context: {
        username,
        tripName,
      },
    });
  }

  // Trip Starting Soon Reminder
  async sendTripReminder(
    userEmail: string,
    username: string,
    tripName: string,
    startDate: Date,
    tripId: string,
  ) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    const tripUrl = `${appUrl}/trips/${tripId}`;

    await this.mailerService.sendMail({
      to: userEmail,
      subject: `⏰ Reminder: ${tripName} starts soon!`,
      template: './trip-reminder',
      context: {
        username,
        tripName,
        startDate: startDate.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        tripUrl,
      },
    });
  }

  // Emergency SOS Alert
  async sendSOSAlert(
    contactEmail: string,
    userName: string,
    location: string,
    tripName: string,
  ) {
    await this.mailerService.sendMail({
      to: contactEmail,
      subject: '🚨 EMERGENCY SOS ALERT - YatraSecure',
      template: './sos-alert',
      context: {
        userName,
        location,
        tripName,
        timestamp: new Date().toLocaleString('en-IN'),
      },
    });
  }

  // Password Reset Email
  async sendPasswordResetEmail(email: string, username: string, resetToken: string) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your YatraSecure Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${username}</strong>,</p>
              
              <p>We received a request to reset your YatraSecure password. Click the button below to reset it:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
              </div>
              
              <p><strong>Didn't request this?</strong><br>
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br>
              <strong>YatraSecure Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>© 2026 YatraSecure. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  // Email Verification Email
  async sendVerificationEmail(email: string, username: string, verificationToken: string) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your YatraSecure Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${username}</strong>,</p>
              
              <p>Welcome to YatraSecure! 🎉</p>
              
              <p>Please verify your email address to activate your account and unlock all features:</p>
              
              <center>
                <a href="${verifyUrl}" class="button">Verify Email Address</a>
              </center>
              
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                ${verifyUrl}
              </p>
              
              <div class="warning">
                <strong>⏰ Important:</strong> This verification link will expire in <strong>24 hours</strong>.
              </div>
              
              <p><strong>Didn't sign up?</strong><br>
              If you didn't create an account, please ignore this email.</p>
              
              <p>Happy traveling!<br>
              <strong>YatraSecure Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>© 2026 YatraSecure. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}
