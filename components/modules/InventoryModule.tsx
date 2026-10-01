'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import {
  Boxes,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Download,
  Trash2,
  Plus,
  RefreshCw,
} from 'lucide-react';

export default function InventoryModule() {
  const { machines, tanks, stock, toast, refillStock, mountTank } = useAdmin();
  const [subView, setSubView] = useState<'matrix' | 'tanks' | 'supplies' | 'waste'>('matrix');

  // Raw supplies list
  const [supplies, setSupplies] = useState([
    { id: 'SUP-1', name: 'Manhattan Dark Roast Espresso Beans (kg)', stock: '48.5 kg', unitCost: '₹840/kg', servingCost: '₹8.40', reorder: '15 kg' },
    { id: 'SUP-2', name: 'Standard Arabica/Robusta Blend (kg)', stock: '32.0 kg', unitCost: '₹550/kg', servingCost: '₹5.50', reorder: '10 kg' },
    { id: 'SUP-3', name: 'Demerara Raw Sugar Sachets (5g)', stock: '2,400 pcs', unitCost: '₹0.45/pc', servingCost: '₹0.45', reorder: '500 pcs' },
    { id: 'SUP-4', name: 'Insulated Manhattan Double-Wall Cups (8oz)', stock: '1,850 pcs', unitCost: '₹3.20/pc', servingCost: '₹3.20', reorder: '400 pcs' },
    { id: 'SUP-5', name: 'Birchwood Stirrers (140mm)', stock: '3,200 pcs', unitCost: '₹0.25/pc', servingCost: '₹0.25', reorder: '600 pcs' },
    { id: 'SUP-6', name: 'Fresh Buffalo Milk Daily Canisters (45L)', stock: '120 L', unitCost: '₹62/L', servingCost: '₹11.16', reorder: '40 L' },
  ]);

  // Waste logs
  const [wasteLogs, setWasteLogs] = useState([
    { id: 'WST-101', date: 'Today, 04:30 AM', machine: 'MCH-001 Campus Hub', type: 'Expired Tank Buffer', qty: '4.2 L', loss: '₹260', reason: 'Shift changeover flush per FSSAI rule' },
    { id: 'WST-100', date: 'Yesterday, 11:20 PM', machine: 'MCH-002 Mall Lane', type: 'Jammed Cup', qty: '2 cups', loss: '₹6.40', reason: 'Hopper misfeed on customer drop' },
    { id: 'WST-099', date: '29 Sep 2026', machine: 'MCH-001 Campus Hub', type: 'Nozzle Calibration Flush', qty: '0.8 L', loss: '₹49.60', reason: 'Flow sensor accuracy recalibration test' },
  ]);

  const exportFSSAI = () => {
    let csv = `Tank UID,Machine,Capacity (L),Filled At,Expires At,Cold Chain Temp,FSSAI Status\n`;
    tanks.forEach((t) => {
      csv += `"${t.tankUid}","${t.machineId}",${t.liters},"${t.filledAt}","${t.expiresAt}","6.2C","${t.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FSSAI_FoodSafety_Evidence_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast('FSSAI Food Safety Audit Bundle exported', 'success');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Inventory &amp; Food-Safety Lifecycles
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Fleet stock matrix, 18-hour FSSAI tank audit trails, and raw supply cost bases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportFSSAI}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export FSSAI Paper Trail</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-line text-xs font-semibold">
        <button
          onClick={() => setSubView('matrix')}
          className={`py-3 px-4 border-b-2 transition cursor-pointer ${
            subView === 'matrix'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Fleet Stock Matrix
        </button>
        <button
          onClick={() => setSubView('tanks')}
          className={`py-3 px-4 border-b-2 transition cursor-pointer ${
            subView === 'tanks'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Tanks Lifecycle &amp; Expiry
        </button>
        <button
          onClick={() => setSubView('supplies')}
          className={`py-3 px-4 border-b-2 transition cursor-pointer ${
            subView === 'supplies'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Raw Supplies &amp; Cost Basis
        </button>
        <button
          onClick={() => setSubView('waste')}
          className={`py-3 px-4 border-b-2 transition cursor-pointer ${
            subView === 'waste'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-ink-500 hover:text-ink-900'
          }`}
        >
          Waste &amp; Loss Log
        </button>
      </div>

      {/* 1. FLEET STOCK MATRIX */}
      {subView === 'matrix' && (
        <div className="space-y-6">
          {/* Refill Estimators Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-4.5 bg-amber2-50/50 border-amber2-200 flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-amber2-400 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                ⚡
              </span>
              <div>
                <h3 className="font-bold text-sm text-ink-900">
                  Refill Estimator: MCH-002 (Mall Lane)
                </h3>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Based on trailing 4-hour velocity, milk tank (21L) will cross critical threshold (&lt;10L) at approximately <b>02:15 PM today</b>. Technician Imran S. is scheduled.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      refillStock('MCH-002', 'Chilled Manhattan Frappe', 30);
                      toast('Refill dispatched for Mall Lane', 'success');
                    }}
                    className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Quick Dispatch Refill (+30 kits)
                  </button>
                </div>
              </div>
            </div>

            <div className="card p-4.5 bg-leaf-50/50 border-leaf-200 flex items-start gap-3.5">
              <span className="w-10 h-10 rounded-xl bg-leaf-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                ✓
              </span>
              <div>
                <h3 className="font-bold text-sm text-ink-900">
                  Refill Estimator: MCH-001 (Campus Hub)
                </h3>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  38L milk tank mounted at 04:30 AM with fresh batch TNK-901. Ample buffer for 142 cups. Next scheduled batch changeover at 10:00 PM.
                </p>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="card overflow-hidden border-line">
            <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900 flex justify-between items-center">
              <span>Fleet Inventory Matrix (Live Hardware Counters)</span>
              <span className="text-ink-400 font-normal">
                Green: Nominal · Amber: Low Buffer · Red: Blocked
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-page/70 border-b border-line text-ink-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Machine Unit</th>
                  <th className="py-3 px-4">Fresh Milk (L)</th>
                  <th className="py-3 px-4">Manhattan Velvet</th>
                  <th className="py-3 px-4">Classic Latte</th>
                  <th className="py-3 px-4">Grande Roast</th>
                  <th className="py-3 px-4">Chilled Frappe</th>
                  <th className="py-3 px-4">Cups in Hopper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {machines.map((m) => (
                  <tr key={m.id} className="hover:bg-page/50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-ink-900">{m.name}</p>
                      <p className="text-[11px] text-ink-400 font-mono">{m.code}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          m.milkLiters < 20
                            ? 'bg-amber2-100 text-amber2-800'
                            : 'bg-leaf-50 text-leaf-700'
                        }`}
                      >
                        {m.milkLiters}L / 45L
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">82 kits</td>
                    <td className="py-3 px-4 font-mono">44 kits</td>
                    <td className="py-3 px-4 font-mono">36 kits</td>
                    <td className="py-3 px-4 font-mono">
                      {m.mode === 'COLD' ? (
                        <span className="text-amber2-700 font-bold">14 kits (Low)</span>
                      ) : (
                        <span>28 kits</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-ink-900">
                      {m.cupsCount} / 250
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TANKS LIFECYCLE */}
      {subView === 'tanks' && (
        <div className="space-y-4">
          <div className="card overflow-hidden border-line">
            <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
              Active &amp; Historical Milk Batch Tanks
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Batch UID</th>
                  <th className="py-3 px-4">Machine Assigned</th>
                  <th className="py-3 px-4">Volume (L)</th>
                  <th className="py-3 px-4">Mounted Time</th>
                  <th className="py-3 px-4">18h Expiry Cutoff</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-mono">
                {tanks.map((t) => (
                  <tr key={t.id} className="hover:bg-page/50">
                    <td className="py-3 px-4 font-bold text-brand-600">{t.tankUid}</td>
                    <td className="py-3 px-4 font-sans text-ink-900 font-semibold">{t.machineId}</td>
                    <td className="py-3 px-4 font-bold">{t.liters}L</td>
                    <td className="py-3 px-4 text-ink-600">{t.filledAt}</td>
                    <td className="py-3 px-4 text-ink-600">{t.expiresAt}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          t.status === 'ACTIVE'
                            ? 'bg-leaf-50 text-leaf-600'
                            : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. RAW SUPPLIES & COST BASIS */}
      {subView === 'supplies' && (
        <div className="space-y-4">
          <div className="card overflow-hidden border-line">
            <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900">
              Raw Ingredients Inventory &amp; Unit Cost Engine
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Ingredient / Supply Item</th>
                  <th className="py-3 px-4">Warehouse Stock</th>
                  <th className="py-3 px-4">Purchase Unit Cost</th>
                  <th className="py-3 px-4">Cost Basis Per Cup</th>
                  <th className="py-3 px-4">Reorder Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {supplies.map((s) => (
                  <tr key={s.id} className="hover:bg-page/50">
                    <td className="py-3 px-4 font-semibold text-ink-900">{s.name}</td>
                    <td className="py-3 px-4 font-mono font-bold">{s.stock}</td>
                    <td className="py-3 px-4 font-mono text-ink-700">{s.unitCost}</td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-600">
                      {s.servingCost}
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-400">{s.reorder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. WASTE & LOSS LOG */}
      {subView === 'waste' && (
        <div className="space-y-4">
          <div className="card overflow-hidden border-line">
            <div className="p-4 border-b border-line bg-page text-xs font-bold text-ink-900 flex justify-between">
              <span>Write-off &amp; Wastage Log</span>
              <span className="text-rose-600 font-mono font-bold">
                Total Monthly Loss: ₹316.00 (0.24% of revenue)
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-page/70 text-[10px] text-ink-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Loss Category</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Valuation Loss</th>
                  <th className="py-3 px-4">Audit Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {wasteLogs.map((w) => (
                  <tr key={w.id} className="hover:bg-page/50">
                    <td className="py-3 px-4 font-mono text-ink-500">{w.date}</td>
                    <td className="py-3 px-4 font-semibold text-ink-900">{w.machine}</td>
                    <td className="py-3 px-4 text-ink-700">{w.type}</td>
                    <td className="py-3 px-4 font-mono">{w.qty}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">{w.loss}</td>
                    <td className="py-3 px-4 text-ink-500">{w.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
