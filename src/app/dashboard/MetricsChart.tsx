'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns'

type ChartData = {
  report_date: string;
  leads: number | null;
  spend: number | null;
}

export default function MetricsChart({ data }: { data: ChartData[] }) {
  // NEW: Check if there is data. If not, show a message instead of the chart.
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mt-8 flex items-center justify-center" style={{ height: '400px' }}>
        <p className="text-gray-500">No data available for the selected period.</p>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    report_date: format(new Date(item.report_date), 'MMM d'),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-8" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="report_date" />
          <YAxis yAxisId="left" label={{ value: 'Leads', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: 'Spend ($)', angle: -90, position: 'insideRight' }} />
          <Tooltip formatter={(value, name) => name === 'spend' ? `$${(value as number).toFixed(2)}` : value} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="spend" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}