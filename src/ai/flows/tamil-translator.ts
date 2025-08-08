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
import {getTamilGlossaryTerm} from '@/ai/tools/glossary';

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
  tools: [getTamilGlossaryTerm],
  prompt: `You are a translation expert specializing in Tamil and other languages. Your task is to provide a high-quality, natural-sounding translation.

First, identify the source language of the text. Then, translate the following text into the specified target language.

For technical terms, use the getTamilGlossaryTerm tool to get the most accurate translation.

Pay close attention to:
- Preserving the original meaning and intent.
- Using natural phrasing and correct grammar in the target language.
- Considering cultural nuances and context to provide the most appropriate translation.
- Handling idiomatic expressions gracefully.

Text to Translate:
{{{text}}}

Target Language:
{{{targetLanguage}}}

Provide only the translated text as the output.`,
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
