/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

export const errorSchema = {
  schema: {
    body: {
      properties: {
        application: { type: "string" },
        context:     { type: "string" },
        message:     { type: "string" },
        stack:       { type: "string" },
      },
      type: "object",
    },
  },
};
