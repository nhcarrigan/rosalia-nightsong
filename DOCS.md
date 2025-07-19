---
title: Rosalia Nightsong
---

Rosalia Nightsong (hereinafter the "Application") is a centralized alert server that receives and forwards application logs, errors, uptime notifications, Discord entitlements, and Stripe payment events to both email and Discord channels for real-time monitoring and notification purposes.

## 1. User Documentation

:::note
This section is coming soon!
:::

This section is for those interacting with a live instance of the Application.

### Overview

Rosalia Nightsong serves as a webhook endpoint and notification hub for various services. The application accepts HTTP POST requests containing structured data and forwards them as formatted notifications to configured email addresses and Discord channels.

### API Endpoints

The Application provides several webhook endpoints:

- **GET /** - Returns the application's homepage with basic information
- **POST /log** - Accepts application log messages 
- **POST /error** - Accepts error reports with stack traces
- **POST /uptime** - Accepts uptime/health check notifications
- **POST /entitlement** - Handles Discord entitlement purchase notifications
- **POST /stripe** - Processes Stripe payment webhook events

### Authentication

All POST endpoints (except Stripe webhooks) require authentication via the `Authorization` header containing a valid API token. Discord entitlements use Ed25519 signature verification for security.

### Supported Applications

The server maintains a registry of supported Discord applications with their respective verification keys for entitlement webhook validation.

## 2. Technical Documentation

:::note
This section is coming soon!
:::

This section is for those interested in running their own instance of the Application.

### Architecture

Rosalia Nightsong is built using:

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Fastify for high-performance HTTP handling
- **Email**: Nodemailer with SMTP transport
- **Discord Integration**: Discord API v10 for channel messaging
- **Payment Processing**: Stripe SDK for webhook handling
- **Webhook Verification**: discord-verify for Ed25519 signature validation

### Environment Configuration

The application requires the following environment variables:

```env
MATRIX_ACCESS_TOKEN="matrix_access_token"
MATRIX_ROOM_ID="matrix_room_id"
API_AUTH="api_authentication_token"
EMAIL_PASSWORD="smtp_password"
DISCORD_WEBHOOK_URL="discord_webhook_url"
STRIPE_SECRET_KEY="stripe_secret_key"
STRIPE_WEBHOOK_SECRET="stripe_webhook_secret"
DISCORD_TOKEN="discord_bot_token"
```

### Installation and Setup

1. **Prerequisites**
   - Node.js 18+ with pnpm package manager
   - TypeScript compiler
   - Access to SMTP server for email notifications
   - Discord bot token and channel access
   - Stripe account with webhook configuration (if using payment features)

2. **Installation**
   ```bash
   pnpm install
   ```

3. **Build**
   ```bash
   pnpm run build
   ```

4. **Start**
   ```bash
   pnpm start
   ```

The server will listen on port 5003 by default.

### API Schema Validation

The application uses JSON schema validation for incoming requests:

#### Log Endpoint (`/log`)
```typescript
{
  application: string;
  level: string;
  message: string;
}
```

#### Error Endpoint (`/error`)
```typescript
{
  application: string;
  context: string;
  message: string;
  stack: string;
}
```

#### Uptime Endpoint (`/uptime`)
```typescript
{
  application: string;
  message: string;
}
```

### Notification Formats

**Email Notifications**: Plain text format sent to configured SMTP recipient
**Discord Notifications**: Rich embed format with structured components and markdown support

### Security Features

- API token authentication for log/error/uptime endpoints
- Ed25519 signature verification for Discord entitlements
- Stripe webhook signature validation
- Request body validation against JSON schemas
- Error handling with notification forwarding

### Monitoring and Logging

The application includes comprehensive error handling that forwards internal errors to the configured notification channels, ensuring operational visibility and quick incident response.

## 3. Legal Documentation

:::note
This section is coming soon!
:::

This section is for expansions to our legal policies specific to the Application.

### License

This software is licensed under Naomi's Public License. Copyright held by Naomi Carrigan.

### Data Handling

The Application processes and forwards notification data but does not persistently store user data. All webhook payloads are processed in memory and forwarded to configured notification channels.

### Third-Party Services

The Application integrates with:
- Discord API for message delivery
- Stripe API for payment webhook processing
- SMTP servers for email delivery

Users should review the privacy policies and terms of service for these third-party services.

## 4. Contributing Documentation

:::note
This section is coming soon!
:::

This section is for documentation related to contributing to the Application's codebase.

### Development Setup

1. **Clone the repository**
2. **Install dependencies**: `pnpm install`
3. **Configure environment variables** in `prod.env`
4. **Run linting**: `pnpm run lint`
5. **Build the project**: `pnpm run build`
6. **Start development server**: `pnpm start`

### Code Structure

```
src/
├── config/          # Application configuration and data
├── interfaces/      # TypeScript interface definitions
├── modules/         # Core functionality modules
├── schemas/         # JSON schema validation definitions
├── server/          # Fastify server setup and routing
└── utils/           # Utility functions
```

### Development Guidelines

- Follow the existing ESLint configuration (`@nhcarrigan/eslint-config`)
- Use TypeScript strict mode
- Include comprehensive error handling
- Add appropriate JSDoc comments for public functions
- Maintain the existing code style and structure

### Testing

Currently, no automated tests are configured. Contributors are encouraged to manually test all endpoints and error scenarios.

### Pull Request Process

1. Review the [contributing guidelines](CONTRIBUTING.md)
2. Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
3. Create a feature branch from main
4. Make your changes with appropriate commit messages
5. Ensure linting passes
6. Submit a pull request with a clear description

### Contact

For questions or support, contact through the [Chat Server](http://chat.nhcarrigan.com) or email `contact@nhcarrigan.com`.
