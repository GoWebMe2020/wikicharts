import type { DataPoint } from '../../../lib/models/DataPoint';

import { useState } from 'react';

export const useChartPage = () => {
  // wikiUrl holds the user's input for the Wikipedia page to scrape.
  const [wikiUrl, setWikiUrl] = useState('');
  // dataPoints is our array of records scraped from the table.
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  // This function calls our /api/scrape endpoint to fetch the table data from the provided wikiUrl.
  // If it succeeds, we store the resulting data array in state.
  const handleScrape = async () => {
    if (!wikiUrl) return;

    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(wikiUrl)}`);
      if (!res.ok) {
        console.error('Failed to scrape the page');
        return;
      }
      const jsonData = await res.json();

      // If the response has a "data" property, we assume it's our DataPoint array.
      if (jsonData.data) {
        setDataPoints(jsonData.data);
      }
    } catch (error) {
      console.error('Error while scraping:', error);
    }
  };

  // Return the state and any "actions" that the consumer (ChartPage component) might need.
  return {
    wikiUrl,
    setWikiUrl,
    dataPoints,
    handleScrape,
  };
};
