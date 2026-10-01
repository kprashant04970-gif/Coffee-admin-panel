'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { RANGES_DATA, VARIANTS_BREAKDOWN, STATUS_BREAKDOWN } from '@/lib/mock-data';
import LiveMachineStrip from '@/components/LiveMachineStrip';
import {
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Cpu,
  Coins,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function DashboardModule() {
  const {
    dateRange,
    setDateRange,
    toast,
    addNewMachine,
    navigateToMachine,
    navigateToOrder,
    setModule,
    machines,
  } = useAdmin();

  const [addMachineOpen, setAddMachineOpen] = useState(false);
  const [newMachName, setNewMachName] = useState('');
  const [newMachLoc, setNewMachLoc] = useState('');
  const [newMachMode, setNewMachMode] = useState<'HOT' | 'COLD'>('HOT');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    rev: number;
    orders: number;
    visible: boolean;
  }>({ x: 0, y: 0, label: '', rev: 0, orders: 0, visible: false });

  // Format currency
  const fmtMoney = (v: number) => {
    if (v >= 100000) return '₹' + Math.round(v / 1000) + 'L';
    if (v >= 10000) return '₹' + Math.round(v / 1000) + 'K';
    if (v >= 1000) return '₹' + (Math.round(v / 100) / 10) + 'K';
    if (v >= 100) return '₹' + Math.round(v);
    return '₹0';
  };

  // Canvas trend chart renderer
  const drawChart = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const d = RANGES_DATA[dateRange];
    const rect = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = 250;

    cv.width = w * dpr;
    cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const P = { l: 40, r: 40, t: 24, b: 30 };
    const iw = w - P.l - P.r;
    const ih = h - P.t - P.b;

    const rMax = Math.max(...d.revenue) * 1.2;
    const oMax = Math.max(...d.orders) * 1.2;
    const n = d.labels.length;
    const xCoord = (i: number) => P.l + (iw * i) / (n - 1);

    // Horizontal grid & Y-axis labels
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    for (let g = 0; g <= 4; g++) {
      const y = P.t + ih - (ih * g) / 4;
      ctx.beginPath();
      ctx.strokeStyle = '#EDEFF2';
      ctx.lineWidth = 1;
      ctx.moveTo(P.l, y);
      ctx.lineTo(w - P.r, y);
      ctx.stroke();

      // Revenue on left
      ctx.fillStyle = '#9CA3AF';
      ctx.textAlign = 'right';
      ctx.fillText(fmtMoney((rMax * g) / 4), P.l - 8, y);

      // Orders on right
      ctx.fillStyle = '#16A34A';
      ctx.textAlign = 'left';
      ctx.fillText(String(Math.round((oMax * g) / 4)), w - P.r + 8, y);
    }

    // X-axis labels
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'center';
    d.labels.forEach((l, i) => {
      ctx.fillText(l, xCoord(i), h - 10);
    });

    // Helper to draw smooth series
    const drawSeries = (
      vals: number[],
      maxVal: number,
      strokeColor: string,
      fillColorStart: string,
      badge: string
    ) => {
      const pts = vals.map((v, i) => ({
        x: xCoord(i),
        y: P.t + ih - (v / maxVal) * ih,
        v,
      }));

      // Area fill
      const grad = ctx.createLinearGradient(0, P.t, 0, P.t + ih);
      grad.addColorStop(0, fillColorStart);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.beginPath();
      ctx.moveTo(pts[0].x, P.t + ih);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, P.t + ih);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const mx = (a.x + b.x) / 2;
        ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Peak highlight point & badge
      const maxIdx = vals.indexOf(Math.max(...vals));
      const peak = pts[maxIdx];

      ctx.beginPath();
      ctx.arc(peak.x, peak.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor + '25';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(peak.x, peak.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      if (badge) {
        const text = `${badge}${vals[maxIdx].toLocaleString('en-IN')}`;
        ctx.font = '600 11px Inter, sans-serif';
        const txtWidth = ctx.measureText(text).width + 16;
        const bx = Math.min(Math.max(peak.x - txtWidth / 2, P.l), w - P.r - txtWidth);
        const by = peak.y - 32;

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        // Fallback for roundRect
        if (ctx.roundRect) {
          ctx.roundRect(bx, by, txtWidth, 20, 5);
        } else {
          ctx.rect(bx, by, txtWidth, 20);
        }
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bx + txtWidth / 2, by + 10);
      }
    };

    // Series 1: Revenue
    drawSeries(d.revenue, rMax, '#F04E23', 'rgba(240, 78, 35, 0.12)', '₹');
    // Series 2: Orders
    drawSeries(d.orders, oMax, '#16A34A', 'rgba(22, 163, 74, 0.10)', '');
  }, [dateRange]);

  useEffect(() => {
    drawChart();
    window.addEventListener('resize', drawChart);
    return () => window.removeEventListener('resize', drawChart);
  }, [drawChart]);

  // Handle canvas hover tooltip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const d = RANGES_DATA[dateRange];
    const n = d.labels.length;
    const P = { l: 40, r: 40 };
    const iw = rect.width - P.l - P.r;

    let closestIdx = -1;
    let minDiff = Infinity;
    for (let i = 0; i < n; i++) {
      const px = P.l + (iw * i) / (n - 1);
      const diff = Math.abs(px - mx);
      if (diff < minDiff && diff < 30) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    if (closestIdx !== -1) {
      setTooltip({
        x: Math.min(Math.max(mx + 10, 20), rect.width - 160),
        y: Math.max(e.clientY - rect.top - 60, 10),
        label: d.labels[closestIdx],
        rev: d.revenue[closestIdx],
        orders: d.orders[closestIdx],
        visible: true,
      });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleDownloadReport = () => {
    // Generate real CSV report
    const d = RANGES_DATA[dateRange];
    let csvContent = `data:text/csv;charset=utf-8,Manhattan Coffee Network - Performance Report (${dateRange})\n\n`;
    csvContent += `Interval,Revenue (INR),Orders\n`;
    d.labels.forEach((label, idx) => {
      csvContent += `"${label}",${d.revenue[idx]},${d.orders[idx]}\n`;
    });
    csvContent += `\nTotal Revenue,INR 6800\nTotal Orders,168\nUptime,100%\nActive Fleet Units,${machines.length}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ManhattanCoffee_Report_${dateRange.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('Report CSV successfully generated and downloaded', 'success');
  };

  const handleCreateMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachName.trim()) {
      toast('Please enter a machine name', 'error');
      return;
    }
    addNewMachine(newMachName, newMachLoc || 'West Quad, Mumbai', newMachMode);
    setNewMachName('');
    setNewMachLoc('');
    setAddMachineOpen(false);
  };

  // SVG calculations for donuts (computed immutably)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const variantOffsets = VARIANTS_BREAKDOWN.reduce<number[]>((acc, _, i) => {
    if (i === 0) return [0];
    const prevOffset = acc[i - 1];
    const prevLen = (VARIANTS_BREAKDOWN[i - 1].pct / 100) * circumference;
    return [...acc, prevOffset + prevLen];
  }, []);

  const statusRadius = 48;
  const statusCircumference = 2 * Math.PI * statusRadius;
  const statusOffsets = STATUS_BREAKDOWN.reduce<number[]>((acc, _, i) => {
    if (i === 0) return [0];
    const prevOffset = acc[i - 1];
    const prevLen = (STATUS_BREAKDOWN[i - 1].pct / 100) * statusCircumference;
    return [...acc, prevOffset + prevLen];
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-ink-900 leading-tight">
            Good Morning, Chief! <span className="text-[22px]">👋</span>
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Here&apos;s what&apos;s brewing at your coffee network today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Label */}
          <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3.5 py-2 text-[13px] font-medium text-ink-700 shadow-xs">
            <Calendar className="w-4 h-4 text-ink-500" />
            <span>01 Oct 2026</span>
          </div>

          {/* Export Report */}
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-[13px] font-semibold transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>

          {/* Add Machine */}
          <button
            onClick={() => setAddMachineOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-page border border-line rounded-lg px-4 py-2 text-[13px] font-semibold text-ink-700 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-500" />
            <span>Add Machine</span>
          </button>
        </div>
      </div>

      {/* Live Machine Strip */}
      <LiveMachineStrip />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div
          onClick={() => setModule('analytics')}
          className="card p-4.5 rise hover:border-brand-300 transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            {/* Sparkline */}
            <svg className="w-[72px] h-8" viewBox="0 0 72 32" fill="none">
              <path
                d="M1 26 10 22 18 24 26 16 34 19 43 8 52 13 61 5 71 9"
                stroke="#F04E23"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 26 10 22 18 24 26 16 34 19 43 8 52 13 61 5 71 9V32H1z"
                fill="#F04E23"
                opacity=".1"
              />
            </svg>
          </div>
          <p className="mt-3 text-[12.5px] font-medium text-ink-500">Total Revenue</p>
          <p className="mt-0.5 text-[26px] font-bold tracking-tight text-ink-900 font-mono">
            ₹6,800
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-leaf-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            8.2% <span className="text-ink-400 font-normal">vs Yesterday</span>
          </p>
        </div>

        {/* Orders Today */}
        <div
          onClick={() => setModule('orders')}
          className="card p-4.5 rise hover:border-brand-300 transition cursor-pointer group"
          style={{ animationDelay: '0.06s' }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <svg className="w-[72px] h-8" viewBox="0 0 72 32" fill="none">
              <path
                d="M1 24 10 26 18 18 26 21 34 12 43 16 52 6 61 10 71 4"
                stroke="#F97C4A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 24 10 26 18 18 26 21 34 12 43 16 52 6 61 10 71 4V32H1z"
                fill="#F97C4A"
                opacity=".1"
              />
            </svg>
          </div>
          <p className="mt-3 text-[12.5px] font-medium text-ink-500">Orders Today</p>
          <p className="mt-0.5 text-[26px] font-bold tracking-tight text-ink-900 font-mono">
            168
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-leaf-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            6.2% <span className="text-ink-400 font-normal">vs Yesterday</span>
          </p>
        </div>

        {/* Active Machines */}
        <div
          onClick={() => setModule('machines')}
          className="card p-4.5 rise hover:border-brand-300 transition cursor-pointer group"
          style={{ animationDelay: '0.12s' }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-leaf-50 text-leaf-500 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <svg className="w-[72px] h-8" viewBox="0 0 72 32" fill="none">
              <path
                d="M1 25 10 23 18 20 26 21 34 14 43 15 52 9 61 11 71 4"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 25 10 23 18 20 26 21 34 14 43 15 52 9 61 11 71 4V32H1z"
                fill="#22C55E"
                opacity=".12"
              />
            </svg>
          </div>
          <p className="mt-3 text-[12.5px] font-medium text-ink-500">Active Machines</p>
          <p className="mt-0.5 text-[26px] font-bold tracking-tight text-ink-900 font-mono">
            <span>2</span>
            <span className="text-[16px] font-medium text-ink-400"> / 2</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-leaf-600 font-medium">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-leaf-500 inline-block mr-0.5" />
            100% <span className="text-ink-400 font-normal">fleet uptime</span>
          </p>
        </div>

        {/* Avg Order Value */}
        <div
          onClick={() => setModule('analytics')}
          className="card p-4.5 rise hover:border-brand-300 transition cursor-pointer group"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-amber2-50 text-amber2-500 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <svg className="w-[72px] h-8" viewBox="0 0 72 32" fill="none">
              <path
                d="M1 27 10 25 18 27 26 21 34 23 43 15 52 17 61 9 71 12"
                stroke="#EAB308"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 27 10 25 18 27 26 21 34 23 43 15 52 17 61 9 71 12V32H1z"
                fill="#EAB308"
                opacity=".14"
              />
            </svg>
          </div>
          <p className="mt-3 text-[12.5px] font-medium text-ink-500">Avg Order Value</p>
          <p className="mt-0.5 text-[26px] font-bold tracking-tight text-ink-900 font-mono">
            ₹40
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-leaf-600 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            3.7% <span className="text-ink-400 font-normal">vs Yesterday</span>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Trend Canvas Card (2 cols on xl) */}
        <div className="card p-5 xl:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <h2 className="text-[15.5px] font-bold text-ink-900">
                Revenue &amp; Orders Trend
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[11.5px] text-ink-500 font-medium">
                  <i className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                  Revenue (₹)
                </span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-ink-500 font-medium">
                  <i className="w-2.5 h-2.5 rounded-full bg-leaf-500 inline-block" />
                  Orders
                </span>
                <div className="flex items-center gap-1 bg-page border border-line rounded-lg p-0.5 text-xs">
                  {(['Today', 'This Week', 'This Month'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setDateRange(r)}
                      className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                        dateRange === r
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'text-ink-500 hover:text-ink-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Canvas container */}
            <div className="relative w-full h-[250px]">
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
                className="w-full h-full block cursor-crosshair"
              />

              {/* Tooltip */}
              {tooltip.visible && (
                <div
                  style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
                  className="pointer-events-none absolute z-20 bg-ink-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-pop transition-opacity"
                >
                  <p className="font-bold border-b border-ink-700 pb-1 mb-1">
                    {tooltip.label}
                  </p>
                  <p className="text-brand-300 font-mono">
                    Revenue: ₹{tooltip.rev.toLocaleString('en-IN')}
                  </p>
                  <p className="text-leaf-400 font-mono">{tooltip.orders} orders</p>
                </div>
              )}
            </div>
          </div>

          {/* Trend Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-3 border-t border-line">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] text-ink-500">Today&apos;s Revenue</p>
                <p className="text-[13px] font-bold text-ink-900 font-mono">₹6,800</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] text-ink-500">Today&apos;s Orders</p>
                <p className="text-[13px] font-bold text-ink-900 font-mono">168</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-leaf-50 text-leaf-500 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] text-ink-500">Peak Revenue</p>
                <p className="text-[13px] font-bold text-ink-900 font-mono">₹1,550 / 4 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber2-50 text-amber2-500 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] text-ink-500">Peak Orders</p>
                <p className="text-[13px] font-bold text-ink-900 font-mono">38 / 4 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Variant Donut Card */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-[15.5px] font-bold text-ink-900">
                Orders by Variant
              </h2>
              <span className="text-[11.5px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                {dateRange}
              </span>
            </div>

            <div className="flex items-center gap-5">
              {/* Donut SVG */}
              <div className="relative shrink-0">
                <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
                  <circle
                    cx="75"
                    cy="75"
                    r={radius}
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="18"
                  />
                  {VARIANTS_BREAKDOWN.map((v, idx) => {
                    const strokeDasharray = `${(v.pct / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -variantOffsets[idx];
                    return (
                      <circle
                        key={v.name}
                        cx="75"
                        cy="75"
                        r={radius}
                        fill="none"
                        stroke={v.color}
                        strokeWidth="18"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[27px] font-bold leading-none text-ink-900 font-mono">
                    168
                  </p>
                  <p className="text-[10px] text-ink-400 font-semibold tracking-wider mt-1">
                    TOTAL ORDERS
                  </p>
                </div>
              </div>

              {/* Legend */}
              <ul className="flex-1 space-y-2.5 min-w-0">
                {VARIANTS_BREAKDOWN.map((v) => (
                  <li key={v.name} className="flex items-center gap-2">
                    <i
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: v.color }}
                    />
                    <span className="text-[12.5px] font-medium text-ink-700 truncate flex-1">
                      {v.short}
                    </span>
                    <span className="text-[11.5px] text-ink-400 font-mono">
                      {v.orders}
                    </span>
                    <span className="text-[12px] font-bold text-ink-900 font-mono w-8 text-right">
                      {v.pct}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Callout */}
          <div className="mt-4 pt-3.5 border-t border-line flex items-start gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center shrink-0 text-[15px]">
              👑
            </span>
            <p className="text-[12px] leading-relaxed text-ink-500">
              <span className="font-semibold text-ink-900">
                Manhattan Velvet Cappuccino
              </span>{' '}
              is the most ordered variant this week with 55% market share.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Top Selling Variants */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[15.5px] font-bold text-ink-900">
              Top Selling Variants
            </h2>
            <button
              onClick={() => setModule('inventory')}
              className="text-[12px] font-semibold text-brand-500 hover:text-brand-600 cursor-pointer"
            >
              View Inventory
            </button>
          </div>

          <ul className="divide-y divide-line">
            {VARIANTS_BREAKDOWN.map((v, i) => (
              <li key={v.name} className="flex items-center gap-3 py-3">
                <span
                  className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                  style={{ background: v.color }}
                >
                  {i + 1}
                </span>
                <span className="w-8 h-8 rounded-lg bg-page flex items-center justify-center text-[15px] shrink-0">
                  {v.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-ink-900 truncate">
                    {v.name}
                  </p>
                  <div className="tier-bar mt-1.5">
                    <i
                      style={{
                        width: `${v.pct}%`,
                        background: v.color,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12.5px] font-bold text-ink-900 font-mono">
                    ₹{v.rev.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-ink-400 font-mono">{v.orders} orders</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order Status Breakdown */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[15.5px] font-bold text-ink-900">Order Status</h2>
            <button
              onClick={() => setModule('orders')}
              className="text-[12px] font-semibold text-brand-500 hover:text-brand-600 cursor-pointer"
            >
              Inspect Queue
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                <circle
                  cx="66"
                  cy="66"
                  r={statusRadius}
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="16"
                />
                {STATUS_BREAKDOWN.map((s, idx) => {
                  const strokeDasharray = `${(s.pct / 100) * statusCircumference} ${statusCircumference}`;
                  const strokeDashoffset = -statusOffsets[idx];
                  return (
                    <circle
                      key={s.name}
                      cx="66"
                      cy="66"
                      r={statusRadius}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="16"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[23px] font-bold leading-none text-ink-900 font-mono">
                  168
                </p>
                <p className="text-[9.5px] text-ink-400 font-semibold tracking-wider mt-1">
                  ORDERS
                </p>
              </div>
            </div>

            <ul className="flex-1 grid grid-cols-2 gap-x-4 gap-y-3 min-w-0">
              {STATUS_BREAKDOWN.map((s) => (
                <li key={s.name} className="flex items-center gap-2">
                  <i
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: s.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-ink-900 leading-tight">
                      {s.name}
                    </p>
                    <p className="text-[11px] text-ink-400 font-mono">
                      {s.n} ({s.pct}%)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Business Insights Card */}
        <div className="card p-5 bg-brand-50 border-brand-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5">
              <span className="w-7 h-7 rounded-lg bg-amber2-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-[15.5px] font-bold text-ink-900">
                Business Insights
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <p className="text-[11.5px] text-ink-500">Revenue</p>
                <p className="text-[17px] font-bold mt-0.5 text-leaf-600 font-mono">
                  + 8.2%
                </p>
                <p className="text-[11px] text-ink-400">vs Yesterday</p>
              </div>
              <div>
                <p className="text-[11.5px] text-ink-500">Top Item</p>
                <p className="text-[12.5px] font-bold text-ink-900 mt-0.5 leading-snug">
                  Manhattan Velvet
                  <br />
                  Cappuccino
                </p>
              </div>
              <div>
                <p className="text-[11.5px] text-ink-500">Best Seller</p>
                <p className="text-[12.5px] font-bold text-ink-900 mt-0.5 leading-snug">
                  Classic Café
                  <br />
                  Latte
                </p>
              </div>
              <div>
                <p className="text-[11.5px] text-ink-500">Peak Hour</p>
                <p className="text-[12.5px] font-bold text-ink-900 mt-0.5 leading-snug font-mono">
                  11:00 AM –<br />2:00 PM
                </p>
              </div>
              <div>
                <p className="text-[11.5px] text-ink-500">Wallet Float</p>
                <p className="text-[12.5px] font-bold text-ink-900 mt-0.5 font-mono">
                  ₹5,600
                </p>
              </div>
              <div>
                <p className="text-[11.5px] text-ink-500">Ad Revenue</p>
                <p className="text-[12.5px] font-bold text-ink-900 mt-0.5 font-mono">
                  ₹1,240
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-brand-200/60 flex items-center gap-2">
            <span className="text-[13px]">🎉</span>
            <p className="text-[11.5px] text-ink-600">
              Keep going! Your fleet is performing at 100% nominal output today.
            </p>
          </div>
        </div>
      </div>

      {/* Add Machine Modal */}
      {addMachineOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-base font-bold text-ink-900">
                Commission New Machine
              </h3>
              <button
                onClick={() => setAddMachineOpen(false)}
                className="text-ink-400 hover:text-ink-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Machine Friendly Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bandra Kurla Complex Lobby"
                  value={newMachName}
                  onChange={(e) => setNewMachName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-line rounded-lg focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Installation Location &amp; Landmark
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower 2, Concourse West, Mumbai"
                  value={newMachLoc}
                  onChange={(e) => setNewMachLoc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-line rounded-lg focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  Initial Fleet Mode
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewMachMode('HOT')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                      newMachMode === 'HOT'
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'border-line text-ink-700 hover:bg-page'
                    }`}
                  >
                    HOT (Boiler 66°C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMachMode('COLD')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                      newMachMode === 'COLD'
                        ? 'bg-amber2-500 text-white border-amber2-500'
                        : 'border-line text-ink-700 hover:bg-page'
                    }`}
                  >
                    COLD (Chiller 6°C)
                  </button>
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddMachineOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-ink-500 hover:bg-page"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-xs"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
