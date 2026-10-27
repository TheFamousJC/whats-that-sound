# What’s That Sound?

A free, MIT-licensed mechanical-noise troubleshooting site hosted on GitHub Pages. Visitors bring their own Gemini API key. No application server, shared key, account system or paid hosting is required.

**Live:** https://thefamousjc.github.io/whats-that-sound/

## Use the site

1. Open the site. Without a key, it clearly shows **DEMO MODE** and offers a fictional example report. Recording, playback and saving audio work without a key.
2. Create a dedicated key at [Google AI Studio](https://aistudio.google.com/api-keys). Select a project with **no billing account attached**. Check Free tier / Set up billing in Projects; do not upgrade or attach billing.
3. Paste your key into the page, confirm your free-tier project status and choose **Connect key**. The key is checked with Google without sending audio.
4. Record or upload 1–60 seconds of audio, up to 6 MB. Add the machine make/model, operating state and symptoms.
5. Confirm consent, then select **Analyze recording**. The browser sends the audio and description directly to Google Gemini and displays possible causes, questions, suggested checks and conditional DIY difficulty.
6. Use **Save recording** and **Download report** to save files to your PC or phone. Files go to the location chosen by your browser (usually Downloads). The app cannot silently write to an arbitrary folder.

## Credentials and privacy

- The key is held in JavaScript memory for this tab only. It is never written to localStorage, sessionStorage, cookies, IndexedDB, source files, reports or a backend.
- The password input is cleared immediately when connecting. **Disconnect & clear** or reload the page to discard the active key. Browser/password-manager autofill and extensions are outside the app’s control.
- Keys are sent only to `generativelanguage.googleapis.com` in an HTTP header, never in a URL. Requests do not pass through GitHub or the author’s computer.
- Recordings and descriptions stay in browser memory until the user explicitly chooses Analyze and consents to sending them to Google. No audio is hosted on GitHub. Google’s free-tier data practices may include use of submissions to improve products.
- There are no external JavaScript dependencies or analytics. A content security policy restricts outbound application requests to Google’s Gemini endpoint and same-origin files.
- Browser-entered keys can be accessed by browser extensions, local device users, developer tools, or malicious changes to the page. Use a dedicated key, restrict it to the Gemini API and, where supported for its key type, this HTTPS referrer. Review code or self-host if preferred. Never enter a paid production key.

## Staying at $0

GitHub Pages hosts the static application. Each visitor uses their own Google project’s free quota. The app uses `gemini-3.5-flash-lite` only, with no model fallback, paid tools or automatic retries. It allows at most 20 analysis attempts per tab and spaces attempts by 15 seconds. Google’s project limits also apply; the tab counter is not a billing control and resets on reload.

**The page cannot verify Google billing status or prevent charges on a paid project.** To avoid API charges, keep the visitor’s project off paid billing. If free quota is exhausted or the model is overloaded, analysis stops with an error. Free-tier availability, quotas and models may change.

## Fork or run locally

Fork the repository and enable GitHub Pages using the included Actions workflow, which publishes `public/`. No secrets or build dependencies are needed.

For a local preview, install Node.js 22+ and run `npm start`, or open `Start App.cmd` on Windows. Open the address printed by the server (default http://127.0.0.1:8787). The local server only serves static files; it does not load credentials or accept inference requests. Old ignored `.env.local` files are unused and are not included in source archives.

Run `npm test` for validation and mocked direct-Gemini request tests. A generated-tone live test verifies the integration, not mechanical-fault diagnostic accuracy.

## Limits of interpretation

Results suggest explanations, not confirmed failed components or calibrated accuracy percentages. Different faults can sound alike. Follow manufacturer guidance and seek qualified help where needed. Do not operate hazardous machinery just to record it.

## References

- [Google Gemini API keys](https://ai.google.dev/gemini-api/docs/api-key)
- [Audio understanding](https://ai.google.dev/gemini-api/docs/audio)
- [Pricing and free-tier data practices](https://ai.google.dev/gemini-api/docs/pricing)
- [Billing status](https://ai.google.dev/gemini-api/docs/billing)

Built by TheFamousJC. Released under the MIT License; see LICENSE.

For Human and Animal sources, the app describes audible characteristics and asks contextual questions only. It is not a medical or veterinary diagnostic service and does not offer treatment or DIY repair advice for living beings. Severe breathing difficulty, collapse, or immediate distress warrants urgent professional help rather than waiting for an AI report. Safety guidance references: https://www.nhs.uk/symptoms/shortness-of-breath/ and https://www.pdsa.org.uk/pet-help-and-advice/pet-health-hub/other-veterinary-advice/first-aid-for-pets-struggling-to-breathe
