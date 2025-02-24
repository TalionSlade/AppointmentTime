// import OpenAI from 'openai';

// const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// if (!OPENAI_API_KEY) {
//   throw new Error(
//     'OpenAI API key is missing! Please create a .env file with VITE_OPENAI_API_KEY.'
//   );
// }

// const openai = new OpenAI({
//   apiKey: OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true // Note: In production, API calls should be made through a backend
// });

// const SYSTEM_PROMPT = `You are an AI appointment scheduler assistant. Help users schedule appointments by:
// 1. Understanding their preferred date and time
// 2. Confirming appointment details
// 3. Providing clear responses
// 4. Maintaining a professional and helpful tone

// Extract appointment details from user messages and format them appropriately.`;

// export async function getChatResponse(userMessage: string, messageHistory: any[]): Promise<string> {
//   try {
//     const messages = [
//       { role: 'system', content: SYSTEM_PROMPT },
//       ...messageHistory.map(msg => ({
//         role: msg.sender === 'user' ? 'user' : 'assistant',
//         content: msg.text
//       })),
//       { role: 'user', content: userMessage }
//     ];

//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages,
//       temperature: 0.7,
//       max_tokens: 150
//     });

//     return response.choices[0].message.content || 'I apologize, but I could not process your request.';
//   } catch (error) {
//     console.error('OpenAI API Error:', error);
//     throw error;
//   }
// }

import OpenAI from 'openai';
import { salesforce } from './salesforce';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    'OpenAI API key is missing! Please create a .env file with VITE_OPENAI_API_KEY.'
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: Move to backend in production
});

const SYSTEM_PROMPT = `You are an AI appointment scheduler assistant. Your tasks include:
1. Asking for the user's preferred date and time.
2. Confirming the appointment details (e.g., name, contact information, purpose).
3. Providing available time slots if the requested time is unavailable.
4. Summarizing the appointment details at the end.
5. Maintaining a professional and friendly tone.

Always format your responses clearly and ensure the user understands the next steps.`;

export async function getChatResponse(userMessage: string, messageHistory: any[]): Promise<string> {
  if (!userMessage || typeof userMessage !== 'string') {
    throw new Error('Invalid user message.');
  }
  if (!Array.isArray(messageHistory)) {
    throw new Error('Invalid message history.');
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: userMessage },
    ];

    console.log('Sending request to OpenAI:', { messages });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 150,
    });

    console.log('Received response from OpenAI:', response);

    const aiResponse = response.choices[0].message.content || 'I apologize, but I could not process your request.';

    // Check if the user confirmed the appointment
    if (aiResponse.toLowerCase().includes('confirm') && userMessage.toLowerCase().includes('yes')) {
      // Extract appointment details from the conversation
      const appointmentDetails = extractAppointmentDetails(messageHistory);

      if (appointmentDetails) {
        // Create the appointment in Salesforce
        const appointmentId = await salesforce.createAppointment(appointmentDetails);
        return `Your appointment has been successfully scheduled! Appointment ID: ${appointmentId}`;
      } else {
        return 'I could not extract the appointment details. Please provide the date, time, and subject again.';
      }
    }

    return aiResponse;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    } else {
      throw new Error('An unexpected error occurred. Please try again later.');
    }
  }
}

// Helper function to extract appointment details from the conversation
function extractAppointmentDetails(messageHistory: any[]): {
  Subject: string;
  StartDateTime: string;
  EndDateTime: string;
  Description?: string;
} | null {
  // Logic to parse the message history and extract appointment details
  // Example: Look for keywords like "date", "time", "subject" in the messages
  const userMessages = messageHistory.filter(msg => msg.sender === 'user').map(msg => msg.text);

  const dateMatch = userMessages.join(' ').match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/); // Match dates like "MM/DD/YYYY"
  const timeMatch = userMessages.join(' ').match(/\b\d{1,2}:\d{2}\s*(AM|PM)?\b/i); // Match times like "10:00 AM"
  const subjectMatch = userMessages.join(' ').match(/\b(subject|purpose):?\s*(.+)/i); // Match subject/purpose

  if (dateMatch && timeMatch && subjectMatch) {
    const startDateTime = `${dateMatch[0]} ${timeMatch[0]}`;
    const endDateTime = `${dateMatch[0]} ${addHours(timeMatch[0], 1)}`; // Assume 1-hour duration

    return {
      Subject: subjectMatch[2].trim(),
      StartDateTime: new Date(startDateTime).toISOString(),
      EndDateTime: new Date(endDateTime).toISOString(),
      Description: 'Scheduled via AI Assistant',
    };
  }

  return null;
}

// Helper function to add hours to a time string
function addHours(time: string, hours: number): string {
  let [timePart, period] = time.split(' ');
  let [hour, minute] = timePart.split(':').map(Number);

  hour += hours;
  if (hour >= 12) {
    period = period === 'AM' ? 'PM' : 'AM';
  }
  if (hour > 12) {
    hour -= 12;
  }

  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}