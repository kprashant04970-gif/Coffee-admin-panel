'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { Order } from '@/lib/types';
import {
  ShoppingBag,
  Filter,
  Download,
  AlertOctagon,
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Headset,
} from 'lucide-react';

export default function OrdersModule() {
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

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMachine, setFilterMachine] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // Print stub modal
  const [stubOrder, setStubOrder] = useState<Order | null>(null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
    if (filterMachine !== 'ALL' && o.machineId !== filterMachine) return false;
    if (filterPayment !== 'ALL' && o.paymentMethod !== filterPayment) return false;
    if (flaggedOnly && !o.isFlagged) return false;
    return true;
  });

  const exportOrdersCSV = () => {
    let csv = `Order No,Time,Machine,Variant,Amount,Discount,Net,Payment,Status,Flagged,UTR\n`;
    filteredOrders.forEach((o) => {
      csv += `"${o.orderNo}","${o.time}","${o.machineName}","${o.variant}",${o.amount},${o.discount},${o.netAmount},"${o.paymentMethod}","${o.status}",${o.isFlagged},"${o.utr}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('Orders exported to CSV', 'success');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Live Orders Queue &amp; Dispense Logs
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Full sensor telemetry for every pour: valve milliseconds, pulses, and variance audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportOrdersCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-line rounded-lg text-xs font-semibold text-ink-700 hover:bg-page transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-ink-500 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-line rounded-lg bg-page text-ink-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Preparing">Preparing</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filterMachine}
            onChange={(e) => setFilterMachine(e.target.value)}
            className="px-2.5 py-1.5 border border-line rounded-lg bg-page text-ink-700"
          >
            <option value="ALL">All Machines</option>
            <option value="MCH-001">Campus Hub (MCH-001)</option>
            <option value="MCH-002">Mall Lane (MCH-002)</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-2.5 py-1.5 border border-line rounded-lg bg-page text-ink-700"
          >
            <option value="ALL">All Payments</option>
            <option value="UPI">UPI (GPay / PhonePe)</option>
            <option value="Wallet">In-App Float Wallet</option>
            <option value="Coins">Ad Reward Coins</option>
          </select>

          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3 py-1.5 rounded-lg border transition font-medium ${
              flaggedOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-semibold'
                : 'border-line text-ink-600 hover:bg-page'
            }`}
          >
            Disputed / Flagged Only
          </button>
        </div>

        <span className="text-xs text-ink-400 font-mono">
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* Main Layout: Orders Table + Slideover Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table view (2 cols or 3 cols depending on selection) */}
        <div
          className={`${
            activeOrder ? 'lg:col-span-2' : 'lg:col-span-3'
          } card overflow-hidden border-line transition-all`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-page border-b border-line text-ink-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order No</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Variant</th>
                  <th className="py-3 px-4">Net (₹)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredOrders.map((o) => {
                  const isSelected = activeOrder?.id === o.id;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-brand-50/60 font-medium'
                          : 'hover:bg-page/60'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-ink-900 flex items-center gap-1.5">
                        {o.isFlagged && (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                        <span>{o.orderNo}</span>
                      </td>
                      <td className="py-3 px-4 text-ink-500 font-mono">{o.time}</td>
                      <td className="py-3 px-4 text-ink-700 font-medium">
                        {o.machineName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink-900">
                        {o.variant}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-ink-900">
                        ₹{o.netAmount}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-page border border-line px-2 py-0.5 rounded text-[11px] font-mono">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            o.status === 'Completed'
                              ? 'bg-leaf-50 text-leaf-600'
                              : o.status === 'Preparing'
                              ? 'bg-amber2-50 text-amber2-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(o.id);
                          }}
                          className="text-brand-500 hover:text-brand-600 font-semibold"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Pane (/orders/:id - The Evidence Page) */}
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
                className="text-ink-400 hover:text-ink-700 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Buyer & Machine Cross-links */}
            <div className="bg-page/70 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-500">Customer:</span>
                <button
                  onClick={() =>
                    activeOrder.buyerId && navigateToCustomer(activeOrder.buyerId)
                  }
                  className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  <span>{activeOrder.buyerName}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Vending Unit:</span>
                <button
                  onClick={() => navigateToMachine(activeOrder.machineId)}
                  className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                >
                  <span>{activeOrder.machineName}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-ink-500">Banking UTR:</span>
                <span className="truncate max-w-[170px]">{activeOrder.utr}</span>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-ink-900 mb-1">Financial Reconciliation</p>
              <div className="flex justify-between text-ink-600">
                <span>Retail Price:</span>
                <span className="font-mono">₹{activeOrder.amount}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Promotional Discount:</span>
                <span className="font-mono text-rose-600">-₹{activeOrder.discount}</span>
              </div>
              <div className="flex justify-between text-ink-900 font-bold border-t border-line pt-1">
                <span>Net Collected:</span>
                <span className="font-mono">₹{activeOrder.netAmount}</span>
              </div>
              <div className="flex justify-between text-[11px] text-ink-400">
                <span>COGS Material Basis:</span>
                <span className="font-mono">₹{activeOrder.costBasis}</span>
              </div>
            </div>

            {/* The Real Dispense Log (Crucial specification from workflow) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-bold text-xs text-ink-900">
                  Dispense Sensor Telemetry
                </p>
                {activeOrder.dispenseLog.variancePct > 15 ? (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    ⚠️ Variance {activeOrder.dispenseLog.variancePct}% (High)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded">
                    ✓ Nominal ({activeOrder.dispenseLog.variancePct}%)
                  </span>
                )}
              </div>

              <div className="bg-page/70 rounded-xl p-3 text-xs space-y-1.5 font-mono text-ink-700">
                <div className="flex justify-between">
                  <span className="text-ink-500">Valve Open Time:</span>
                  <span>{activeOrder.dispenseLog.valveOpenMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Flow Pulses:</span>
                  <span>{activeOrder.dispenseLog.flowPulses} pulses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Expected vs Dispensed:</span>
                  <span>
                    {activeOrder.dispenseLog.expectedMl}ml / {activeOrder.dispenseLog.dispensedMl}ml
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Cup Drop Detected:</span>
                  <span
                    className={
                      activeOrder.dispenseLog.cupDetected
                        ? 'text-leaf-600 font-bold'
                        : 'text-rose-600 font-bold'
                    }
                  >
                    {activeOrder.dispenseLog.cupDetected ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Customer Pickup:</span>
                  <span>
                    {activeOrder.dispenseLog.pickupDetected ? 'DETECTED' : 'NOT DETECTED'}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-line text-[11px]">
                  <span className="text-ink-500">Mounted Tank at Pour:</span>
                  <span className="text-brand-600">{activeOrder.tankUid}</span>
                </div>
              </div>
            </div>

            {/* Actions for Order */}
            <div className="pt-2 border-t border-line space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => openDisputeForOrder(activeOrder.id)}
                  className="flex-1 py-2 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Headset className="w-3.5 h-3.5" />
                  <span>Open Dispute Desk</span>
                </button>
                <button
                  onClick={() => setStubOrder(activeOrder)}
                  className="py-2 px-3 border border-line bg-page hover:bg-white text-ink-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A5 Stub</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => refundOrder(activeOrder.id, 'Operator manual refund')}
                  className="flex-1 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                >
                  Refund Order
                </button>
                <button
                  onClick={() => markOrderFraud(activeOrder.id)}
                  className="flex-1 py-1.5 border border-line text-ink-600 hover:bg-page rounded-lg text-xs font-medium"
                >
                  Flag Fraud
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* A5 Print Stub Modal (/orders/:id/label) */}
      {stubOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-sm w-full shadow-pop text-ink-900 font-mono">
            <div className="text-center pb-3 border-b-2 border-dashed border-line">
              <h2 className="text-base font-bold tracking-tight">MANHATTAN COFFEE</h2>
              <p className="text-[11px] text-ink-500">Automated Vending Network</p>
              <p className="text-[10px] text-ink-400 mt-1">FSSAI Lic: 11526999000142</p>
            </div>

            <div className="py-3 text-xs space-y-1.5 border-b-2 border-dashed border-line">
              <div className="flex justify-between">
                <span>ORDER:</span>
                <span className="font-bold">{stubOrder.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span>TIME:</span>
                <span>{stubOrder.time}</span>
              </div>
              <div className="flex justify-between">
                <span>MACHINE:</span>
                <span>{stubOrder.machineName}</span>
              </div>
              <div className="flex justify-between">
                <span>ITEM:</span>
                <span className="font-bold">{stubOrder.variant}</span>
              </div>
              <div className="flex justify-between">
                <span>PAYMENT:</span>
                <span>{stubOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>UTR:</span>
                <span className="truncate max-w-[180px]">{stubOrder.utr}</span>
              </div>
            </div>

            <div className="py-3 flex justify-between font-bold text-sm">
              <span>TOTAL PAID:</span>
              <span>₹{stubOrder.netAmount}.00</span>
            </div>

            <div className="text-center text-[10px] text-ink-400 py-2">
              Thank you for brewing with us!
              <br />
              Need help? WhatsApp +91 98200 11999
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setStubOrder(null)}
                className="flex-1 py-2 rounded-lg border border-line text-xs font-sans font-medium text-ink-600 hover:bg-page"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  toast('Print job sent to system spooler', 'success');
                }}
                className="flex-1 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-sans font-semibold shadow-xs"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
