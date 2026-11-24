# Telemetry removed

This tree has had its telemetry stripped. Use this note to check later changes (and upstream
merges) for telemetry coming back.

## What was removed

### 1. Product analytics (PostHog through `ingest.t3.codes`)

- **Events:** `server.boot.heartbeat`, `install.owner_observed`, `client.thread.started`,
  `client.turn.requested`, `feature.used`, `provider.turn.completed`,
  `provider.request.completed`, `mcp.tool.invoked`, `mcp.delegated_task.finished`,
  `chatgpt.auth.*`, `chatgpt.transfer.*`.
- **Identity:** hashed Connect account, OpenAI `user_id`, Claude account UUID and client device id
  ("owners"); the browser `t3code:analytics-device-id` localStorage id; the
  `clientOwner` / `clientDevice` / `clientSurface` / `clientAppVersion` / `clientDeviceType` /
  `clientOs` / `clientOsMajorVersion` / `clientDeviceModel` / `clientBrowser` /
  `clientWebDeployment` / `connectionMethod` WebSocket query parameters.
- **Code:** `apps/server/src/telemetry/{FeatureUsage,DelegatedTaskAnalytics,ProviderUsageAnalytics}.ts`,
  most of `ProviderDimensions.ts` and `Identify.ts`, `AnalyticsService.recordOwners`, and the call
  sites in `ws.ts`, `server.ts`, `serverRuntimeStartup.ts`, `mcp/McpHttpServer.ts`,
  `guest/GuestShareService.ts`, `provider/CodexChatGptAuth.ts`, `orchestration-v2/*`;
  `ClientCapabilities.AnalyticsDevice` and `appendClientConnectionParams` in
  `packages/client-runtime`; the usage-data notices in the web Welcome and About pages;
  `docs/internals/08_product-analytics.md`.

### 2. Relay client tracing (OTLP spans to Axiom, `https://api.axiom.co/v1/traces`)

- **Code:** `packages/shared/src/relayTracing.ts`, `apps/server/src/cloud/{relayTracing,traceRelayRequest}.ts`,
  every `withRelayClientTracing` / `withLocalTracing` wrapper, the web/mobile tracing layers, the
  desktop `getRelayTelemetryEnabled` bridge, `isRelayTracingEnabled`.
- **Env vars and build defines:** `T3CODE_RELAY_CLIENT_OTLP_TRACES_{URL,DATASET,TOKEN}`,
  `VITE_RELAY_OTLP_TRACES_*`, `T3CODE_MOBILE_OTLP_TRACES_*`, `EXPO_PUBLIC_OTLP_TRACES_*`,
  `__T3CODE_BUILD_RELAY_CLIENT_OTLP_TRACES_*__`.
- **Infra and CI:** the Axiom client ingest tokens and `PublishClientConfig` tracing fields in
  `infra/relay`, the `relay-client-tracing-config` artifact and steps in the release workflows.

### 3. Mobile crash and performance reporting (`expo-observe`)

- **Package:** `expo-observe` (and its `expo-app-metrics` dependency).
- **Code:** `apps/mobile/src/features/observability/`, the "Send crash reports" setting and
  `crashReportsEnabled` preference, the relay ingest endpoint `POST /v1/mobile/observe/...`
  (`infra/relay/src/mobileTelemetry/`, `RelayMobileTelemetryGroup` in the relay contract).
- **Infra and CI:** Axiom datasets `t3-code-mobile-logs-*` / `t3-code-mobile-metrics-*` and their
  tokens, monitors and dashboard; R2 bucket `t3-code-mobile-sourcemaps-*`; the source map uploader
  (`apps/mobile/scripts/*sourcemap*`, `packages/shared/src/mobileSourceMaps.ts`), the
  `MOBILE_SOURCEMAPS_R2` secret and `SOURCEMAP_FILE`.

## Left in place on purpose (open decisions)

- **Agent feedback** (Settings > Labs, default Off). When a user turns it on and sends a report, it
  goes out through `apps/server/src/telemetry/AnalyticsService.ts` to `ingest.t3.codes` (PostHog
  `/batch/`, key `T3CODE_POSTHOG_KEY`) with a hashed install or provider account id from
  `Identify.ts`. `T3CODE_TELEMETRY_ENABLED=false` and managed policy `telemetry: false` still stop
  delivery. Nothing else may call `AnalyticsService.record`.
- **User-configured OpenTelemetry export** (`T3CODE_OTLP_*`, `OTEL_*`, Settings > Diagnostics). Off
  until the user enters their own receiver.
- **Update checks:** desktop `electron-updater` (GitHub releases or a managed feed), mobile
  `expo-updates` (`https://u.expo.dev/<project id>`), and npm registry version lookups.
- **Relay and task-cache operator observability:** the relay Worker's own request traces and
  monitors in Axiom (`infra/relay/src/{worker,observability,monitoring}.ts`, `@alchemy.run/axiom`),
  and `infra/task-cache` (Axiom traces plus opt-in maintainer cache-hit reports, also
  `scripts/mobile-native-client.ts`).
- **Publish agent activity** (mobile notifications through the relay). A feature with its own
  setting under Settings > Sharing & access.
- **Local-only diagnostics:** the server trace file, browser spans posted to the user's own server,
  `resourceTelemetry` (process resource monitor), the mobile on-device crash log.
- **Marketing privacy policy** (`apps/marketing/src/pages/privacy-policy.astro`) still describes
  PostHog and Axiom. It is legal copy and was not edited.
- **`.env.example` lines 27-31** still show commented `T3CODE_MOBILE_OTLP_TRACES_*` examples that
  nothing reads.

## How to check for regressions

```sh
# SDKs, hosts, keys (expect: this file, AnalyticsService + its test, the privacy policy,
# .env.example, vendor GraphQL schemas, and UI copy that mentions Sentry as an example)
rg -n 'posthog|PostHog|[Ss]entry\b|@segment|amplitude|mixpanel|bugsnag|crashReporter|gtag\(|plausible|@vercel/analytics|expo-observe|api\.axiom\.co|ingest\.t3\.codes|phc_[A-Za-z0-9]{10,}' \
  -g '!node_modules' -g '!.repos' -g '!pnpm-lock.yaml' -g '!third-party-licenses' -g '!patches' -g '!*.graphql*' .

# Removed channels (expect no hits outside this file)
rg -n 'withRelayClientTracing|RelayClientTracer|RELAY_(CLIENT_)?OTLP|EXPO_PUBLIC_OTLP|mobile/observe|MOBILE_SOURCEMAPS|recordOwners\(|AnalyticsDevice|clientOwner|feature\.used|client\.turn\.requested|server\.boot\.heartbeat' \
  -g '!node_modules' -g '!.repos' .

# Every user of the remaining sender (expect only server.ts wiring, feedback/FeedbackStore.ts, tests)
rg -n 'AnalyticsService' apps packages -g '!node_modules'

# New dependencies
rg -n -i 'posthog|sentry|expo-observe|amplitude|mixpanel|segment|bugsnag|opentelemetry' -g 'package.json' -g '!node_modules' -g '!.repos' .
```
