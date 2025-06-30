import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Required: only for the webhook route
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
