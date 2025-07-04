import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type QuestionWithResponses } from '@shared/schema';

interface PollChartProps {
  question: QuestionWithResponses;
}

export default function PollChart({ question }: PollChartProps) {
  if (question.type !== 'multiple-choice' || !question.options) {
    return null;
  }

  const data = question.options.map((option, index) => {
    const count = question.responses.filter(r => r.answer === option).length;
    const colors = [
      '#1976D2', // primary
      '#388E3C', // secondary
      '#FFB300', // yellow
      '#F44336', // red
      '#9C27B0', // purple
      '#E91E63', // pink
    ];
    
    return {
      name: option,
      count,
      fill: colors[index % colors.length],
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          allowDecimals={false}
        />
        <Tooltip 
          formatter={(value) => [value, 'Stimmen']}
          labelStyle={{ color: '#374151' }}
        />
        <Bar 
          dataKey="count" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
