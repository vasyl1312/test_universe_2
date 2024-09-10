import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqsService } from './sqs/sqs.service';
import { PushNotificationService } from './push-notification/push-notification.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SqsService, PushNotificationService],
})
export class AppModule {}
