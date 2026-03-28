const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('test');
    console.log('Success:', result.response.text());
  } catch (e) {
    console.error('Error with gemini-1.5-flash:', e.message);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('test');
      console.log('Success with gemini-pro:', result.response.text());
    } catch (e2) {
      console.error('Error with gemini-pro:', e2.message);
    }
  }
}

test();
