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

const prompt = `You are an expert in the Tamil language.

You will be given a paragraph that may contain foreign words. Your task is to identify these words, suggest appropriate formal Tamil replacements, and return the original text with the foreign words highlighted and a list of replacement options.

Paragraph: {paragraph}

Highlight the foreign words in the original text using markdown's bold syntax (**word**). Provide a list of suggested Tamil replacements for each highlighted word. Focus on maintaining the original meaning and context of the sentence.

Output the result as a valid JSON object that follows this Zod schema:
${JSON.stringify({
  highlightedText: "string",
  replacementOptions: [{
    originalWord: "string",
    suggestedReplacement: "string",
  }]
})}
`;

export async function foreignWordReplacement(input: ForeignWordReplacementInput): Promise<ForeignWordReplacementOutput> {
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
  
  // Filter out incomplete replacement options before parsing
  if (jsonContent.replacementOptions && Array.isArray(jsonContent.replacementOptions)) {
    jsonContent.replacementOptions = jsonContent.replacementOptions.filter(
      (opt: any) => opt.originalWord && opt.suggestedReplacement
    );
  }
  
  return ForeignWordReplacementOutputSchema.parse(jsonContent);
}
