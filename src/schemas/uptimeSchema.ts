/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

export const uptimeSchema = {
  schema: {
    body: {
      properties: {
        application: { type: "string" },
        message:     { type: "string" },
      },
      type: "object",
    },
  },
};
