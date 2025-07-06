/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { sendDiscord } from "../modules/discord.js";
import { sendMail } from "../modules/sendMail.js";

/**
 * Forwards an error to the Discord webhook and email.
 * @param error - The error to forward.
 * @param context - The context in which the error occurred, for logging purposes.
 */
export const errorHandler = async(
  error: unknown,
  context: string,
): Promise<void> => {
  if (error instanceof Error) {
    await sendDiscord(
      `[ERROR] ${context}: ${error.message}`,
      JSON.stringify(error, null, 2),
    );
    await sendMail(
      `[ERROR] ${context}: ${error.message}`,
      JSON.stringify(error, null, 2),
    );
    return;
  }
  await sendDiscord(`[ERROR] ${context}`, JSON.stringify(error, null, 2));
  await sendMail(`[ERROR] ${context}`, JSON.stringify(error, null, 2));
};
