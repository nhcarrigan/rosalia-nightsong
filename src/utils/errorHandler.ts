/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { pipeError, pipeLog } from "../modules/pipeLog.js";
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
    await pipeLog(
      "Rosalia Nightsong",
      `[ERROR] ${context}: ${error.message}`,
      "error",
    );
    await pipeError({
      appName: "Rosalia Nightsong",
      level:   "error",
      message: error.message,
      scope:   context,
      stack:   error.stack ?? "No stack trace available",
    });
    await sendMail(
      `[ERROR] ${context}: ${error.message}`,
      JSON.stringify(error, null, 2),
    );
    return;
  }
  await pipeLog(
    "Rosalia Nightsong",
    `[ERROR] ${context}: ${JSON.stringify(error)}`,
    "error",
  );
  await pipeError({
    appName: "Rosalia Nightsong",
    level:   "error",
    message: JSON.stringify(error),
    scope:   context,
    stack:   "No stack trace available (not an Error instance)",
  });
  await sendMail(`[ERROR] ${context}`, JSON.stringify(error, null, 2));
};
