import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { Element } from 'domhandler';

import type { DataPoint } from '../../lib/models/DataPoint';

export const GET = async (request: NextRequest) => {
  try {
    // I start by grabbing the "url" query parameter, which should hold the Wikipedia page URL.
    const { searchParams } = new URL(request.url);
    const wikiUrl = searchParams.get('url');

    if (!wikiUrl) {
      return NextResponse.json(
        { error: 'Missing "url" query parameter' },
        { status: 400 }
      );
    }

    // Next, I fetch the HTML of the provided Wikipedia URL.
    // If something goes wrong (like a 404), I'll return a 500 error to the client.
    const response = await fetch(wikiUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch the Wikipedia page' },
        { status: 500 }
      );
    }

    // Load the entire HTML response into Cheerio so I can parse it like a DOM.
    const html = await response.text();
    const $ = cheerio.load(html);

    // I gather all "wikitable" tables on this page. Some pages have multiple,
    // and I only want the one that gives me the most valid data rows.
    const allTables = $('table.wikitable');

    // I track which table yields the "best" (i.e., largest) dataset of valid rows.
    let bestData: DataPoint[] = [];

    // Go through each wikitable, parse it, and see if it returns more rows than our current best.
    allTables.each((_, tableEl) => {
      const currentResult = parseTable($, tableEl);

      // If this table’s result is bigger, I update bestData to match this one.
      if (currentResult.length > bestData.length) {
        bestData = currentResult;
      }
    });

    // After checking all tables, I return the data from the one with the most valid rows.
    return NextResponse.json({ data: bestData }, { status: 200 });

  } catch (err: unknown) {
    // In case of an unexpected issue, I'll log it and send back a 500 status code.
    console.error('Scraping error:', err);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
};

/**
 * parseTable($, tableEl):
 *  - Finds the table's header cells to locate the correct columns for Mark, Athlete, Date, and Venue.
 *  - Loops over each row, reads the right cell for each property (based on header text),
 *    and tries to build a valid DataPoint if everything matches up.
 */
const parseTable = ($: cheerio.CheerioAPI, tableEl: Element): DataPoint[] => {
  const result: DataPoint[] = [];

  // First, I grab the header row to figure out which column is Mark, Athlete, Date, and Venue.
  const headerRow = $(tableEl).find('tr').first();
  const headerCells = headerRow.find('th');

  // This object will map each column name (lowercase) to its index, e.g. "mark": 0, "athlete": 1, etc.
  const headerMap: Record<string, number> = {};

  headerCells.each((i, th) => {
    const headerText = $(th).text().trim().toLowerCase();
    // I'm checking if each header includes specific keywords. You can adjust if needed.
    if (headerText.includes('mark')) {
      headerMap['mark'] = i;
    } else if (headerText.includes('athlete')) {
      headerMap['athlete'] = i;
    } else if (headerText.includes('date')) {
      headerMap['date'] = i;
    } else if (headerText.includes('venue')) {
      headerMap['venue'] = i;
    }
  });

  // Now I skip the header row and process all subsequent rows in the table.
  $(tableEl)
    .find('tr')
    .slice(1)
    .each((_, row) => {
      // Identify which columns correspond to each property.
      const markIndex = headerMap['mark'];
      const athleteIndex = headerMap['athlete'];
      const dateIndex = headerMap['date'];
      const venueIndex = headerMap['venue'];

      // If any are missing, this row won't parse properly, so I skip it.
      if (
        markIndex === undefined ||
        athleteIndex === undefined ||
        dateIndex === undefined ||
        venueIndex === undefined
      ) {
        return;
      }

      // Pull out the cells using the discovered column indices.
      const cells = $(row).find('td');
      const markVal = $(cells[markIndex]).text().trim();
      const athleteVal = $(cells[athleteIndex]).text().trim();
      const dateVal = $(cells[dateIndex]).text().trim();
      const venueVal = $(cells[venueIndex]).text().trim();

      // For the mark, I parse out the numeric portion from something like "2.06 m (6 ft 9 in)".
      const match = markVal.match(/([\d.]+)/);
      let numericMark = 0;
      if (match) {
        numericMark = parseFloat(match[1]);
      }

      // Only add a row if I have a positive mark and non-empty strings for the other fields.
      if (numericMark > 0 && athleteVal && dateVal && venueVal) {
        result.push({
          date: dateVal,
          mark: numericMark,
          athlete: athleteVal,
          venue: venueVal,
        });
      }
    });

  return result;
};
