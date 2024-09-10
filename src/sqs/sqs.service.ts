import { Injectable, Logger } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { awsConfig } from 'src/config/aws.config';

@Injectable()
export class SqsService {
  private sqsClient: SQSClient;
  private readonly logger = new Logger(SqsService.name);

  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {
    this.sqsClient = new SQSClient({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }

  async pollQueue() {
    const params = {
      QueueUrl: awsConfig.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    };

    try {
      const { Messages } = await this.sqsClient.send(
        new ReceiveMessageCommand(params),
      );
      if (Messages) {
        for (const message of Messages) {
          await this.handleMessage(message);
          await this.deleteMessage(message.ReceiptHandle);
        }
      }
    } catch (error) {
      this.logger.error('Error polling SQS', error);
    }
  }

  private async handleMessage(message: any) {
    this.logger.log(`Processing message: ${message.Body}`);

    const body = JSON.parse(message.Body);
    if (body.event === 'user.created') {
      const delay = this.getDelayFromHeaders(message);
      const deviceToken = 'DEVICE_TOKEN'; // Замініть на реальний токен пристрою

      setTimeout(() => {
        this.pushNotificationService.sendPushNotification(
          deviceToken,
          body.data,
        );
      }, delay);
    }
  }

  private getDelayFromHeaders(message: any): number {
    const headers = message.MessageAttributes || {};
    const delay = headers['X-Delay']?.StringValue;
    return delay ? parseInt(delay, 10) : 0;
  }

  private async deleteMessage(receiptHandle: string) {
    try {
      await this.sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: awsConfig.queueUrl,
          ReceiptHandle: receiptHandle,
        }),
      );
    } catch (error) {
      this.logger.error('Error deleting message', error);
    }
  }
}
