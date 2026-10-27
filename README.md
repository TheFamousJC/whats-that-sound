# What’s That Sound?

A mechanical-noise workbench for cars, refrigerators, washing machines and other machines. Record or upload a short audio clip, add context, and receive cautious Gemini-assisted troubleshooting with possible causes, follow-up questions, suggested checks and conditional DIY difficulty.

## Current release

The public site is a working interface preview: recording, playback, waveform and a clearly labeled fictional report. Gemini is intentionally disconnected until the owner connects a billing-disabled free-tier project. No recording is analyzed in preview mode. No API key is included.

## Run locally

Install Node.js 22 or newer, then run `npm start`. Open http://127.0.0.1:8787. There are no package dependencies or install step. Run `npm test` for validation checks.

## Connect Gemini later — strictly $0

1. In Google AI Studio / Google Cloud, select a project with **Cloud Billing disabled** and confirm that the desired model has free-tier access in your region/account. Do not enable a paid billing tier.
2. Create a Gemini API key for that project. Never paste it in a chat or commit it to GitHub.
3. Copy `.env.example` to `.env.local`, enter the key locally and set `GEMINI_FREE_TIER_CONFIRMED=true` only after verifying billing is disabled. Restart `npm start`.
4. Use an audio recording with a known, confirmed fault to evaluate the result. General audio understanding is not evidence of accurate component-level diagnosis.

The app uses only `gemini-2.5-flash`, with no model fallback, paid tools, or automatic retries. It serializes inference, caps clips at 60 seconds / 6 MB, persists a 20-request daily limit in `work/quota.json`, and spaces requests by at least 15 seconds. The local day counter uses UTC. Failed upstream requests also consume this allowance. Keep the quota file between restarts; it is never a billing guarantee. **Only keeping the Google project off paid billing prevents API charges.** Free quotas and model availability may change. Quota exhaustion produces an error, not a fabricated report.

## Hosting

The included GitHub Pages workflow publishes `public/` as a static preview, with no server costs and no secrets. A static host cannot run `server.mjs`; the preview detects this and disables analysis. The full Gemini version runs locally. No paid cloud service or billing account is provisioned by this project.

Do not expose the local server directly to the public internet: it is intentionally bound to loopback and has no account system. Before hosting live inference, add authentication and durable shared quotas, keep secrets server-side, and select hosting with a hard free-plan boundary. The single-process quota implementation is for one local instance, not a distributed service.

## Privacy and interpretation

Recordings remain in browser memory until the user explicitly submits consent. With Gemini connected, audio and the description are sent through the local server to Google. This application does not write recordings or diagnostic details to disk; only a quota counter is stored. Google’s free-tier data practices may include use of submissions to improve products. Avoid private conversations and personal information. Removing a recording releases the app’s browser reference; it does not erase data already sent to Google.

Results are possible explanations, not confirmed diagnoses. No calibrated confidence percentage is claimed. Smoke, burning smells, sparks, severe vibration, or braking/steering problems require appropriate qualified help. Do not run dangerous machinery to make a recording.

## References

- [Gemini audio input](https://ai.google.dev/gemini-api/docs/audio)
- [Gemini pricing and free-tier data treatment](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

Built by TheFamousJC.
