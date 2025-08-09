import {genkit} from 'genkit';
import {openrouter} from 'genkitx-openrouter';

export const ai = genkit({
  plugins: [
    openrouter({
      apiKey: process.env.OPENROUTER_API_KEY || '',
    }),
  ],
  model: 'google/gemini-flash-1.5',
});
