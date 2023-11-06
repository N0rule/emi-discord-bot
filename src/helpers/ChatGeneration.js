const { AICHAT } = require("@root/config.js");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, basePath: process.env.OPENAI_API_BASE });
const openai = new OpenAIApi(configuration);

module.exports = { aiChat };

async function aiChat(message) {
  const timeoutPromise = new Promise((reject) => {
    setTimeout(() => {
      reject(new Error("Сервер не ответил"));
    }, 35000);
  });

  try {
    const completionPromise = await openai.createChatCompletion({
      model: AICHAT.MODEL,
      max_tokens: AICHAT.TOKENS,
      presence_penalty: AICHAT.PRESENCE_PENALTY,
      temperature: AICHAT.TEMPERATURE,
      messages: [
        { role: "system", content: AICHAT.IMAGINEMESSAGE },
        { role: "user", content: message },
      ],
    });

    const completion = await Promise.race([timeoutPromise, completionPromise]);
    return completion.data.choices[0].message.content;
  } catch (error) {
    let CompError = error.response.data.error.message;
    if (CompError.includes("Forbidden: flagged moderation category:")) {
      CompError = CompError.replace("Forbidden: flagged moderation category: ", "");
    } else if (CompError.includes("Rate limit reached")) {
      CompError = "Вы достигли лимита запросов. Попробуйте позже";
    }
    return "🚫Ошибка:  " + (CompError || error.message);
  }
}
