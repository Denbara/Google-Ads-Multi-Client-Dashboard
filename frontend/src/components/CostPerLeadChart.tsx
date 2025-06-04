import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CostPerLeadChartProps {
  data: {
    date: string;
    costPerLead: number;
    benchmark: number;
  }[];
}

const CostPerLeadChart: React.FC<CostPerLeadChartProps> = ({ data }) => {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Cost Per Lead Trend</CardTitle>
        <CardDescription>Daily cost per lead compared to benchmark</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="costPerLead" 
                name="Cost Per Lead" 
                stroke="#ff7300" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                name="Target Benchmark" 
                stroke="#82ca9d" 
                strokeDasharray="5 5" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostPerLeadChart;
