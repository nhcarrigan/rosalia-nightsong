/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

export const logSchema = {
  schema: {
    body: {
      properties: {
        application: { type: "string" },
        level:       { type: "string" },
        message:     { type: "string" },
      },
      type: "object",
    },
  },
};
