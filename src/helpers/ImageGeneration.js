const { AIIMAGE } = require("@root/config.js");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, basePath: process.env.OPENAI_API_BASE });
const openai = new OpenAIApi(configuration);

module.exports = { aiImage };

async function aiImage(message) {
  const timeoutPromise = new Promise((reject) => {
    setTimeout(() => {
      reject(new Error("Сервер не ответил"));
    }, 35000);
  });

  try {
    const completionPromise = await openai.createImage({
      model: AIIMAGE.MODEL,
      prompt: message,
      n: 1,
      size: AIIMAGE.SIZE,
    });

    const completion = await Promise.race([timeoutPromise, completionPromise]);
    return completion.data.data[0].url;
  } catch (error) {
    let CompError = error.response.data.error.message;
    console.log(CompError);
    if (CompError.includes("Forbidden: flagged moderation category:")) {
      CompError = CompError.replace("Forbidden: flagged moderation category: ", "");
    } else if (CompError.includes("Rate limit reached")) {
      CompError = "Вы достигли лимита запросов. Попробуйте позже";
    }
    throw new Error("🚫Ошибка: " + (CompError || error.message));
  }
}
