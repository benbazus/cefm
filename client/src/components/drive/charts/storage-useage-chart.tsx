import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface StorageData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

interface StorageUsageLineChartProps {
  data: StorageData | null
}

export const StorageUsageLineChart: React.FC<StorageUsageLineChartProps> = ({
  data,
}) => {
  if (
    !data ||
    !Array.isArray(data.labels) ||
    data.labels.length === 0 ||
    !Array.isArray(data.datasets) ||
    data.datasets.length === 0
  ) {
    return <div>No data available</div>
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Storage Usage Over Time',
      },
    },
  }

  return <Line options={options} data={data} />
}
