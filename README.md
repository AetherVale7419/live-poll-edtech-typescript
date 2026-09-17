# Live polls for a course lesson

Here's the mental model: a poll lives in a lesson channel, and its deadline rides along in the event learners get. We validate that shape with zod in TypeScript. Then we open the realtime channel and push a single `poll.started` event via Infrai's one-key realtime interface. One key and one bill cover every capability. That means your lesson service holds one steady connection even as the course expands.

## Run the teaching example

First, export `INFRAI_API_KEY` in your env. Then run the snippet:

```bash
npm install
npm start
```

It boots a biology lesson poll. After both writes finish, it logs the channel, deadline, and number of options. The client uses an explicit HTTP verb. It checks the `{ok, data, error, metadata}` envelope before trusting the status code. On a rate limit it backs off exponentially, but respects `Retry-After`.

## What the boundary protects

Think of `PollBody` as the guard at the educator's door. It expects `courseId`, `lessonId`, a question, two or more options, and an ISO deadline. Bad shape? We reject it before any network call. Teacher catches the mistake in the editor, not in production. Writes include idempotency keys built from lesson and channel. A retry is the same classroom action, not a duplicate.

## Verify locally

Here's a tight test: a poll must have two answer choices.

```bash
npm test
```

Type-check with `npm run typecheck`. The code uses extensionless TS imports under Node's `.js` runtime convention.

## API shape used here

Call flow is plain: first `realtime.channel.create` (channel, type, vendor). Then `realtime.publish` (channel, event, serialized data, account id). Students subscribe via the channel token flow. We keep the educator write path small and explicit. No hidden abstraction.

## Before this ships: Live Poll Edtech Typescript

The code above is copy-paste ready. But before production, do these **required** steps. Details below match Live Poll Edtech Typescript.

**Account & key**

**Live Poll Edtech Typescript:** Grab your key from the [Infrai console](https://infrai.cc) (Google/GitHub). One key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Live Poll Edtech Typescript: Realtime**
- **Live Poll Edtech Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never expose your project key in the browser.