'use server';
/**
 * @fileOverview A Tamil translator AI agent.
 *
 * - translate - A function that handles the translation process.
 * - TamilTranslatorInput - The input type for the translate function.
 * - TamilTranslatorOutput - The return type for the translate function.
 */

import {z} from 'genkit';

const TamilTranslatorInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language to translate to.'),
});
export type TamilTranslatorInput = z.infer<typeof TamilTranslatorInputSchema>;

const TamilTranslatorOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TamilTranslatorOutput = z.infer<typeof TamilTranslatorOutputSchema>;

const prompt = `You are a highly sophisticated translation engine. Your sole purpose is to provide the most accurate, professional-grade translation possible.

- Identify the source language.
- Translate the text to the specified target language.
- Preserve the exact meaning, intent, and nuances.
- Use natural phrasing and flawless grammar.
- Handle idiomatic expressions and technical terms with extreme precision.

Text to Translate:
{text}

Target Language:
{targetLanguage}

Provide ONLY the translated text as your response in a valid JSON object that follows this Zod schema:
${JSON.stringify(TamilTranslatorOutputSchema.shape)}
`;

export async function translate(input: TamilTranslatorInput): Promise<TamilTranslatorOutput> {
  const filledPrompt = prompt
    .replace('{text}', input.text)
    .replace('{targetLanguage}', input.targetLanguage);

  const requestBody = {
    model: 'google/gemini-flash-1.5',
    messages: [
      {
        role: 'user',
        content: filledPrompt,
      },
    ],
    response_format: { type: 'json_object' },
  };

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
            throw new Error(`Service unavailable or rate limited: ${response.status}`);
        }
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const jsonContent = JSON.parse(data.choices[0].message.content);
      return TamilTranslatorOutputSchema.parse(jsonContent);

    } catch (e: any) {
        if (retries > 0 && (e.message?.includes('503') || e.message?.includes('429')) ) {
            console.log('Service unavailable or rate limited, retrying...');
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // increasing delay
        } else {
            throw e;
        }
    }
  }
  throw new Error('Translation failed after multiple retries.');
}
