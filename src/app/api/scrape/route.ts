import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

import type { DataPoint } from '../../lib/models/DataPoint'

export const GET = async (request: NextRequest) => {
  try {
    // First, I extract the "url" query parameter from the request URL.
    // This is the Wikipedia URL that I'll scrape.
    const { searchParams } = new URL(request.url);
    const wikiUrl = searchParams.get('url');

    // If there's no "url" query parameter, I return a 400 error so the client
    // knows they made a bad request.
    if (!wikiUrl) {
      return NextResponse.json(
        { error: 'Missing "url" query parameter' },
        { status: 400 }
      );
    }

    // Now I fetch the HTML from the provided Wikipedia URL.
    // If the fetch fails (like a 404 or 500), I throw a 500 error back.
    const response = await fetch(wikiUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch the Wikipedia page' },
        { status: 500 }
      );
    }

    // Then, I read the entire HTML response as text so I can parse it with Cheerio.
    const html = await response.text();

    // I load the HTML into Cheerio so I can use jQuery-like syntax to query the DOM.
    const $ = cheerio.load(html);

    // I look for the first table with the class "wikitable".
    // For this project, I'm assuming that's the table I want.
    // If there are multiple, I'd need more sophisticated logic.
    const table = $('table.wikitable').first();

    // I'll accumulate all the valid rows into this array.
    const result: DataPoint[] = [];

    // I use Cheerio to find each table row (tr) inside the table.
    table.find('tr').each((i, row) => {
      // I'll keep track of each column's text here before I parse them.
      let markVal = '';
      let athleteVal = '';
      let dateVal = '';
      let venueVal = '';

      // Each table row has multiple columns (td). I'm expecting at least 4 here.
      // The order matters: Mark, Athlete, Date, Venue.
      const cells = $(row).find('td');

      if (cells.length >= 4) {
        markVal = $(cells[0]).text().trim();
        athleteVal = $(cells[1]).text().trim();
        dateVal = $(cells[2]).text().trim();
        venueVal = $(cells[3]).text().trim();
      }

      // Marks typically look like "1.46 m (4 ft 9+1⁄4 in)".
      // I use a regex to grab the numeric portion before the 'm'.
      const match = markVal.match(/([\d.]+)/);
      let numericMark = 0;
      if (match) {
        numericMark = parseFloat(match[1]);
      }

      // Because the date can have different formats, I simply store the string
      // for now, though I could parse it further if needed.

      // I only add this row to the final array if the mark is valid (above 0)
      // and I have text for athlete, date, and venue.
      if (numericMark > 0 && athleteVal && dateVal && venueVal) {
        result.push({
          date: dateVal,
          mark: numericMark,
          athlete: athleteVal,
          venue: venueVal,
        });
      }
    });

    // Finally, I return the scraped data as JSON. This will be consumed by the client side.
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err: unknown) {
    // If something unexpected happens, I log it and respond with an error message.
    console.error('Scraping error:', err);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
};
