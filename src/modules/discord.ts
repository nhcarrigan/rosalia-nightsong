/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

/**
 * Sends a Discord webhook notification.
 * @param subject - The subject of the email.
 * @param body - The text content of the email.
 */
export const sendDiscord = async(
  subject: string,
  body: string,
): Promise<void> => {
  await fetch(`https://discord.com/api/v10/channels/1355232348840394785/messages`, {
    body: JSON.stringify({
      components: [
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention -- Needs to match Discord's structure.
          accent_color: 15_418_782,
          components:   [
            {
              content: `# ${subject}`,
              type:    10,
            },
            {
              divider: true,
              spacing: 1,
              type:    14,
            },
            {
              content: body,
              type:    10,
            },
          ],
          spoiler: false,
          type:    17,
        },
      ],
      flags: 32_768,
    }),
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Needs to match Discord's structure.
      "Authorization": `Bot ${process.env.DISCORD_TOKEN ?? ""}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Needs to match Discord's structure.
      "Content-Type":  "application/json",
    },
    method: "POST",
  });
};
