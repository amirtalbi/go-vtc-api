import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyUser(email: string, token: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: "Vérification de votre compte",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #333;">Vérifiez votre compte</h1>
          <p style="font-size: 16px;">
            Votre code de vérification est : <strong>${token}</strong>
          </p>
          <p style="color: #555;">
            Merci de votre confiance !
          </p>
        </div>
      `,
    });
  }
}
