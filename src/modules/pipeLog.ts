/**
 * @copyright NHCarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

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
  await fetch(`https://telemetry.nhcarrigan.com/api/33kzMoHcYaaEyqCFsauKPhTvEtx/default/_json`, {
    body: JSON.stringify({
      job:   appName,
      level: level,
      log:   message,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Authorization": `Basic ${process.env.TELEMETRY_TOKEN ?? ""}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Content-Type":  "application/json",
    },
    method: "POST",
  });
};

/**
 * Options for the pipeError function.
 */
interface PipeErrorOptions {

  /**
   * The name of the application.
   */
  appName: string;

  /**
   * The level of the log, used for priority.
   */
  level: string;

  /**
   * The message to log.
   */
  message: string;

  /**
   * The context in which the error occurred.
   */
  scope: string;

  /**
   * The error stack trace.
   */
  stack: string;
}

/**
 * Options for creating the Discord error payload.
 */
interface DiscordErrorPayloadOptions {

  /**
   * The name of the application.
   */
  appName: string;

  /**
   * The error message.
   */
  message: string;

  /**
   * The context in which the error occurred.
   */
  scope: string;

  /**
   * The error stack trace.
   */
  stack: string;
}

/**
 * Creates a Media Container with error header image.
 * @param appName - The name of the application.
 * @returns The Media Container component.
 */
const createMediaContainer = (appName: string): Record<string, unknown> => {
  return {
    accessory: {
      description: null,
      media:       {
        url: "https://cdn.nhcarrigan.com/error.jpeg",
      },
      spoiler: false,
      type:    11,
    },
    components: [
      {
        content: `# Error in ${appName}`,
        type:    10,
      },
    ],
    type: 9,
  };
};

/**
 * Creates a Discord ComponentsV2 payload with a container layout
 * for beautiful error notifications.
 * @param options - The error details for the payload.
 * @returns The Discord message payload.
 */
const createDiscordErrorPayload = (
  options: DiscordErrorPayloadOptions,
): Record<string, unknown> => {
  const { appName, message, scope, stack } = options;
  return {
    components: [
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Discord API property.
        accent_color: 15_277_667,
        components:   [
          createMediaContainer(appName),
          {
            divider: true,
            spacing: 1,
            type:    14,
          },
          {
            content: `## Scope\n\n${scope}`,
            type:    10,
          },
          {
            divider: true,
            spacing: 1,
            type:    14,
          },
          {
            content: `## Error Details\n\n### Message\n\n\`\`\`\n${message}\n\`\`\`\n\n### Stack\n\n\`\`\`\n${stack}\n\`\`\``,
            type:    10,
          },
        ],
        spoiler: false,
        type:    17,
      },
    ],
    flags: 32_768,
  };
};

/**
 * Pipes a log message to the Gotify server. Also notifies
 * Naomi in Discord.
 * @param options - The error details including app name, level, message, scope, and stack trace.
 */
const pipeError = async(options: PipeErrorOptions): Promise<void> => {
  const { appName, level, message, scope, stack } = options;
  const logToken = process.env.ERROR_LOG_TOKEN;
  if (logToken === undefined) {
    return;
  }
  await fetch(`https://telemetry.nhcarrigan.com/api/33kzMoHcYaaEyqCFsauKPhTvEtx/default/_json`, {
    body: JSON.stringify({
      job:   appName,
      level: level,
      log:   message,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Authorization": `Basic ${process.env.TELEMETRY_TOKEN ?? ""}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Content-Type":  "application/json",
    },
    method: "POST",
  });
  await fetch(`https://discord.com/api/v10/channels/1474606829504954511/messages`, {
    body: JSON.stringify(
      createDiscordErrorPayload({ appName, message, scope, stack }),
    ),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Authorization": `Bot ${process.env.DISCORD_TOKEN ?? ""}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
      "Content-Type":  "application/json",
    },
    method: "POST",
  });
};

export { pipeError, pipeLog };
