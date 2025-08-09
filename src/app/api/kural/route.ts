import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const revalidate = 86400; // Revalidate every 24 hours

export async function GET() {
  try {
    const response = await fetch('https://thirukkural.io/', {
        next: { revalidate: 86400 } // Cache for 24 hours
    });
    if (!response.ok) {
      throw new Error('Failed to fetch data from thirukkural.io');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const kuralContainer = $('.kural-container').first();
    const kuralNumber = kuralContainer.find('.kural-no').text().trim();
    const kuralLines = kuralContainer
      .find('.kural-lines p')
      .map((i, el) => $(el).text().trim())
      .get();
    const kuralMeaning = kuralContainer.find('.kural-meaning p').text().trim();

    if (!kuralNumber || kuralLines.length < 2 || !kuralMeaning) {
        throw new Error('Failed to parse Kural data');
    }

    return NextResponse.json({
      number: kuralNumber,
      line1: kuralLines[0],
      line2: kuralLines[1],
      meaning: kuralMeaning,
    });
  } catch (error) {
    console.error('Kural API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch Thirukkural', details: errorMessage }, { status: 500 });
  }
}
