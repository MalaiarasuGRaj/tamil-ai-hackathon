'use server';

/**
 * @fileOverview This file defines a Genkit flow for foreign word replacement in Tamil text.
 *
 * The flow identifies non-Tamil words in a paragraph, suggests Tamil replacements,
 * and allows the user to choose whether to replace each foreign word or keep it.
 *
 * @exports foreignWordReplacement - The main function to initiate the foreign word replacement flow.
 * @exports ForeignWordReplacementInput - The input type for the foreignWordReplacement function.
 * @exports ForeignWordReplacementOutput - The output type for the foreignWordReplacement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForeignWordReplacementInputSchema = z.object({
  paragraph: z.string().describe('The paragraph containing foreign words to be replaced.'),
});
export type ForeignWordReplacementInput = z.infer<typeof ForeignWordReplacementInputSchema>;

const ReplacementOptionSchema = z.object({
  originalWord: z.string().describe('The original foreign word.'),
  suggestedReplacement: z.string().describe('The suggested Tamil replacement.'),
  replace: z.boolean().describe('Whether the user wants to replace the original word with the suggested replacement.'),
});

const ForeignWordReplacementOutputSchema = z.object({
  highlightedText: z.string().describe('The original text with foreign words highlighted.'),
  replacementOptions: z.array(ReplacementOptionSchema).describe('The list of replacement options for each foreign word.'),
  updatedParagraph: z.string().describe('The final updated Tamil-only paragraph after user confirmation.'),
});
export type ForeignWordReplacementOutput = z.infer<typeof ForeignWordReplacementOutputSchema>;

export async function foreignWordReplacement(input: ForeignWordReplacementInput): Promise<ForeignWordReplacementOutput> {
  return foreignWordReplacementFlow(input);
}

const foreignWordReplacementPrompt = ai.definePrompt({
  name: 'foreignWordReplacementPrompt',
  input: {schema: ForeignWordReplacementInputSchema},
  output: {schema: ForeignWordReplacementOutputSchema},
  prompt: `You are an expert in the Tamil language.

You will be given a paragraph that may contain foreign words. Your task is to identify these words, suggest appropriate formal Tamil replacements, and return the original text with the foreign words highlighted, a list of replacement options, and the final updated Tamil-only paragraph after user confirmation.

Paragraph: {{{paragraph}}}

Highlight the foreign words in the original text using markdown. Provide a list of suggested Tamil replacements for each highlighted word, with a "Replace" or "Keep" option for each. Finally, provide the updated Tamil-only paragraph after user confirmation. Focus on maintaining the original meaning and context of the sentence.

Output the result in JSON format.
`,
});

const foreignWordReplacementFlow = ai.defineFlow(
  {
    name: 'foreignWordReplacementFlow',
    inputSchema: ForeignWordReplacementInputSchema,
    outputSchema: ForeignWordReplacementOutputSchema,
  },
  async (input, streamingCallback) => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await foreignWordReplacementPrompt(input);
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
