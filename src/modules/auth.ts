/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import type { FastifyRequest } from "fastify";

/**
 * Confirms that the auth header has been set to the correct
 * token.
 * @param request - The incoming Fastify request.
 * @returns Whether the request is authenticated.
 */
export const auth = (request: FastifyRequest): boolean => {
  if (request.headers.authorization === undefined) {
    return false;
  }
  const token = request.headers.authorization;
  if (token !== process.env.API_AUTH) {
    return false;
  }
  return true;
};
