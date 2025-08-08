'use server';
/**
 * @fileOverview A tool that provides accurate Tamil translations for technical terms.
 *
 * - getTamilGlossaryTerm - A tool that returns the Tamil translation for a given English technical term.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const glossary: Record<string, string> = {
  'laptop': 'மடிக்கணினி',
  'computer': 'கணிப்பொறி',
  'software': 'மென்பொருள்',
  'hardware': 'வன்பொருள்',
  'internet': 'இணையம்',
  'website': 'இணையதளம்',
  'email': 'மின்னஞ்சல்',
  'application': 'செயலி',
  'database': 'தரவுத்தளம்',
  'keyboard': 'விசைப்பலகை',
  'mouse': 'சொடுக்கி',
};

export const getTamilGlossaryTerm = ai.defineTool(
  {
    name: 'getTamilGlossaryTerm',
    description: 'Provides the precise Tamil translation for a given English technical term from a glossary.',
    inputSchema: z.object({
      term: z.string().describe('The English technical term to translate.'),
    }),
    outputSchema: z.string().optional(),
  },
  async (input) => {
    return glossary[input.term.toLowerCase()];
  }
);
