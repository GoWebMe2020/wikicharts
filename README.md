# Wikipedia Table Scraper & Chart

This repository demonstrates a Next.js application that scrapes Wikipedia table data (e.g., high jump records) and displays it in a dynamic chart on the client side. Users can enter any Wikipedia URL containing a “wikitable,” and the app returns the relevant numeric data for charting.

### Table of Contents

* Tech Overview
* Setup and Installation
* How It Works
* Features

### Tech Overview
* Next.js (App Router): Modern file-based routing and server functions.
* TypeScript: Static type checking for reliability and developer confidence.
* React: Client components for building the UI.
* Chart.js & react-chartjs-2: Charts to visualize the scraped data.
* Cheerio: Server-side HTML parsing to scrape tabular data.
* Papa Parse: CSV export utility.

### Setup and Installation
* Clone or Download this repository.
* Install dependencies:
```
npm install
```
* Run the development server:

```
npm run dev
```
* Open http://localhost:3000 to see the application.

### How It Works
1. User Input:
* On the main page (src/app/page.tsx), the user types any Wikipedia URL into an input field and clicks “Scrape.”

2. Server-Side Scraping:
* The client calls our API route at src/app/api/scrape/route.ts.
* That route fetches the Wikipedia page HTML, then parses it with * Cheerio to locate all tables of class wikitable.
* We examine each table to determine which one yields the most valid rows (based on columns like Mark, Athlete, Date, and Venue).
The server returns the “best” data as JSON. (One “Wow” Feature)

3. Chart Display:
* The client receives the JSON array of records (with mark, date, athlete, venue) and stores it in React state.
* We then pass the data into Chart.js (via react-chartjs-2) to visualize the progression of heights over time.

4. CSV Download (Other “Wow” Feature):
* Users can click Download CSV to export the displayed data using Papa Parse.

### Features
* Next.js: Uses the new App Router structure (route.ts for server endpoints).
* Scrape Wikipedia Pages: Not locked to just one URL; tries to parse whichever table returns the largest number of valid rows.
* Robust Column Detection: For tables with columns in different orders, we read the header row and dynamically map Mark, Athlete Date, and Venue.
* CSV Export: Provides a convenient “Download CSV” button.
* Modular File Structure: Logic is separated into custom hooks, components, and models for readability and scalability.

Thank You!
