'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, ShoppingBag, ArrowUpRight, Flame } from 'lucide-react';

// Hourly revenue and orders trend with a designated peak
const HOURLY_TREND_DATA = [
  { time: '08:00', revenue: 420, orders: 12 },
  { time: '09:00', revenue: 680, orders: 18 },
  { time: '10:00', revenue: 890, orders: 24 },
  { time: '11:00', revenue: 1120, orders: 29 },
  { time: '12:00', revenue: 1350, orders: 35 },
  { time: '13:00', revenue: 980, orders: 25 },
  { time: '14:00', revenue: 1240, orders: 32 },
  { time: '15:00', revenue: 1390, orders: 36 },
  { time: '16:00', revenue: 1550, orders: 42, isPeak: true }, // PEAK POINT
  { time: '17:00', revenue: 1420, orders: 38 },
  { time: '18:00', revenue: 1180, orders: 30 },
  { time: '19:00', revenue: 860, orders: 22 },
  { time: '20:00', revenue: 540, orders: 14 },
];

const VARIANT_DATA = [
  { name: 'Manhattan Velvet Cappuccino', value: 71, color: '#C86D3C' },
  { name: 'Classic Latte', value: 47, color: '#E09865' },
  { name: 'Dark Roast Espresso', value: 31, color: '#5C3826' },
  { name: 'Cold Frappe Malai', value: 19, color: '#10B981' },
];

const TOTAL_ORDERS = VARIANT_DATA.reduce((sum, item) => sum + item.value, 0); // 168

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink-950/95 backdrop-blur-md border border-ink-800 text-ink-100 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
        <p className="font-semibold text-ink-300 pb-1 border-b border-ink-800 flex items-center justify-between gap-4">
          <span>Hour: {label}</span>
          {label === '16:00' && (
            <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Peak Hour
            </span>
          )}
        </p>
        <div className="flex items-center justify-between gap-4 text-brand-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            Revenue:
          </span>
          <span className="font-mono font-semibold">₹{payload[0]?.value?.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-emerald-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Orders:
          </span>
          <span className="font-mono font-semibold">{payload[1]?.value} cups</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RechartsDashboardCharts() {
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* 1. Dual-Axis Line & Area Chart (Revenue + Orders Trend) */}
      <div className="lg:col-span-2 bg-panel rounded-2xl border border-ink-200/80 shadow-xs p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ink-900 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Revenue & Orders Trend
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ArrowUpRight className="w-3 h-3" /> +14.8% vs last week
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Hourly aggregate with automated Peak Marker detection (Dual-Axis)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-brand-500 rounded-full" />
              <span className="text-ink-600 font-medium">Revenue (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span className="text-ink-600 font-medium">Orders (Cups)</span>
            </div>
          </div>
        </div>

        {/* Peak Badge Floating Banner */}
        <div className="mb-2 flex items-center justify-end">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/10 border border-amber-300 text-amber-900 text-xs font-semibold shadow-xs animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Peak Detected: <strong>₹1,550 / 4 PM</strong> (42 cups dispensed)</span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={HOURLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C86D3C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C86D3C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#888' }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(v) => `₹${v}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#C86D3C"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10B981', strokeWidth: 1 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Variant Donut Chart with Center Text */}
      <div className="bg-panel rounded-2xl border border-ink-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-ink-900 text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              Variant Breakdown
            </h3>
            <span className="text-[11px] font-mono text-ink-500 bg-ink-100 px-2 py-0.5 rounded-md font-medium">
              Today
            </span>
          </div>
          <p className="text-xs text-ink-500 mb-4">
            Volume distribution by coffee recipe profile
          </p>
        </div>

        {/* Donut Container with Center Text */}
        <div className="relative h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: unknown) => [
                  `${value} orders (${Math.round((Number(value) / TOTAL_ORDERS) * 100)}%)`,
                  'Volume',
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Pie
                data={VARIANT_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={92}
                paddingAngle={4}
                animationDuration={900}
                onMouseEnter={(_, index) => setActiveSegment(VARIANT_DATA[index].name)}
                onMouseLeave={() => setActiveSegment(null)}
              >
                {VARIANT_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[11px] font-medium text-ink-500 uppercase tracking-wider">Total Orders</span>
            <span className="text-2xl font-bold font-mono text-ink-900 leading-tight">168</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +18.4%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-ink-100 text-xs">
          {VARIANT_DATA.map((item) => (
            <div
              key={item.name}
              className={`flex items-start gap-1.5 p-1 rounded-md transition-colors ${
                activeSegment === item.name ? 'bg-ink-100 font-semibold' : ''
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="truncate">
                <p className="truncate text-ink-800 text-[11px] leading-tight">{item.name}</p>
                <p className="text-ink-500 text-[10px] font-mono">
                  {item.value} ({Math.round((item.value / TOTAL_ORDERS) * 100)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
