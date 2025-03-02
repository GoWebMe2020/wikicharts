import React from 'react'

import type { DataPoint } from '../../lib/models/DataPoint';

import { useDownloadCsv } from './hooks/useDownloadCsv';

type DownloadCsvProps = {
  dataPoints: DataPoint[];
}

const DownloadCsv = ({dataPoints}: DownloadCsvProps) => {

  const { handleDownloadCSV } = useDownloadCsv();

  return (
    <div className="mb-4">
      <button
        onClick={() => handleDownloadCSV(dataPoints)}
        className="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Download CSV
      </button>
    </div>
  )
}

export default DownloadCsv;
