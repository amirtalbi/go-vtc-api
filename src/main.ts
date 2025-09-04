import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("VTC API")
    .setDescription("API de gestion de VTC - Service de transport privé")
    .setVersion("1.0.0")
    .addServer("https://go-vtc.localhost", "Production")
    .addServer("http://localhost:3000", "Development")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Entrez votre token JWT",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.getHttpAdapter().get("/", (req, res) => {
    res.redirect("/api");
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
