# Data that leaves your machine

T3 Code sends no product usage events, no relay connection traces, and no crash reports. The server,
desktop app, web app, and mobile app have no analytics or crash reporting SDK. What can still leave
your machine is listed below, with the setting that controls each.

## Agent feedback

Agent feedback lets agents tell the T3 team about T3 Code: a T3 tool or `t3` command that did not
do what they expected, a confusing instruction, or a missing capability. Choose a mode in
**Agent feedback** in **Settings > Labs**:

- **Off**, the default: agents do not see the feedback tools, and `t3 feedback` stops with a
  message pointing to Labs.
- **When I ask**: agents send a report only when you ask them to, about anything in T3 Code.
- **Automatic**: agents also report T3 Code problems they hit on their own, such as a T3 tool that
  failed and made them find another way. These reports carry no outline and no message text, and
  go out without asking you. `t3 feedback --kind bug --subject "t3 thread send" --expected "…" --actual "…"`
  sends one the same way, so it works only in this mode.

When you ask your agent for a report, in either mode, T3 Code shows it in the thread as a card
with exactly what would leave your machine, and sends it only if you press **Send**. The agent
carries on without waiting and never learns your answer. The card stays open until you answer it,
even after the turn ends or the server restarts; **Don't send** sends nothing, and the agent is
told not to send it another way. Only someone who can run agents on that machine can answer the
card; people on a guest link cannot.

Each report has the kind of problem, the T3 tool or command it concerns (or `general`), and up to
300 characters each of expected behavior, actual behavior, and workaround, written by the agent,
which is told not to quote your messages or code. The agent also says how many recent turns the
problem spans. A report you approved carries an outline of those turns, and of at least the last 5,
from when the agent asked: who spoke, how long each message was, and which tools ran, whether they
worked, and how long they took. The outline has no text. Tools from your other MCP servers appear
only as `mcp`. Turn on **Include the conversation** in the card to attach the text of your
messages and the agent's replies in the turns the problem spans, up to 1,000 characters per
message and 16 KB in all, oldest text dropped first; the card shows that text before you send it.
To change a report, such as the turns it covers, ask the agent in the chat: it shows a new card,
and you can decline the old one. Tool inputs and outputs, files, and attachments are never sent. An agent can
show you at most 3 report cards and send 3 reports on its own per turn, and `t3 feedback` can
send at most 10 an hour.

Before anything is saved, T3 Code removes file paths (when text mentions one, the rest of that line
goes with it), your user name, machine name, project title, branch, and git remote, and anything
that looks like a key, token, email address, or URL with a password. It cannot recognise your code
or a name written in a sentence, so only include the conversation when it holds nothing you would
not send. Reports from agents also name the provider and the model, and each sent report carries the
T3 Code version, the operating system and architecture, and a hashed installation or provider
account identifier. Sent reports go to `ingest.t3.codes`, which keeps a copy and forwards them to
PostHog. No thread IDs or project IDs are sent.

Reports are saved on your machine first, and a declined one is not saved at all; its card keeps
only what you would have sent without the conversation. When
`T3CODE_TELEMETRY_ENABLED=false` is set in the server's environment, or a
[managed policy](./managed-policy.md#other-capabilities) sets `telemetry: false`, saved reports stay
there and are not sent. `t3 feedback list` shows recent
reports, the thread each came from, and a line for each outline; `t3 feedback list --json` shows
exactly what each one holds.

## Agent activity for mobile notifications

When **Publish agent activity** is enabled on a host, it sends project and thread titles, model
names, activity status, and environment and thread identifiers to the T3 Connect relay for
[mobile notifications and live activities](./mobile-notifications.md). `T3CODE_TELEMETRY_ENABLED`
does not disable it.

To stop publishing, turn off **Publish agent activity** under **Settings > Sharing & access** on
the host. Turning off notifications on a phone controls that phone's alerts, not the host's
publishing setting.

## Export diagnostics to your own receiver

To send traces, metrics, or logs to an OpenTelemetry receiver, open
**Settings > Maintenance > Diagnostics**, select an environment, and enter each signal's OTLP HTTP
endpoint under **OpenTelemetry export** (for example `http://localhost:4318/v1/traces`). Save, then
restart that environment's server. The receiver must be reachable from the server's machine.
**Test** sends an empty export from the server to check an endpoint before or after you save it;
saved endpoints are checked when the section opens. Checks send authentication headers only to
the signal's currently running endpoint and do not follow redirects. To check a new endpoint
that requires authentication, save it and restart the server first.

`T3CODE_OTLP_*_URL` and standard `OTEL_EXPORTER_OTLP_*` environment variables override the saved
settings. An overridden signal shows **Set by environment** and names the variable that set it, and its
**Test** checks the running endpoint instead of the field. For endpoints saved here or set with `T3CODE_OTLP_*_URL`, set `T3CODE_OTLP_HEADERS` for
receivers that need authentication and `T3CODE_OTLP_PROTOCOL=http/protobuf` for receivers that do
not accept JSON. An endpoint set with `OTEL_EXPORTER_OTLP_*` takes its headers and protocol from
`OTEL_EXPORTER_OTLP_HEADERS` and `OTEL_EXPORTER_OTLP_PROTOCOL` instead.
