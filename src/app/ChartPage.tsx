'use client';

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Papa from 'papaparse';

// Here I'm registering the Chart.js components that I'll be using in my chart.
// This includes the X/Y scales, the line element, and so on.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// This type matches the data I'm receiving from the server side.
type DataPoint = {
  date: string;
  mark: number;
  athlete: string;
  venue: string;
};

export const ChartPage = () => {
  // wikiUrl holds the user-input URL. dataPoints will store the array of scraped rows.
  const [wikiUrl, setWikiUrl] = useState('');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  // This "wow feature" is a CSV download. I use Papa.parse to convert the array of
  // objects into CSV text, then trigger a download in the browser.
  const handleDownloadCSV = () => {
    const csv = Papa.unparse(dataPoints);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'high_jump_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // When the user clicks "Scrape," I call my /api/scrape endpoint
  // passing in the wikiUrl as a query param. If it's successful,
  // I log the data to the console and then store it in state.
  const handleScrape = async () => {
    if (!wikiUrl) return;

    try {
      const res = await fetch(`/api/scrape?url=${encodeURIComponent(wikiUrl)}`);
      if (!res.ok) {
        console.error('Failed to scrape the page');
        return;
      }
      const jsonData = await res.json();

      // I'm printing the entire JSON response to the console so I can see the results.
      console.log('Scraped data:', jsonData);

      // If the response has a "data" property, that's my array of DataPoint objects.
      if (jsonData.data) {
        setDataPoints(jsonData.data);
      }
    } catch (error) {
      console.error('Error while scraping:', error);
    }
  };

  // Here I'm setting up the chart data to be displayed by react-chartjs-2.
  // I use the date strings as the labels along the X-axis and the numeric
  // mark values as the data points along the Y-axis.
  const chartData = {
    labels: dataPoints.map((dp) => dp.date),
    datasets: [
      {
        label: 'High Jump (m)',
        data: dataPoints.map((dp) => dp.mark),
      },
    ],
  };

  // Simple options for the chart. I'm adding a title, and
  // naming the X/Y axes for clarity.
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Women’s High Jump World Record Progression',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Height (m)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wikipedia Table Scraper</h1>

      {/* Basic input + button for entering the Wikipedia URL and triggering the scrape */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter Wikipedia URL"
          value={wikiUrl}
          onChange={(e) => setWikiUrl(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={handleScrape}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Scrape
        </button>
      </div>

      {/* If there's data, I'll show the CSV download button. Otherwise, it remains hidden. */}
      {dataPoints.length > 0 && (
        <div className="mb-4">
          <button
            onClick={handleDownloadCSV}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Download CSV
          </button>
        </div>
      )}

      {/* Conditionally render the chart if there's data. Otherwise, show a friendly message. */}
      {dataPoints.length > 0 ? (
        <>
          <p className="mb-2">
            Showing {dataPoints.length} records from the table
          </p>
          <Line data={chartData} options={chartOptions} />
        </>
      ) : (
        <p>No data yet. Enter a URL and click “Scrape.”</p>
      )}
    </div>
  );
}

export default ChartPage;
