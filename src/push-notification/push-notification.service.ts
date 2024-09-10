import { Injectable, Logger } from '@nestjs/common';
import * as apn from 'apn';

@Injectable()
export class PushNotificationService {
  private apnProvider: apn.Provider;
  private readonly logger = new Logger(PushNotificationService.name);

  constructor() {
    this.apnProvider = new apn.Provider({
      token: {
        key: process.env.APN_KEY_PATH,
        keyId: process.env.APN_KEY_ID,
        teamId: process.env.APN_TEAM_ID,
      },
      production: false,
    });
  }

  async sendPushNotification(deviceToken: string, payload: any) {
    const notification = new apn.Notification();
    notification.alert = payload.alert;
    notification.badge = payload.badge;
    notification.sound = payload.sound;
    notification.topic = process.env.APN_BUNDLE_ID;

    try {
      const result = await this.apnProvider.send(notification, deviceToken);
      this.logger.log(`Notification sent: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error('Error sending push notification', error);
    }
  }
}
