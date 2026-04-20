const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateAIResponse = async (userMessage) => {
  try {
    const prompt = `You are a helpful e-commerce support AI. Answer shortly: ${userMessage}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("AI error:", error);
    return "AI not available right now.";
  }
};

module.exports = { generateAIResponse };

