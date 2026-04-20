const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateAIResponse = async (userMessage) => {
  try {
    const prompt = `You are a helpful customer support AI for an e-commerce store. Respond concisely and helpfully to: "${userMessage}"`;
    const result = await model.generateContent(prompt);
    const response =  result.response;
    return response.text().replace(/\[^\]+\]/g, '').trim(); // Clean markdown
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Sorry, I'm having trouble responding right now. Please try again or contact support.";
  }
};

module.exports = { generateAIResponse };

