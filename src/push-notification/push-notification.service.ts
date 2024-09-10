import { Injectable } from '@nestjs/common';
import * as apn from 'apn';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PushNotificationService {
  private apnProvider: apn.Provider;

  constructor() {
    this.apnProvider = new apn.Provider({
      token: {
        key: process.env.APNS_KEY_PATH,
        keyId: process.env.APNS_KEY_ID,
        teamId: process.env.APNS_TEAM_ID,
      },
      production: false,
    });
  }

  async sendPushNotification(deviceToken: string, payload: any) {
    const notification = new apn.Notification({
      alert: {
        title: 'New User Registered',
        body: `User ${payload.email} has registered.`,
      },
      topic: process.env.APNS_APP_BUNDLE_ID,
    });

    try {
      const result = await this.apnProvider.send(notification, deviceToken);
      console.log('Push notification sent:', result);
    } catch (error) {
      console.error('Error sending push notification', error);
    }
  }
}
