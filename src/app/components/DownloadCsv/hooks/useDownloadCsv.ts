import Papa from 'papaparse';

import type { DataPoint } from '../../../lib/models/DataPoint';

export const useDownloadCsv = () => {

  // This function triggers a CSV download of the scraped data. I'm using Papa to
  // convert the array to CSV text, then create a Blob and programmatically download it.
  const handleDownloadCSV = (dataPoints: DataPoint[]) => {
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
  return {
    handleDownloadCSV,
  };
};
