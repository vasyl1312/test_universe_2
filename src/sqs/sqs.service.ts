import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { awsConfig } from '../config/aws.config';
import { PushNotificationService } from '../push-notification/push-notification.service';

@Injectable()
export class SqsService {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string = awsConfig.queueUrl;
  private readonly logger = new Logger(SqsService.name);

  constructor(private pushNotificationService: PushNotificationService) {
    this.sqsClient = new SQSClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });

    this.pollMessages();
  }

  private async pollMessages() {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      });

      const response = await this.sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          try {
            const event = JSON.parse(message.Body);
            const delay = event.headers?.['X-Delay'] || 0;

            if (delay) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }

            await this.handleEvent(event);

            await this.sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle,
              }),
            );
          } catch (error) {
            this.logger.error('Error handling message', error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error receiving messages', error);
    } finally {
      this.pollMessages();
    }
  }

  private async handleEvent(event: any) {
    if (event.event === 'user.created') {
      const { email, deviceToken } = event.data;
      await this.pushNotificationService.sendPushNotification(deviceToken, {
        alert: `Welcome, ${email}!`,
        badge: 1,
        sound: 'default',
      });
    }
  }
}
