'use server';
/**
 * @fileOverview This file defines a Genkit flow for foreign word replacement in Tamil text.
 *
 * The flow identifies non-Tamil words in a paragraph, suggests Tamil replacements,
 * and allows the user to choose whether to replace each foreign word or keep it.
 *
 * @exports foreignWordReplacement - The main function to initiate the foreign word replacement flow.
 * @exports ForeignWordReplacementInput - The input type for the foreignWordReplacement function.
 * @exports ForeignWordReplacementOutput - The return type for the foreignWordReplacement function.
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
});

const ForeignWordReplacementOutputSchema = z.object({
  highlightedText: z.string().describe('The original text with foreign words highlighted.'),
  replacementOptions: z.array(ReplacementOptionSchema).describe('The list of replacement options for each foreign word.'),
});
export type ForeignWordReplacementOutput = z.infer<typeof ForeignWordReplacementOutputSchema>;

const prompt = ai.definePrompt({
  name: 'foreignWordReplacementPrompt',
  input: {schema: ForeignWordReplacementInputSchema},
  output: {schema: ForeignWordReplacementOutputSchema},
  prompt: `You are an expert in the Tamil language.

You will be given a paragraph that may contain foreign words. Your task is to identify these words, suggest appropriate formal Tamil replacements, and return the original text with the foreign words highlighted and a list of replacement options.

Paragraph: {{{paragraph}}}

Highlight the foreign words in the original text using markdown's bold syntax (**word**). Provide a list of suggested Tamil replacements for each highlighted word. Focus on maintaining the original meaning and context of the sentence.`,
});

const foreignWordReplacementFlow = ai.defineFlow(
  {
    name: 'foreignWordReplacementFlow',
    inputSchema: ForeignWordReplacementInputSchema,
    outputSchema: ForeignWordReplacementOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);


export async function foreignWordReplacement(input: ForeignWordReplacementInput): Promise<ForeignWordReplacementOutput> {
  return await foreignWordReplacementFlow(input);
}
