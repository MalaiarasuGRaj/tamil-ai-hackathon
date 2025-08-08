'use server';

/**
 * @fileOverview A flow that identifies words with multiple meanings in a Tamil paragraph.
 *
 * - multipleMeaningsFinder - A function that handles the multiple meanings finding process.
 * - MultipleMeaningsFinderInput - The input type for the multipleMeaningsFinder function.
 * - MultipleMeaningsFinderOutput - The return type for the multipleMeaningsFinder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultipleMeaningsFinderInputSchema = z.object({
  paragraph: z.string().describe('The Tamil paragraph to analyze.'),
});
export type MultipleMeaningsFinderInput = z.infer<typeof MultipleMeaningsFinderInputSchema>;

const MeaningSchema = z.object({
  meaning: z.string().describe('The meaning of the word.'),
  confidence: z.number().describe('The confidence score (0-1) for this meaning.'),
  exampleSentence: z.string().describe('An example sentence in Tamil using this meaning.'),
});

const AmbiguousWordSchema = z.object({
  word: z.string().describe('The ambiguous word.'),
  meanings: z.array(MeaningSchema).describe('Possible meanings of the word.'),
});

const MultipleMeaningsFinderOutputSchema = z.object({
  highlightedParagraph: z
    .string()
    .describe('The original paragraph with ambiguous words highlighted.'),
  ambiguousWords: z.array(AmbiguousWordSchema).describe('List of ambiguous words with their meanings.'),
});
export type MultipleMeaningsFinderOutput = z.infer<typeof MultipleMeaningsFinderOutputSchema>;

export async function multipleMeaningsFinder(input: MultipleMeaningsFinderInput): Promise<MultipleMeaningsFinderOutput> {
  return multipleMeaningsFinderFlow(input);
}

const multipleMeaningsFinderPrompt = ai.definePrompt({
  name: 'multipleMeaningsFinderPrompt',
  input: {schema: MultipleMeaningsFinderInputSchema},
  output: {schema: MultipleMeaningsFinderOutputSchema},
  prompt: `You are an expert in the Tamil language. You will analyze a given Tamil paragraph and identify words that have multiple meanings based on the context. For each identified word, you will provide a list of possible meanings with a confidence score (0-1) and an example sentence in Tamil for each meaning.

Paragraph:
{{{paragraph}}}

Output format:
{
  "highlightedParagraph": "Original paragraph with ambiguous words highlighted.",
  "ambiguousWords": [
    {
      "word": "ambiguous word",
      "meanings": [
        {
          "meaning": "meaning of the word",
          "confidence": confidence score (0-1),
          "exampleSentence": "An example sentence in Tamil"
        }
      ]
    }
  ]
`,
});

const multipleMeaningsFinderFlow = ai.defineFlow(
  {
    name: 'multipleMeaningsFinderFlow',
    inputSchema: MultipleMeaningsFinderInputSchema,
    outputSchema: MultipleMeaningsFinderOutputSchema,
  },
  async (input, streamingCallback) => {
    let retries = 3;
    while (retries > 0) {
      try {
        const {output} = await multipleMeaningsFinderPrompt(input);
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
