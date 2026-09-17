import assert from "node:assert/strict";
import { PollBody } from "./live_poll_service.ts";

const valid = { courseId: "math-7", lessonId: "fractions", question: "Which is larger?", options: ["1/2", "1/3"], deadline: "2030-01-01T10:00:00.000Z" };
assert.equal(PollBody.parse(valid).options.length, 2);
assert.throws(() => PollBody.parse({ ...valid, options: ["only one"] }));
console.log("poll boundary test passed");
