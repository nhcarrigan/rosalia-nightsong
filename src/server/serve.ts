/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import fastify from "fastify";
import { auth } from "../modules/auth.js";
import { sendMail } from "../modules/sendMail.js";
import { errorSchema } from "../schemas/errorSchema.js";
import { logSchema } from "../schemas/logSchema.js";
import { uptimeSchema } from "../schemas/uptimeSchema.js";
import type { Error } from "../interfaces/error.js";
import type { Log } from "../interfaces/log.js";
import type { Uptime } from "../interfaces/uptime.js";

const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Rosalia Nightsong</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A basic web server that allows us to pipe logs and errors from our applications into our inbox." />
    <script src="https://cdn.nhcarrigan.com/headers/index.js" async defer></script>
  </head>
  <body>
    <main>
    <h1>Rosalia Nightsong</h1>
    <section>
      <p>A basic web server that allows us to pipe logs and errors from our applications into our inbox.</p>
    </section>
    <section>
        <h2>Links</h2>
        <p>
            <a href="https://git.nhcarrigan.com/nhcarrigan/rosalia-nightsong">
                <i class="fa-solid fa-code"></i> Source Code
            </a>
        </p>
        <p>
            <a href="https://docs.nhcarrigan.com/">
                <i class="fa-solid fa-book"></i> Documentation
            </a>
        </p>
        <p>
            <a href="https://chat.nhcarrigan.com">
                <i class="fa-solid fa-circle-info"></i> Support
            </a>
        </p>
    </section>
    </main>
  </body>
</html>`;

/**
 * Starts up the server to receive events.
 */
// eslint-disable-next-line max-lines-per-function -- This function is long because it is setting up a server.
export const instantiateServer = (): void => {
  try {
    const server = fastify({
      logger: false,
    });

    server.get("/", (_request, response) => {
      response.header("Content-Type", "text/html");
      response.send(html);
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Log }>("/log", logSchema, async(request, response) => {
      if (!auth(request)) {
        await response.status(401).send({ success: false });
        return;
      }
      const { application, level, message } = request.body;
      await sendMail(`[${level}]: ${application}`, message);
      await response.status(200).send({ success: true });
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Error }>(
      "/error",
      errorSchema,
      async(request, response) => {
        if (!auth(request)) {
          await response.status(401).send({ success: false });
          return;
        }
        const { application, context, stack, message } = request.body;
        await sendMail(`[ERROR]: ${context} - ${application}`, `${message}\n\n${stack}`);
        await response.status(200).send({ success: true });
      },
    );

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Uptime }>(
      "/uptime",
      uptimeSchema,
      async(request, response) => {
        if (!auth(request)) {
          await response.status(401).send({ success: false });
          return;
        }
        const { application, message } = request.body;
        await sendMail(`[UPTIME]: ${application}`, message);
        await response.status(200).send({ success: true });
      },
    );

    server.listen({ port: 5003 }, (error) => {
      const application = "Alert Server";
      if (error) {
        const { message, stack } = error;
        const context = "Server Startup";
        void sendMail(`[ERROR]: ${context} - ${application}`, `${message}\n\n${String(stack)}`);
        return;
      }
      const level = "debug";
      const message = `Server listening on port 5003.`;
      void sendMail(`[${level}]: ${application}`, message);
    });
  } catch (error) {
    const application = "Alert Server";
    const context = "Server Startup";
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Totally being lazy.
    const { message, stack } = error as Error;
    void sendMail(`[ERROR]: ${context} - ${application}`, `${message}\n\n${stack}`);
  }
};
