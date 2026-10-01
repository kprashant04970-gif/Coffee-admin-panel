'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Order } from '@/lib/types';
import { toast as sonnerToast } from 'sonner';
import {
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Headset,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function OrdersModule() {
  const router = useRouter();
  const {
    orders,
    selectedOrderId,
    setSelectedOrderId,
    refundOrder,
    markOrderFraud,
    openDisputeForOrder,
    navigateToMachine,
    navigateToCustomer,
    toast,
  } = useAdmin();

  // Filter chips: All Orders, Unredeemed Codes, Failed Dispenses, Disputed Orders
  const [chipFilter, setChipFilter] = useState<'ALL' | 'UNREDEEMED' | 'FAILED' | 'DISPUTED'>('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [stubOrder, setStubOrder] = useState<Order | null>(null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const filteredOrders = orders.filter((o) => {
    if (chipFilter === 'UNREDEEMED') return o.status === 'Pending' || o.status === 'Preparing';
    if (chipFilter === 'FAILED') return Math.abs(o.dispenseLog.variancePct) > 15 || o.status === 'Cancelled';
    if (chipFilter === 'DISPUTED') return o.isFlagged;
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkRefund = () => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach((id) => refundOrder(id, 'FLOAT_WALLET'));
    sonnerToast.success(`Bulk refund issued for ${selectedOrderIds.length} orders directly to Float Wallets.`);
    setSelectedOrderIds([]);
  };

  const exportOrdersCSV = () => {
    let csv = `Order No,Time,Machine,Variant,Amount,Discount,Net,Payment,Status,Flagged,UTR\n`;
    filteredOrders.forEach((o) => {
      csv += `"${o.orderNo}","${o.time}","${o.machineName}","${o.variant}",${o.amount},${o.discount},${o.netAmount},"${o.paymentMethod}","${o.status}",${o.isFlagged},"${o.utr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orders_Export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    sonnerToast.success(`Exported ${filteredOrders.length} orders to CSV`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-ink-900 leading-tight">
            Order Queue &amp; Dispense Logs
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Real-time telemetry queue tracking flow pulses, valve milliseconds, and automated dispute flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportOrdersCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-line rounded-lg text-xs font-semibold text-ink-700 hover:bg-ink-50 transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-line shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-500 font-semibold mr-1">Filter Queue:</span>

          <button
            onClick={() => setChipFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              chipFilter === 'ALL'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setChipFilter('UNREDEEMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              chipFilter === 'UNREDEEMED'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            Unredeemed Codes ({orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length})
          </button>

          <button
            onClick={() => setChipFilter('FAILED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              chipFilter === 'FAILED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Failed Dispenses ({orders.filter((o) => Math.abs(o.dispenseLog.variancePct) > 15 || o.status === 'Cancelled').length})
          </button>

          <button
            onClick={() => setChipFilter('DISPUTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              chipFilter === 'DISPUTED'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>Disputed Orders ({orders.filter((o) => o.isFlagged).length})</span>
          </button>
        </div>

        <span className="text-xs text-ink-400 font-mono">
          Showing {filteredOrders.length} records
        </span>
      </div>

      {/* Floating Bulk Action Drawer if selected */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-ink-950 text-white px-5 py-3 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4 border border-ink-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-sm font-semibold">
              {selectedOrderIds.length} orders selected for batch processing
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRefund}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bulk Refund ({selectedOrderIds.length})</span>
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 text-xs font-medium rounded-lg transition cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Order Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`${
            activeOrder ? 'lg:col-span-2' : 'lg:col-span-3'
          } card overflow-hidden border-line transition-all bg-white`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50/80 border-b border-line text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredOrders.length > 0 &&
                        selectedOrderIds.length === filteredOrders.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-ink-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Order No</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Variant</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-3 text-center">Flag</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredOrders.map((o) => {
                  const isSelected = activeOrder?.id === o.id;
                  const isRowChecked = selectedOrderIds.includes(o.id);

                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/70 font-medium'
                          : isRowChecked
                          ? 'bg-brand-50/30'
                          : 'hover:bg-ink-50/60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isRowChecked}
                          onChange={() => toggleSelectRow(o.id)}
                          className="rounded border-ink-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>

                      {/* Order No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-ink-900">
                        {o.orderNo}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 text-ink-500 font-mono">
                        {o.time}
                      </td>

                      {/* Machine */}
                      <td className="py-3.5 px-4 text-ink-700 font-medium truncate max-w-[140px]">
                        {o.machineName}
                      </td>

                      {/* Variant */}
                      <td className="py-3.5 px-4 font-semibold text-ink-900">
                        {o.variant}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-ink-900">
                        ₹{o.netAmount.toFixed(2)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4">
                        <span className="bg-ink-100 border border-ink-200 px-2 py-0.5 rounded text-[11px] font-mono text-ink-800">
                          {o.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            o.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'Preparing'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${
                              o.status === 'Completed'
                                ? 'bg-emerald-500'
                                : o.status === 'Preparing'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-rose-500'
                            }`}
                          />
                          {o.status}
                        </span>
                      </td>

                      {/* Flag Column */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {o.isFlagged ? (
                          <button
                            onClick={() => router.push('/support/tickets/TCK-8921')}
                            className="inline-flex items-center justify-center p-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 transition cursor-pointer animate-bounce"
                            title="Dispute Ticket Active — Click to Inspect in Dispute Desk"
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-600 fill-amber-500" />
                          </button>
                        ) : (
                          <span className="text-ink-300 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(o.id);
                          }}
                          className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slideover Detail when an Order is Clicked */}
        {activeOrder && (
          <div className="card p-5 border-line space-y-5 lg:col-span-1 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-400 font-mono">
                  Order Telemetry Evidence
                </span>
                <h3 className="text-base font-bold text-ink-900 mt-0.5">
                  {activeOrder.orderNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-ink-400 hover:text-ink-700 text-sm font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Buyer context */}
            <div className="p-3 bg-page rounded-xl border border-line space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-500">Customer:</span>
                <button
                  onClick={() => activeOrder.buyerId && navigateCustomer(activeOrder.buyerId)}
                  className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>{activeOrder.buyerName}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-500">Phone:</span>
                <span className="font-mono text-ink-800">{activeOrder.buyerPhone}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-500">Machine:</span>
                <button
                  onClick={() => navigateMachine(activeOrder.machineId)}
                  className="font-medium text-ink-900 hover:text-brand-600"
                >
                  {activeOrder.machineName} ({activeOrder.machineId})
                </button>
              </div>
            </div>

            {/* Sensor Telemetry Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                Dispense Sensor Ground Truth
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-ink-50 rounded-lg">
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">Valve Open</p>
                  <p className="font-mono font-bold text-ink-900 mt-0.5">
                    {activeOrder.dispenseLog.valveOpenMs} ms
                  </p>
                </div>
                <div className="p-2.5 bg-ink-50 rounded-lg">
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">Flow Pulses</p>
                  <p className="font-mono font-bold text-ink-900 mt-0.5">
                    {activeOrder.dispenseLog.flowPulses} pulses
                  </p>
                </div>
                <div className="p-2.5 bg-ink-50 rounded-lg">
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">Volume Expected</p>
                  <p className="font-mono font-bold text-ink-900 mt-0.5">
                    {activeOrder.dispenseLog.expectedMl} ml
                  </p>
                </div>
                <div className="p-2.5 bg-ink-50 rounded-lg">
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">Volume Dispensed</p>
                  <p className="font-mono font-bold text-ink-900 mt-0.5">
                    {activeOrder.dispenseLog.dispensedMl} ml
                  </p>
                </div>
              </div>

              {/* Variance Chip */}
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                  Math.abs(activeOrder.dispenseLog.variancePct) > 15
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <span className="font-medium">Measured Sensor Variance:</span>
                <span className="font-mono font-bold text-sm">
                  {activeOrder.dispenseLog.variancePct}%
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  refundOrder(activeOrder.id, 'UPI_SOURCE');
                  sonnerToast.success(`Refund initiated for ${activeOrder.orderNo} to UPI`);
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Issue Refund (₹{activeOrder.netAmount})</span>
              </button>

              <button
                onClick={() => router.push('/support/tickets/TCK-8921')}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Open in Dispute Desk</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function navigateMachine(id: string) {
    navigateToMachine(id);
  }

  function navigateCustomer(id: string) {
    navigateToCustomer(id);
  }
}
