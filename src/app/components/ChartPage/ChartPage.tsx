'use client';

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

import { useChartPage } from './hooks/useChartPage';

import DownloadCsv from '../DownloadCsv/DownloadCsv';

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

export const ChartPage = () => {
  const {
    wikiUrl,
    setWikiUrl,
    dataPoints,
    handleScrape,
  } = useChartPage();

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

  const chartTitle = dataPoints.length
    ? `Scraped ${dataPoints.length} records!`
    : 'Waiting for data...';

  // Simple options for the chart. I'm adding a dynamic title using chartTitle, and
  // naming the X/Y axes for clarity.
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: chartTitle,
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
        <DownloadCsv dataPoints={dataPoints} />
      )}

      {/* Conditionally render the chart if there's data. Otherwise, show a friendly message. */}
      {dataPoints.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p>No data yet. Enter a URL and click “Scrape.”</p>
      )}
    </div>
  );
}

export default ChartPage;
