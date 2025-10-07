/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */
/* eslint-disable max-lines -- this is kinda the main file. */

import fastify from "fastify";
import rawBody from "fastify-raw-body";
// eslint-disable-next-line @typescript-eslint/naming-convention -- We are importing a class.
import StripeApp from "stripe";
import { applicationData } from "../config/applicationData.js";
import { auth } from "../modules/auth.js";
import { pipeError, pipeLog } from "../modules/pipeLog.js";
import { sendMail } from "../modules/sendMail.js";
import { validateWebhook } from "../modules/validateWebhook.js";
import { errorSchema } from "../schemas/errorSchema.js";
import { logSchema } from "../schemas/logSchema.js";
import { uptimeSchema } from "../schemas/uptimeSchema.js";
import { errorHandler } from "../utils/errorHandler.js";
import type { Entitlement } from "../interfaces/entitlement.js";
import type { Error } from "../interfaces/error.js";
import type { Log } from "../interfaces/log.js";
import type { Metric } from "../interfaces/metric.js";
import type { Uptime } from "../interfaces/uptime.js";

const stripe = new StripeApp(process.env.STRIPE_SECRET_KEY ?? "");

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
    <img src="https://cdn.nhcarrigan.com/new-avatars/rosalia-full.png" width="250" alt="Rosalia" />
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
export const instantiateServer = async(): Promise<void> => {
  try {
    const server = fastify({
      logger: false,
    });

    server.get("/", (_request, response) => {
      response.header("Content-Type", "text/html");
      response.send(html);
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Metric }>("/metric", async(request, response) => {
      try {
        if (!auth(request)) {
          await response.status(401).send({ success: false });
          return;
        }
        const { application, name, value, metadata } = request.body;
        await fetch(`https://telemetry.nhcarrigan.com/api/33kzMoHcYaaEyqCFsauKPhTvEtx/ingest/metrics/_json`, {
          body: JSON.stringify([ {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Needs to match API's structure.
            __name__:  "metrics",
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Needs to match API's structure.
            __type__:  "count",
            app:       application,
            metadata:  metadata ?? {},
            name:      name,
            timestamp: Date.now(),
            value:     value,
          } ]),
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
            "Authorization": `Basic ${process.env.TELEMETRY_TOKEN ?? ""}`,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header.
            "Content-Type":  "application/json",
          },
          method: "POST",
        });
      } catch (error) {
        await errorHandler(error, "Metric Webhook");
        await response.status(500).send({ success: false });
      }
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Log }>("/log", logSchema, async(request, response) => {
      try {
        if (!auth(request)) {
          await response.status(401).send({ success: false });
          return;
        }
        const { application, level, message } = request.body;
        await pipeLog(application, message, level);
        await response.status(200).send({ success: true });
      } catch (error) {
        await errorHandler(error, "Log Webhook");
        await response.status(500).send({ success: false });
      }
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Error }>(
      "/error",
      errorSchema,
      async(request, response) => {
        try {
          if (!auth(request)) {
            await response.status(401).send({ success: false });
            return;
          }
          const { application, context, stack, message } = request.body;
          await sendMail(
            `[ERROR]: ${context} - ${application}`,
            `${message}\n\n${stack}`,
          );
          await pipeError(
            application,
            `${context} - ${message}\n${stack}`,
            "error",
          );
          await response.status(200).send({ success: true });
        } catch (error) {
          await errorHandler(error, "Error Webhook");
          await response.status(500).send({ success: false });
        }
      },
    );

    // eslint-disable-next-line @typescript-eslint/naming-convention -- Body must be capitalised for Fastify.
    server.post<{ Body: Uptime }>(
      "/uptime",
      uptimeSchema,
      async(request, response) => {
        try {
          if (!auth(request)) {
            await response.status(401).send({ success: false });
            return;
          }
          const { application, message } = request.body;
          await sendMail(`[UPTIME]: ${application}`, message);
          await pipeLog(application, message, "info");
          await response.status(200).send({ success: true });
        } catch (error) {
          await errorHandler(error, "Uptime Webhook");
          await response.status(500).send({ success: false });
        }
      },
    );

    server.post<{
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Header must be formatted for Fastify.
      Body:    Entitlement;
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Header must be formatted for Fastify.
      Headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Header must be formatted for Fastify.
        "x-signature-ed25519":   string;
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Header must be formatted for Fastify.
        "x-signature-timestamp": string;
      };
    }>(
      "/entitlement",
      // eslint-disable-next-line complexity -- Fuck off.
      async(request, response) => {
        try {
          const { type, application_id: applicationId, event } = request.body;
          const appInfo = applicationData[applicationId];
          const isValid = await validateWebhook(request);
          if (!isValid) {
            await response.status(401).send({ success: false });
            await pipeLog(
              appInfo?.name ?? applicationId,
              "An invalid webhook signature was received.",
              "error",
            );
            void sendMail(
              `[ENTITLEMENT]: ${appInfo?.name ?? applicationId}`,
              "An invalid webhook signature was received.",
            );
            return;
          }
          await response.status(204).send();
          if (type === 0) {
            await pipeLog(
              appInfo?.name ?? applicationId,
              "Received a ping from Discord.",
              "info",
            );
            void sendMail(
              `[ENTITLEMENT]: ${appInfo?.name ?? applicationId}`,
              "Received a ping from Discord.",
            );
            return;
          }
          const {
            user_id: userId,
            guild_id: guildId,
            ends_at: endsAt,
          } = event.data;
          await pipeLog(
            appInfo?.name ?? applicationId,
            `Entitlement purchased!\n- **User ID**: ${userId}\n- **Guild ID**: ${guildId}\n- **Ends At**: ${endsAt}`,
            "info",
          );
          await sendMail(
            `[ENTITLEMENT]: ${appInfo?.name ?? applicationId}`,
            `Entitlement purchased!\n- **User ID**: ${userId}\n- **Guild ID**: ${guildId}\n- **Ends At**: ${endsAt}`,
          );
        } catch (error) {
          await errorHandler(error, "Entitlement Webhook");
          await response.status(500).send({ success: false });
        }
      },
    );

    await server.register(rawBody, {
      encoding: false,
      field:    "rawBody",
      global:   true,
      runFirst: true,
    });

    // eslint-disable-next-line max-lines-per-function, complexity, max-statements -- Lot of logic here.
    server.post("/stripe", async(request, response) => {
      try {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Nah fam.
        const raw = request.rawBody as Buffer;
        const event = await stripe.webhooks.
          constructEventAsync(
            raw,
            request.headers["stripe-signature"] ?? "",
            process.env.STRIPE_WEBHOOK_SECRET ?? "",
          ).
          catch(() => {
            return null;
          });
        if (event === null) {
          await response.status(400).send({
            error: "Invalid Stripe webhook signature.",
          });
          await pipeLog(
            `[STRIPE]: Invalid Webhook Signature`,
            `Received an invalid webhook signature from Stripe.\n- **Headers**: ${JSON.stringify(
              request.headers,
            )}\n- **Body**: ${JSON.stringify(raw, null, 2)}`,
            "error",
          );
          return;
        }
        await response.status(200).send({ received: true });
        if (event.type === "checkout.session.completed") {
          const checkoutSessionCompleted = event.data.object;
          await pipeLog(
            "Stripe",
            `A checkout session has been completed.\n - **ITEMS**: ${
              checkoutSessionCompleted.line_items?.data.
                map((datum) => {
                  return `${datum.description ?? "unknown"} (${String(
                    datum.quantity,
                  )})`;
                }).
                join(", ") ?? "unknown"
            }\n- **TOTAL**: ${String(checkoutSessionCompleted.amount_total)}`,
            "info",
          );
          await sendMail(
            `[STRIPE]: Checkout Session Completed`,
            `A checkout session has been completed.\n - **ITEMS**: ${
              checkoutSessionCompleted.line_items?.data.
                map((datum) => {
                  return `${datum.description ?? "unknown"} (${String(
                    datum.quantity,
                  )})`;
                }).
                join(", ") ?? "unknown"
            }\n- **TOTAL**: ${String(checkoutSessionCompleted.amount_total)}`,
          );
          return;
        }
        if (event.type === "invoice.paid") {
          const invoicePaid = event.data.object;
          await pipeLog(
            "Stripe",
            `An invoice has been paid.\n - **ITEMS**: ${invoicePaid.lines.data.
              map((datum) => {
                return `${datum.description ?? "unknown"} (${String(
                  datum.quantity,
                )})`;
              }).
              join(", ")}\n- **TOTAL**: ${String(invoicePaid.amount_paid)}`,
            "info",
          );
          await sendMail(
            `[STRIPE]: Invoice Paid`,
            `An invoice has been paid.\n - **ITEMS**: ${invoicePaid.lines.data.
              map((datum) => {
                return `${datum.description ?? "unknown"} (${String(
                  datum.quantity,
                )})`;
              }).
              join(", ")}\n- **TOTAL**: ${String(invoicePaid.amount_paid)}`,
          );
        }
        if (event.type === "payment_intent.succeeded") {
          const paymentIntentSucceeded = event.data.object;
          await pipeLog(
            "Stripe",
            `A payment intent has succeeded.\n- **AMOUNT**: ${String(
              paymentIntentSucceeded.amount,
            )}`,
            "info",
          );
          await sendMail(
            `[STRIPE]: Payment Intent Succeeded`,
            `A payment intent has succeeded.\n- **AMOUNT**: ${String(
              paymentIntentSucceeded.amount,
            )}`,
          );
        }
        if (event.type === "subscription_schedule.completed") {
          const subscriptionScheduleCompleted = event.data.object;
          await pipeLog(
            "Stripe",
            `A subscription has been completed.\n- **ID**: ${subscriptionScheduleCompleted.id}`,
            "info",
          );
          await sendMail(
            `[STRIPE]: Subscription Completed`,
            `A subscription has been completed.\n- **ID**: ${subscriptionScheduleCompleted.id}`,
          );
        }
      } catch (error) {
        await errorHandler(error, "Stripe Webhook");
        await response.status(500).send({ error: "Internal Server Error" });
      }
    });

    server.listen({ port: 5003 }, (error) => {
      const application = "Rosalia Nightsong";
      if (error) {
        const { message, stack } = error;
        const context = "Server Startup";
        void sendMail(
          `[ERROR]: ${context} - ${application}`,
          `${message}\n\n${String(stack)}`,
        );
        void pipeLog(application, `${message}\n\n${String(stack)}`, "error");
        return;
      }
      const level = "debug";
      const message = `Server listening on port 5003.`;
      void sendMail(`[${level}]: ${application}`, message);
      void pipeLog(application, message, level);
    });
  } catch (error) {
    const application = "Rosalia Nightsong";
    const context = "Server Startup";
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Totally being lazy.
    const { message, stack } = error as Error;
    void sendMail(
      `[ERROR]: ${context} - ${application}`,
      `${message}\n\n${stack}`,
    );
    void pipeLog(application, `${message}\n\n${stack}`, "error");
  }
};
