import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { RevenueData } from '../../types';

interface RevenueChartProps {
    data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1_000_000_000) {
            return `${(value / 1_000_000_000).toFixed(1)}B`;
        } else if (value >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(0)}M`;
        } else if (value >= 1_000) {
            return `${(value / 1_000).toFixed(0)}K`;
        } else {
            return value.toString();
        }
    };

    const formatDate = (dateString: string) => {
        // Safely parse date to avoid NaN/NaN
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '';
            }
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } catch {
            return '';
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Doanh thu 30 ngày</h3>
                    <p className="text-sm text-gray-500 mt-1">Biểu đồ doanh thu theo ngày</p>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '12px',
                            }}
                            formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            connectNulls={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
