import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SqsService } from './sqs/sqs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sqsService = app.get(SqsService);

  setInterval(() => sqsService.pollQueue(), 10000);

  await app.listen(3000);
}
bootstrap();
