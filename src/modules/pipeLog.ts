/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

const priority: Record<string, number> = {
  debug: 0,
  error: 3,
  info:  1,
  warn:  2,
};

/**
 * Pipes a log message to the Gotify server.
 * @param appName - The name of the application.
 * @param message - The message to log.
 * @param level - The level of the log, used for priority.
 */
const pipeLog = async(
  appName: string,
  message: string,
  level: string,
): Promise<void> => {
  const logToken = process.env.LOG_TOKEN;
  if (logToken === undefined) {
    return;
  }
  await fetch(`https://logs.nhcarrigan.com/message?token=${logToken}`, {
    body: JSON.stringify({
      message:  message,
      priority: priority[level] ?? priority.debug,
      title:    appName,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Content-Type": "application/json",
    },
    method: "POST",
  });
};

/**
 * Pipes a log message to the Gotify server.
 * @param appName - The name of the application.
 * @param message - The message to log.
 * @param level - The level of the log, used for priority.
 */
const pipeError = async(
  appName: string,
  message: string,
  level: string,
): Promise<void> => {
  const logToken = process.env.ERROR_LOG_TOKEN;
  if (logToken === undefined) {
    return;
  }
  await fetch(`https://logs.nhcarrigan.com/message?token=${logToken}`, {
    body: JSON.stringify({
      message:  message,
      priority: priority[level] ?? priority.debug,
      title:    appName,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Content-Type": "application/json",
    },
    method: "POST",
  });
};

export { pipeError, pipeLog };
