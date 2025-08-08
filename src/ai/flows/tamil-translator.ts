'use server';

/**
 * @fileOverview A Tamil translator AI agent.
 *
 * - translate - A function that handles the translation process.
 * - TamilTranslatorInput - The input type for the translate function.
 * - TamilTranslatorOutput - The return type for the translate function.
 */

import {ai} from '@/ai/genkit';
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

export async function translate(input: TamilTranslatorInput): Promise<TamilTranslatorOutput> {
  return tamilTranslatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tamilTranslatorPrompt',
  input: {schema: TamilTranslatorInputSchema},
  output: {schema: TamilTranslatorOutputSchema},
  // Use the more powerful gemini-1.5-pro model for translation tasks.
  model: 'googleai/gemini-1.5-pro-latest',
  prompt: `You are a highly sophisticated translation engine. Your sole purpose is to provide the most accurate, professional-grade translation possible.

- Identify the source language.
- Translate the text to the specified target language.
- Preserve the exact meaning, intent, and nuances.
- Use natural phrasing and flawless grammar.
- Handle idiomatic expressions and technical terms with extreme precision.

Text to Translate:
{{{text}}}

Target Language:
{{{targetLanguage}}}

Provide ONLY the translated text as your response.`,
});

const tamilTranslatorFlow = ai.defineFlow(
  {
    name: 'tamilTranslatorFlow',
    inputSchema: TamilTranslatorInputSchema,
    outputSchema: TamilTranslatorOutputSchema,
  },
  async (input, streamingCallback) => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (e: any) {
        if (retries > 0 && e.message?.includes('503')) {
          console.log(`Retrying... attempts left: ${retries - 1}`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        } else {
          throw e;
        }
      }
      retries--;
    }
    throw new Error('Flow failed after multiple retries.');
  }
);
