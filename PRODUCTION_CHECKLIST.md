# Production checklist

## Before deploy
- Confirm DATABASE_URL is configured and reachable.
- Confirm JWT_SECRET, OAUTH_SERVER_URL and OWNER_OPEN_ID are configured.
- Confirm TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_WHATSAPP_NUMBER are configured if WhatsApp notifications are required.
- Confirm BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY only when Forge integration is in use.
- Run type check.
- Run lint.
- Run tests.
- Review /api/health locally before publishing.

## Deploy
- Build the API bundle.
- Start the production server with NODE_ENV=production.
- Validate that the selected PORT is reachable.
- Open /api/health and confirm status 200 with database up.
- Open the Live screen and confirm auto refresh is working.
- Open the Admin screen and confirm create, advance and governance flows.
- Validate one WhatsApp notification end to end.

## Post deploy
- Confirm recent notification failures are visible in Analytics.
- Confirm operational metrics load correctly in Analytics.
- Confirm finalizados remain separated from the active Live queue.
- Confirm company settings reflect correctly across Live, Settings and Analytics.
- Record the deployed commit SHA.
- Keep rollback instructions and previous working SHA available.
