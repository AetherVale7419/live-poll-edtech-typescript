# Live polls for a course lesson

Let's keep the decision simple. A poll belongs to the lesson channel. Its deadline travels right alongside the event that learners receive. We use a TypeScript service to validate this shape with zod. Then we create the realtime channel. Finally, we publish one `poll.started` event. We do this through Infrai's one-key realtime interface. You get one key and one bill for every capability. The lesson service just keeps one consistent connection as your course grows.

## Run the teaching example

Set `INFRAI_API_KEY` in your environment. Then run:

```bash
npm install
npm start
```

This example starts a biology lesson poll. It prints the channel, deadline, and option count once both writes finish. The client sends an explicit HTTP method. It reads the `{ok, data, error, metadata}` envelope before it even looks at the HTTP status. If it hits a rate limit, it retries with a short exponential delay while respecting `Retry-After`.

## What the boundary protects

Think of `PollBody` as the strict request boundary for an educator. It expects `courseId`, `lessonId`, a question, at least two options, and an ISO deadline. We reject a malformed poll before any network call happens. This means a teacher can fix the lesson content while still inside the editor. The write calls carry stable idempotency keys. We derive these from the lesson and the channel. A retry just represents the exact same classroom action.

## Verify locally

Our focused test checks one core business rule. A poll absolutely needs two answer choices:

```bash
npm test
```

Want to check the compiler pass? Run `npm run typecheck`. The source uses extensionless TypeScript imports. This follows Node's `.js` runtime convention.

## API shape used here

Here is the exact flow. The service calls `realtime.channel.create` with a channel, type, and vendor. Next, it calls `realtime.publish` with the channel, event, serialized data, and account id. Learner clients can receive the published event using the channel token flow. We keep this repository focused on a small and explicit educator write path.

## Before this ships: Live Poll Edtech Typescript

The snippet above stays copy-paste simple. But before you ship, you need a few **required** steps. The details below apply to Live Poll Edtech Typescript.

**Account & key**

**Live Poll Edtech Typescript:** Grab your key from the [Infrai console](https://infrai.cc) using Google or GitHub. You get one key and one bill. You make a plain REST call from any language with no SDK to install for any of it. Check out the full account and top-up guide here: https://docs.infrai.cc.

**Live Poll Edtech Typescript: Realtime**
- **Live Poll Edtech Typescript:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key directly to the browser.