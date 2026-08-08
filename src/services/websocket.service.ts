import { Env } from "../index";

export class WebSocketService {
  /**
   * Broadcast new question event to all connected clients for a specific user
   */
  static async emitNewQuestion(
    env: Env,
    userId: string,
    questionData: {
      id: string;
      name: string | null;
      question: string;
      isViewed: boolean | null;
      createAt: string;
    },
  ) {
    try {
      // Get the Durable Object stub for the user's room
      const stub = env.OVERLAY_ROOM.get(env.OVERLAY_ROOM.idFromName(userId));

      // Send the new question event
      await stub.fetch(
        new Request(`https://dummy/broadcast/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new_question",
            data: {
              id: questionData.id,
              name: questionData.name,
              question: questionData.question,
              isViewed: questionData.isViewed,
              timestamp: questionData.createAt,
            },
          }),
        }),
      );
    } catch (error) {
      console.error("Error emitting new question:", error);
    }
  }

  /**
   * Broadcast updated questions list to all connected clients for a specific user
   */
  static async emitQuestionsSync(
    env: Env,
    userId: string,
    allQuestions: Array<{
      id: string;
      name: string | null;
      question: string;
      isViewed: boolean | null;
      createAt: string;
    }>,
  ) {
    try {
      // Get the Durable Object stub for the user's room
      const stub = env.OVERLAY_ROOM.get(env.OVERLAY_ROOM.idFromName(userId));

      // Send the questions sync event with all questions
      await stub.fetch(
        new Request(`https://dummy/broadcast/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "questions_sync",
            data: {
              questions: allQuestions,
              timestamp: new Date().toISOString(),
              total: allQuestions.length,
            },
          }),
        }),
      );
    } catch (error) {
      console.error("Error emitting questions sync:", error);
    }
  }

  /**
   * Broadcast question update event to all connected clients for a specific user
   */
  static async emitQuestionUpdate(
    env: Env,
    userId: string,
    questionData: {
      id: string;
      name: string | null;
      question: string;
      isViewed: boolean | null;
    },
  ) {
    try {
      // Get the Durable Object stub for the user's room
      const stub = env.OVERLAY_ROOM.get(env.OVERLAY_ROOM.idFromName(userId));

      // Send the question update event
      await stub.fetch(
        new Request(`https://dummy/broadcast/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "question_update",
            data: {
              id: questionData.id,
              name: questionData.name,
              question: questionData.question,
              isViewed: questionData.isViewed,
              timestamp: new Date().toISOString(),
            },
          }),
        }),
      );
    } catch (error) {
      console.error("Error emitting question update:", error);
    }
  }
}
