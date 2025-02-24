import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    'OpenAI API key is missing! Please create a .env file with VITE_OPENAI_API_KEY.'
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made through a backend
});

const SYSTEM_PROMPT = `You are an AI appointment scheduler assistant. Help users schedule appointments by:
1. Understanding their preferred date and time
2. Confirming appointment details
3. Providing clear responses
4. Maintaining a professional and helpful tone

Extract appointment details from user messages and format them appropriately.`;

export async function getChatResponse(userMessage: string, messageHistory: any[]): Promise<string> {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content || 'I apologize, but I could not process your request.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}