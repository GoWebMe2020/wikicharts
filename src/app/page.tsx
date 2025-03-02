import React from 'react';
import ChartPage from './ChartPage';

// This is my main page in the Next.js App Router. It imports and renders
// the ChartPage component, which is a Client Component that handles
// all the scraping and chart logic.
const Page = () => {
  return (
    <div>
      <ChartPage />
    </div>
  );
}

export default Page;
