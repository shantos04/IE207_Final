import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

interface StatCardProps {
    title: string;
    value: string;
    change: number;
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
    chartData: Array<{ value: number }>;
}

export default function StatCard({
    title,
    value,
    change,
    icon: Icon,
    iconBgColor,
    iconColor,
    chartData,
}: StatCardProps) {
    const isPositive = change > 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                </div>
                <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', iconBgColor)}>
                    <Icon className={clsx('w-6 h-6', iconColor)} />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={clsx('text-sm font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                </div>
            </div>

            {/* Mini Chart */}
            <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? '#10b981' : '#ef4444'}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
