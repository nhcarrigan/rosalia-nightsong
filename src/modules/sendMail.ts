/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import { createTransport } from "nodemailer";
// eslint-disable-next-line @typescript-eslint/naming-convention -- This is a type import.
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

/**
 * Sends an email.
 * @param subject - The subject of the email.
 * @param body - The text content of the email.
 */
export const sendMail = async(subject: string, body: string): Promise<void> => {
  const options: SMTPTransport["options"] = {
    auth: {
      pass: process.env.EMAIL_PASSWORD ?? "",
      type: "login",
      user: "noreply@nhcarrigan.com",
    },
    host:   "mail.nhcarrigan.com",
    port:   587,            // UPDATED: Standard port for STARTTLS
    secure: false,          // UPDATED: false means "Connect then upgrade via STARTTLS"
  };
  const defaults: SMTPTransport["options"] = {
    from: "noreply@nhcarrigan.com",
    to:   "logs@nhcarrigan.com",
  };
  const transport = createTransport(options, defaults);

  await transport.sendMail({
    subject: subject,
    text:    body,
  });
};