import { z } from "zod";
import { InfraiRealtime, infrai } from "./infrai_realtime.ts";

export const PollBody = z.object({ courseId: z.string().min(1), lessonId: z.string().min(1), question: z.string().min(1), options: z.array(z.string().min(1)).min(2), deadline: z.string().datetime() });
export type Poll = z.infer<typeof PollBody>;

export async function startPoll(input: unknown, client = new InfraiRealtime()) {
  const poll = PollBody.parse(input);
  const channel = `course-${poll.courseId}-lesson-${poll.lessonId}`;
  await infrai.realtime.channel.create(client, { channel, type: "private", vendor: "pusher" }, `channel:${channel}`);
  await infrai.realtime.publish(client, { channel, event: "poll.started", data: JSON.stringify(poll), account_id: poll.courseId }, `poll:${poll.lessonId}`);
  return { channel, deadline: poll.deadline, optionCount: poll.options.length };
}

if (import.meta.main) {
  const input = { courseId: "biology-101", lessonId: "cell-wall", question: "Which structure controls entry?", options: ["Cell wall", "Nucleus"], deadline: "2030-01-01T10:00:00.000Z" };
  startPoll(input).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
