/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
import { webcrypto } from "node:crypto";
import { verify } from "discord-verify/node";
import { applicationData } from "../config/applicationData.js";
import { sendDiscord } from "./discord.js";
import type { Entitlement } from "../interfaces/entitlement.js";
import type { FastifyRequest } from "fastify";

/**
 * Validates that the webhook request is from Discord by checking the signature.
 * @param request - The Fastify request object containing the webhook data.
 * @returns A boolean indicating whether the webhook signature is valid.
 */
export const validateWebhook = async(
  // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
  request: FastifyRequest<{ Body: Entitlement; Headers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Header must be formatted for Fastify.
    "x-signature-ed25519":   string;
    // eslint-disable-next-line @typescript-eslint/naming-convention -- Header must be formatted for Fastify.
    "x-signature-timestamp": string;
  }; }>,
): Promise<boolean> => {
  const { application_id: applicationId } = request.body;
  const appData = applicationData[applicationId];
  if (appData === undefined) {
    void sendDiscord(`[NOTIFICATION]: Invalid Application ID`, `Received an entitlement event for an invalid application ID: ${applicationId}`);
    return false;
  }
  const signature = request.headers["x-signature-ed25519"];
  const timestamp = request.headers["x-signature-timestamp"];
  const rawBody = JSON.stringify(request.body);
  const isValid = await verify(
    rawBody,
    signature,
    timestamp,
    appData.key,
    webcrypto.subtle,
  );
  if (!isValid) {
    void sendDiscord(
      `[NOTIFICATION]: Invalid Webhook Signature`,
      `Received an entitlement event with an invalid signature.\nApplication ID: ${applicationId}\nSignature: ${signature}\nTimestamp: ${timestamp}\nRaw Body: ${rawBody}`,
    );
  }
  return isValid;
};
