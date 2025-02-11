/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import { createClient } from "matrix-js-sdk";
import { instantiateServer } from "./server/serve.js";
import type { Logger } from "matrix-js-sdk/lib/logger.js";

const logger: Logger = {
  debug: () => {
    return null;
  },
  error: () => {
    return null;
  },
  getChild: () => {
    return logger;
  },
  info: () => {
    return null;
  },
  trace: () => {
    return null;
  },
  warn: () => {
    return null;
  },
};

const client = createClient({
  accessToken: process.env.MATRIX_ACCESS_TOKEN ?? "",
  baseUrl:     "https://matrix.nhcarrigan.com",
  logger:      logger,
  userId:      "@alerts:matrix.nhcarrigan.com",
});

await client.startClient({ initialSyncLimit: 10 });
instantiateServer(client);
