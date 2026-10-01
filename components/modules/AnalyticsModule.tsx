'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  PieChart,
  GitCompare,
  DollarSign,
  Download,
} from 'lucide-react';

export default function AnalyticsModule() {
  const { dateRange, setDateRange, toast } = useAdmin();
  const [subRoute, setSubRoute] = useState<
    'sales' | 'products' | 'consumption' | 'machines' | 'profitability'
  >('sales');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hoursOfDay = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Performance &amp; Profitability Analytics
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Unit economics, 24×7 consumption heatmaps, machine fleet comparisons, and margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-line rounded-lg p-1 text-xs shadow-xs">
            {(['Today', 'This Week', 'This Month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  dateRange === r
                    ? 'bg-brand-500 text-white font-semibold shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => toast('Analytics report package downloaded', 'success')}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-line rounded-lg text-xs font-semibold text-ink-700 hover:bg-page"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Analytics Sub Navigation */}
      <div className="flex border-b border-line text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setSubRoute('sales')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subRoute === 'sales'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Sales &amp; Tier Mix
        </button>
        <button
          onClick={() => setSubRoute('products')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subRoute === 'products'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Product Variant Cannibalisation
        </button>
        <button
          onClick={() => setSubRoute('consumption')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subRoute === 'consumption'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          24×7 Consumption Heatmap
        </button>
        <button
          onClick={() => setSubRoute('machines')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subRoute === 'machines'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Fleet Machine Comparison
        </button>
        <button
          onClick={() => setSubRoute('profitability')}
          className={`py-3 px-4 border-b-2 transition whitespace-nowrap cursor-pointer ${
            subRoute === 'profitability'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Profitability &amp; Unit Economics
        </button>
      </div>

      {/* 1. SALES & TIER MIX */}
      {subRoute === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-5 lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-ink-900">
                Tier Mix Distribution (Price Sensitivity Analysis)
              </h3>
              <p className="text-xs text-ink-500">
                Comparing ₹50 Crown Velvet against ₹20 Classic Latte and ₹45 Chilled Frappe.
              </p>

              {/* Stacked Bar Demonstration */}
              <div className="space-y-3 pt-2">
                <div className="flex h-10 w-full rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-brand-500 w-[55%] flex items-center justify-center text-white text-xs font-bold font-mono">
                    ₹50 Tier (55%)
                  </div>
                  <div className="bg-amber2-500 w-[20%] flex items-center justify-center text-white text-xs font-bold font-mono">
                    ₹20 (20%)
                  </div>
                  <div className="bg-emerald-500 w-[15%] flex items-center justify-center text-white text-xs font-bold font-mono">
                    ₹30 (15%)
                  </div>
                  <div className="bg-rose-500 w-[10%] flex items-center justify-center text-white text-xs font-bold font-mono">
                    ₹45 (10%)
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-500" />
                    <div>
                      <p className="font-semibold text-ink-900">Velvet Cappuccino</p>
                      <p className="text-ink-500 font-mono">₹4,650 (93 cups)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber2-500" />
                    <div>
                      <p className="font-semibold text-ink-900">Classic Latte</p>
                      <p className="text-ink-500 font-mono">₹680 (34 cups)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-semibold text-ink-900">Grande Roast</p>
                      <p className="text-ink-500 font-mono">₹750 (25 cups)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <div>
                      <p className="font-semibold text-ink-900">Chilled Frappe</p>
                      <p className="text-ink-500 font-mono">₹720 (16 cups)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-3 bg-brand-50/50 border-brand-100 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  Revenue Insight
                </h4>
                <p className="text-base font-bold text-ink-900 mt-1">
                  High Margin Premium Dominance
                </p>
                <p className="text-xs text-ink-600 mt-2 leading-relaxed">
                  The ₹50 tier accounts for <b>68.4% of total gross revenue</b> despite being 55% of volume. No adverse cannibalisation down into the ₹20 tier observed.
                </p>
              </div>
              <div className="pt-3 border-t border-brand-200 text-xs font-mono text-ink-700">
                Average Basket Realization: ₹40.47/cup
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS & CANNIBALISATION */}
      {subRoute === 'products' && (
        <div className="card overflow-hidden border-line">
          <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
            Variant Economics &amp; Stockout Interaction
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Variant</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Gross Margin %</th>
                <th className="py-3 px-4">Cannibalisation Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-bold text-ink-900">👑 Manhattan Velvet Cappuccino</td>
                <td className="py-3.5 px-4 font-mono font-bold">93</td>
                <td className="py-3.5 px-4 font-mono font-bold text-brand-600">₹4,650</td>
                <td className="py-3.5 px-4 font-mono text-leaf-600 font-bold">63.6%</td>
                <td className="py-3.5 px-4 text-ink-500">Primary driver. Zero trade-down pressure.</td>
              </tr>
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-bold text-ink-900">☕ Classic Café Latte</td>
                <td className="py-3.5 px-4 font-mono font-bold">34</td>
                <td className="py-3.5 px-4 font-mono font-bold">₹680</td>
                <td className="py-3.5 px-4 font-mono text-leaf-600 font-bold">57.5%</td>
                <td className="py-3.5 px-4 text-ink-500">Entry acquisition point for new app downloads.</td>
              </tr>
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-bold text-ink-900">🔥 Grande Roast</td>
                <td className="py-3.5 px-4 font-mono font-bold">25</td>
                <td className="py-3.5 px-4 font-mono font-bold">₹750</td>
                <td className="py-3.5 px-4 font-mono text-leaf-600 font-bold">63.3%</td>
                <td className="py-3.5 px-4 text-ink-500">Consistent morning rush (8 AM - 10 AM).</td>
              </tr>
              <tr className="hover:bg-page/50">
                <td className="py-3.5 px-4 font-bold text-ink-900">🧊 Chilled Manhattan Frappe</td>
                <td className="py-3.5 px-4 font-mono font-bold">16</td>
                <td className="py-3.5 px-4 font-mono font-bold">₹720</td>
                <td className="py-3.5 px-4 font-mono text-leaf-600 font-bold">64.4%</td>
                <td className="py-3.5 px-4 text-ink-500">Dominates Mall Lane location exclusively.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 3. CONSUMPTION 24x7 HEATMAP */}
      {subRoute === 'consumption' && (
        <div className="card p-5 border-line space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-900">
                24×7 Fleet Consumption Matrix (Day × Hour)
              </h3>
              <p className="text-xs text-ink-500">
                Indicates peak hour footfall to coordinate proactive technician refill routes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <span>Less</span>
              <span className="w-3 h-3 rounded bg-brand-100" />
              <span className="w-3 h-3 rounded bg-brand-300" />
              <span className="w-3 h-3 rounded bg-brand-500" />
              <span>Peak</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px] space-y-2">
              <div className="grid grid-cols-10 gap-2 text-center text-[10px] text-ink-400 font-mono">
                <div />
                {hoursOfDay.map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>

              {daysOfWeek.map((day, dIdx) => (
                <div key={day} className="grid grid-cols-10 gap-2 items-center">
                  <span className="text-xs font-bold text-ink-700">{day}</span>
                  {hoursOfDay.map((hour, hIdx) => {
                    const isPeak =
                      (hIdx === 3 || hIdx === 4 || hIdx === 5) && (dIdx < 5);
                    const isMedium = hIdx >= 1 && hIdx <= 7;
                    const bg = isPeak
                      ? '#F04E23'
                      : isMedium
                      ? '#FFA47C'
                      : '#FFE6DA';
                    return (
                      <div
                        key={hour}
                        className="h-8 rounded-md transition hover:scale-105 cursor-pointer flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-xs"
                        style={{ background: bg }}
                        title={`${day} ${hour}: ${isPeak ? '38 cups/hr' : '12 cups/hr'}`}
                      >
                        {isPeak ? '38' : isMedium ? '12' : '2'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. FLEET COMPARE */}
      {subRoute === 'machines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5 border-line space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900">MCH-001 · Campus Hub</h3>
              <span className="text-leaf-600 font-bold text-xs bg-leaf-50 px-2 py-0.5 rounded">
                Top Revenue Earner
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono text-ink-700">
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Total Cups Today:</span>
                <span className="font-bold">142 cups</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Today&apos;s Revenue:</span>
                <span className="font-bold text-brand-600">₹5,420</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Hardware Uptime:</span>
                <span className="text-leaf-600 font-bold">100.0%</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Mean Time to Pour:</span>
                <span>28.4 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Dispute Rate:</span>
                <span className="text-leaf-600 font-bold">0.7% (1 of 142)</span>
              </div>
            </div>
          </div>

          <div className="card p-5 border-line space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900">MCH-002 · Mall Lane</h3>
              <span className="text-amber2-700 font-bold text-xs bg-amber2-50 px-2 py-0.5 rounded">
                Frappe Specialty Hub
              </span>
            </div>
            <div className="space-y-2 text-xs font-mono text-ink-700">
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Total Cups Today:</span>
                <span className="font-bold">26 cups</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Today&apos;s Revenue:</span>
                <span className="font-bold text-brand-600">₹1,380</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Hardware Uptime:</span>
                <span className="text-leaf-600 font-bold">100.0%</span>
              </div>
              <div className="flex justify-between border-b border-line pb-1">
                <span className="text-ink-400">Mean Time to Pour:</span>
                <span>32.1 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Dispute Rate:</span>
                <span className="text-leaf-600 font-bold">0.0% (Clean)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PROFITABILITY & UNIT ECONOMICS */}
      {subRoute === 'profitability' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card p-5 border-line space-y-3">
            <h4 className="text-xs font-bold text-ink-900 uppercase">Gross Coffee Margin</h4>
            <p className="text-3xl font-bold font-mono text-leaf-600">62.8%</p>
            <p className="text-xs text-ink-500">
              Calculated on net customer sales minus raw material COGS (milk, powder, cups, lids).
            </p>
          </div>

          <div className="card p-5 border-line space-y-3">
            <h4 className="text-xs font-bold text-ink-900 uppercase">Non-Coffee Auxiliary Revenue</h4>
            <p className="text-3xl font-bold font-mono text-brand-600">₹6,840</p>
            <p className="text-xs text-ink-500 font-mono">
              Ad Networks (₹1,240) + Side Panel Rentals (₹5,600)
            </p>
          </div>

          <div className="card p-5 border-line space-y-3">
            <h4 className="text-xs font-bold text-ink-900 uppercase">Break-Even Velocity</h4>
            <p className="text-3xl font-bold font-mono text-ink-900">42 cups/day</p>
            <p className="text-xs text-ink-500">
              Fixed electricity + 4G IoT SIM + mall footprint lease fully covered.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
