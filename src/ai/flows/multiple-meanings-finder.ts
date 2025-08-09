'use server';
/**
 * @fileOverview A flow that identifies words with multiple meanings in a Tamil paragraph.
 *
 * - multipleMeaningsFinder - A function that handles the multiple meanings finding process.
 * - MultipleMeaningsFinderInput - The input type for the multipleMeaningsFinder function.
 * - MultipleMeaningsFinderOutput - The return type for the multipleMeaningsFinder function.
 */

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

const prompt = `You are an expert in the Tamil language. You will analyze a given Tamil paragraph and identify words that have multiple meanings based on the context. For each identified word, you will provide a list of possible meanings with a confidence score (0-1) and an example sentence in Tamil for each meaning.

Paragraph:
{paragraph}

Highlight the ambiguous words in the original paragraph using markdown's bold syntax (**word**).

Output the result as a valid JSON object that follows this Zod schema:
${JSON.stringify(MultipleMeaningsFinderOutputSchema.shape)}
`;

export async function multipleMeaningsFinder(input: MultipleMeaningsFinderInput): Promise<MultipleMeaningsFinderOutput> {
  const requestBody = {
    model: 'google/gemini-flash-1.5',
    messages: [
      {
        role: 'user',
        content: prompt.replace('{paragraph}', input.paragraph),
      },
    ],
    response_format: { type: 'json_object' },
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const jsonContent = JSON.parse(data.choices[0].message.content);
  return MultipleMeaningsFinderOutputSchema.parse(jsonContent);
}
