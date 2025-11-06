import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { apiReference } from '@scalar/nestjs-api-reference'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Smartbill Trendyol Integration')
    .setDescription('Integrates Smartbill and Trendyol')
    .setVersion('1.0')
    .addTag('Smartbill')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerUiEnabled: false,
  });
  app.use(
    '/reference',
    apiReference({
      content: document,
    })
  )
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
