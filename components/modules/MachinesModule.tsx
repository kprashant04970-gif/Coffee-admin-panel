'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/lib/admin-context';
import { Machine } from '@/lib/types';
import {
  Cpu,
  Lock,
  Unlock,
  RotateCcw,
  PlayCircle,
  Thermometer,
  Activity,
  Layers,
  Package,
  HardDrive,
  Video,
  Terminal,
  Wrench,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Download,
  Plus,
  RefreshCw,
  Camera,
} from 'lucide-react';

export default function MachinesModule() {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    machineActiveTab,
    setMachineActiveTab,
    lockMachine,
    unlockMachine,
    rebootMachine,
    testDispense,
    setTargetTemp,
    setMachineMode,
    mountTank,
    refillStock,
    tanks,
    stock,
    toast,
  } = useAdmin();

  // Filters for fleet
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals inside machine detail
  const [mountModalOpen, setMountModalOpen] = useState(false);
  const [mountLiters, setMountLiters] = useState(38);
  const [mountUid, setMountUid] = useState('');

  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [refillVariant, setRefillVariant] = useState('Manhattan Velvet Cappuccino');
  const [refillAmount, setRefillAmount] = useState(30);

  const [telemetryWindow, setTelemetryWindow] = useState<'24h' | '7d' | '30d'>('24h');
  const [commandPayloadOpen, setCommandPayloadOpen] = useState<string | null>(null);

  const activeMachine =
    machines.find((m) => m.id === selectedMachineId) || machines[0];

  const filteredMachines = machines.filter((m) => {
    if (filterMode !== 'ALL' && m.mode !== filterMode) return false;
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    return true;
  });

  const machineTanks = tanks.filter((t) => t.machineId === activeMachine.id);
  const machineStock = stock.filter((s) => s.machineId === activeMachine.id);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'telemetry', label: 'Telemetry', icon: Thermometer },
    { id: 'tanks', label: 'Tanks', icon: Layers },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'hardware', label: 'Hardware', icon: HardDrive },
    { id: 'cameras', label: 'Cameras (2ch)', icon: Video },
    { id: 'commands', label: 'Commands', icon: Terminal },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Fleet Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-ink-900">
            Vending Fleet Management
          </h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            Real-time telemetry, tank lifespan, consumables buffer and hardware control.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 bg-white border border-line rounded-lg p-1 text-xs shadow-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-ink-900 text-white shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => setFilterMode('HOT')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                filterMode === 'HOT'
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              HOT
            </button>
            <button
              onClick={() => setFilterMode('COLD')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                filterMode === 'COLD'
                  ? 'bg-amber2-500 text-white shadow-xs'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              COLD
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Cards Grid (Card Grid per specification, high density) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((m) => {
          const isSelected = m.id === activeMachine.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedMachineId(m.id)}
              className={`card p-4.5 transition cursor-pointer relative ${
                isSelected
                  ? 'border-brand-500 ring-2 ring-brand-500/10 shadow-sm'
                  : 'hover:border-ink-300'
              }`}
            >
              {/* Warning ribbon if fault exists */}
              {m.activeFaults.length > 0 && (
                <div className="absolute top-0 right-0 bg-amber2-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>NEEDS ATTENTION</span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                      m.mode === 'HOT'
                        ? 'bg-brand-50 text-brand-600'
                        : 'bg-amber2-50 text-amber2-600'
                    }`}
                  >
                    {m.mode === 'HOT' ? '🏪' : '🧊'}
                  </span>
                  <div>
                    <h3 className="font-bold text-[14px] text-ink-900 leading-tight">
                      {m.name}
                    </h3>
                    <p className="text-[11px] text-ink-400 font-mono mt-0.5">
                      {m.code} · {m.city}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    m.status === 'ONLINE'
                      ? 'bg-leaf-50 text-leaf-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <p className="text-[11.5px] text-ink-500 mt-2 truncate">
                📍 {m.location}
              </p>

              {/* Metrics strip */}
              <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-line text-center">
                <div>
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">
                    Temp
                  </p>
                  <p className="text-[13px] font-bold text-ink-900 font-mono mt-0.5">
                    {m.temp.toFixed(1)}°C
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">
                    Milk Level
                  </p>
                  <p className="text-[13px] font-bold text-ink-900 font-mono mt-0.5">
                    {m.milkLiters}L
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-400 uppercase font-semibold">
                    Cups
                  </p>
                  <p className="text-[13px] font-bold text-ink-900 font-mono mt-0.5">
                    {m.cupsCount}
                  </p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-ink-400 font-mono">
                  <Wifi className="w-3 h-3 text-leaf-500" />
                  <span>{m.signalDbm} dBm</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {m.isLocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockMachine(m.id);
                      }}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>Unlock</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        lockMachine(m.id);
                      }}
                      className="px-2 py-1 rounded border border-line hover:bg-page text-ink-700 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Lock</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      rebootMachine(m.id);
                    }}
                    className="p-1 rounded border border-line hover:bg-page text-ink-600"
                    title="Reboot ESP32 controller"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testDispense(m.id);
                    }}
                    className="px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-600 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <PlayCircle className="w-3 h-3" />
                    <span>Test</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Machine Detail Shell (All 9 Tabs) */}
      <div className="card overflow-hidden">
        {/* Detail Shell Header */}
        <div className="p-4 sm:p-5 border-b border-line bg-page/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {activeMachine.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink-900 leading-tight">
                  {activeMachine.name}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    activeMachine.status === 'ONLINE'
                      ? 'bg-leaf-50 text-leaf-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {activeMachine.status}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    activeMachine.mode === 'HOT'
                      ? 'bg-brand-50 text-brand-600'
                      : 'bg-amber2-50 text-amber2-600'
                  }`}
                >
                  {activeMachine.mode} MODE
                </span>
              </div>
              <p className="text-xs text-ink-500 font-mono mt-0.5">
                {activeMachine.location} · Firmware {activeMachine.firmwareVersion} · Last sync {activeMachine.lastSeen}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => testDispense(activeMachine.id)}
              className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-page text-xs font-semibold text-ink-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-brand-500" />
              <span>Test Calibrate</span>
            </button>
            <button
              onClick={() => rebootMachine(activeMachine.id)}
              className="px-3 py-1.5 rounded-lg border border-line bg-white hover:bg-page text-xs font-semibold text-ink-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-ink-600" />
              <span>Reboot</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-line overflow-x-auto bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = machineActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMachineActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-medium border-b-2 transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-brand-500 text-brand-600 font-semibold'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes */}
        <div className="p-5 sm:p-6 bg-white min-h-[400px]">
          {/* 1. OVERVIEW TAB */}
          {machineActiveTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Temp Gauge Box */}
                <div className="card p-4 bg-page/50 border-line">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                    <span>Boiler Core Temp</span>
                    <span className="font-semibold text-brand-600">
                      Target: {activeMachine.targetTemp}°C
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold font-mono text-ink-900">
                      {activeMachine.temp.toFixed(1)}°C
                    </p>
                    <span className="text-xs text-leaf-600 font-semibold">Nominal</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setTargetTemp(activeMachine.id, activeMachine.targetTemp + 0.5)}
                      className="px-2 py-1 rounded bg-white border border-line text-xs font-bold hover:bg-brand-50"
                    >
                      +0.5°C
                    </button>
                    <button
                      onClick={() => setTargetTemp(activeMachine.id, activeMachine.targetTemp - 0.5)}
                      className="px-2 py-1 rounded bg-white border border-line text-xs font-bold hover:bg-brand-50"
                    >
                      -0.5°C
                    </button>
                  </div>
                </div>

                {/* Milk Level */}
                <div className="card p-4 bg-page/50 border-line">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                    <span>Milk Tank Volume</span>
                    <span className="font-mono">Max 45L</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-ink-900">
                    {activeMachine.milkLiters}
                    <span className="text-sm font-normal text-ink-400"> L</span>
                  </p>
                  <div className="w-full bg-line rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        activeMachine.milkLiters < 20 ? 'bg-amber2-500' : 'bg-brand-500'
                      }`}
                      style={{
                        width: `${(activeMachine.milkLiters / activeMachine.maxMilkLiters) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Cups Remaining */}
                <div className="card p-4 bg-page/50 border-line">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                    <span>Cups In Hopper</span>
                    <span className="font-mono">Max 250</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-ink-900">
                    {activeMachine.cupsCount}
                  </p>
                  <p className="text-xs text-ink-400 mt-2">
                    Estimated ~48h buffer at current velocity
                  </p>
                </div>

                {/* 4G / WiFi Signal */}
                <div className="card p-4 bg-page/50 border-line">
                  <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                    <span>Cellular Link (Airtel IoT)</span>
                    <span className="text-leaf-600 font-bold">Stable</span>
                  </div>
                  <p className="text-3xl font-bold font-mono text-ink-900">
                    {activeMachine.signalDbm}
                    <span className="text-sm font-normal text-ink-400"> dBm</span>
                  </p>
                  <p className="text-xs text-ink-400 mt-2 font-mono">
                    RTT: 38ms · TLS v1.3 MQTT
                  </p>
                </div>
              </div>

              {/* Mode switch & Safety */}
              <div className="card p-5 border-line flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">
                    Fleet Dispense Mode &amp; Safety Interlock
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Toggle hot/cold beverage cycle or activate emergency shutter interlock.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setMachineMode(
                        activeMachine.id,
                        activeMachine.mode === 'HOT' ? 'COLD' : 'HOT'
                      )
                    }
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-line bg-page hover:bg-white text-ink-700 transition"
                  >
                    Switch to {activeMachine.mode === 'HOT' ? 'COLD' : 'HOT'} Mode
                  </button>

                  {activeMachine.isLocked ? (
                    <button
                      onClick={() => unlockMachine(activeMachine.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Release Lock</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => lockMachine(activeMachine.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber2-500 text-white hover:bg-amber2-600 transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Machine</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. TELEMETRY TAB */}
          {machineActiveTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">
                    Historical Sensor Log &amp; Thermal Profile
                  </h3>
                  <p className="text-xs text-ink-500">
                    Partitioned telemetry points logged at 10-second intervals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-page border border-line rounded-lg p-0.5 text-xs">
                    {(['24h', '7d', '30d'] as const).map((w) => (
                      <button
                        key={w}
                        onClick={() => setTelemetryWindow(w)}
                        className={`px-3 py-1 rounded-md transition font-medium ${
                          telemetryWindow === w
                            ? 'bg-brand-500 text-white font-semibold'
                            : 'text-ink-600 hover:text-ink-900'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => toast('Telemetry CSV exported successfully', 'success')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-line text-xs font-medium hover:bg-page"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Simulated Telemetry Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-4 border-line">
                  <p className="text-xs font-bold text-ink-900 mb-2">
                    Temperature Curve ({telemetryWindow})
                  </p>
                  <div className="h-44 w-full bg-page/80 rounded-lg p-3 flex items-end justify-between gap-1">
                    {[65.1, 65.3, 65.4, 65.2, 65.6, 65.4, 65.5, 65.3, 65.7, 65.4, 65.5, 65.4].map(
                      (val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-brand-500/80 rounded-t-xs hover:bg-brand-600 transition"
                            style={{ height: `${(val - 60) * 14}px` }}
                          />
                          <span className="text-[9px] text-ink-400 font-mono">
                            {idx * 2}h
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-[11px] text-ink-400 mt-2 font-mono">
                    Max: 65.7°C · Min: 65.1°C · Mean: 65.4°C · StDev: 0.16°C
                  </p>
                </div>

                <div className="card p-4 border-line">
                  <p className="text-xs font-bold text-ink-900 mb-2">
                    Milk Consumption Rate ({telemetryWindow})
                  </p>
                  <div className="h-44 w-full bg-page/80 rounded-lg p-3 flex items-end justify-between gap-1">
                    {[45, 43, 41, 39, 36, 32, 28, 25, 22, 21, 21, 21].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-amber2-400/80 rounded-t-xs hover:bg-amber2-500 transition"
                          style={{ height: `${val * 3}px` }}
                        />
                        <span className="text-[9px] text-ink-400 font-mono">
                          {idx * 2}h
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-400 mt-2 font-mono">
                    Burn rate: ~1.8L/hr · Next refill estimated in 11.6 hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. TANKS TAB */}
          {machineActiveTab === 'tanks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">
                    Milk Tank Lifecycle &amp; FSSAI Compliance
                  </h3>
                  <p className="text-xs text-ink-500">
                    Fresh batches mounted with food safety 18-hour hold limit audit trails.
                  </p>
                </div>
                <button
                  onClick={() => setMountModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mount New Tank</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {machineTanks.map((tank) => (
                  <div
                    key={tank.id}
                    className={`card p-4.5 border-line ${
                      tank.status === 'ACTIVE'
                        ? 'border-brand-500/40 bg-brand-50/20'
                        : 'bg-page/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 font-mono uppercase">
                          {tank.tankUid}
                        </span>
                        <h4 className="font-bold text-sm text-ink-900 mt-0.5">
                          Capacity: {tank.liters}L / {tank.maxLiters}L
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          tank.status === 'ACTIVE'
                            ? 'bg-leaf-50 text-leaf-600'
                            : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {tank.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-ink-600 font-mono">
                      <p>Filled at: {tank.filledAt}</p>
                      <p>Expires at: {tank.expiresAt}</p>
                      <p>Tank Age: {tank.ageHours} hours on rack</p>
                    </div>

                    {tank.status === 'ACTIVE' && (
                      <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                        <span className="text-leaf-600 font-medium">
                          ✓ Cold Chain Verified (6.2°C)
                        </span>
                        <span className="text-ink-400 font-mono">FSSAI Certified</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. STOCK TAB */}
          {machineActiveTab === 'stock' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">
                    Consumables &amp; Kit Inventory Matrix
                  </h3>
                  <p className="text-xs text-ink-500">
                    Variant powders, sugar packs, cups, and stirrers per machine.
                  </p>
                </div>
                <button
                  onClick={() => setRefillModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Refill</span>
                </button>
              </div>

              <div className="card overflow-hidden border-line">
                <table className="w-full text-left text-xs">
                  <thead className="bg-page border-b border-line text-ink-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Variant / Component</th>
                      <th className="py-2.5 px-4">Remaining</th>
                      <th className="py-2.5 px-4">Buffer Progress</th>
                      <th className="py-2.5 px-4">Threshold</th>
                      <th className="py-2.5 px-4">Last Refill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {machineStock.map((s) => {
                      const pct = Math.round((s.quantity / s.maxCapacity) * 100);
                      const isLow = s.quantity <= s.reorderThreshold;
                      return (
                        <tr key={s.id} className="hover:bg-page/50">
                          <td className="py-3 px-4 font-semibold text-ink-900">
                            {s.variantName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {s.quantity} / {s.maxCapacity}
                          </td>
                          <td className="py-3 px-4 w-48">
                            <div className="tier-bar">
                              <i
                                style={{
                                  width: `${pct}%`,
                                  background: isLow ? '#EF4444' : '#F04E23',
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-ink-500">
                            {s.reorderThreshold} kits
                          </td>
                          <td className="py-3 px-4 text-ink-500">
                            {s.lastRefillAt} ({s.lastRefillBy})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. HARDWARE TAB */}
          {machineActiveTab === 'hardware' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">
                    Controller Diagnostics &amp; OTA Firmware
                  </h3>
                  <p className="text-xs text-ink-500">
                    ESP32-S3 microcontroller, dual-channel valves and safety watchdog status.
                  </p>
                </div>
                <button
                  onClick={() => toast('Checking OTA server for firmware v2.4.2...', 'info')}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-line bg-page hover:bg-white text-ink-700 rounded-lg text-xs font-semibold shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check OTA Updates</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4 border-line space-y-3">
                  <p className="text-xs font-bold text-ink-900">Microcontroller Telemetry</p>
                  <div className="space-y-2 text-xs font-mono text-ink-700">
                    <div className="flex justify-between border-b border-line pb-1">
                      <span className="text-ink-400">Firmware Build:</span>
                      <span className="font-semibold text-brand-600">
                        {activeMachine.firmwareVersion}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-line pb-1">
                      <span className="text-ink-400">SHA-256 Checksum:</span>
                      <span className="truncate max-w-[180px]">
                        {activeMachine.firmwareChecksum}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-line pb-1">
                      <span className="text-ink-400">Boot Cycle Counter:</span>
                      <span>{activeMachine.bootCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-line pb-1">
                      <span className="text-ink-400">Watchdog Resets (WDT):</span>
                      <span className="text-leaf-600 font-bold">
                        {activeMachine.wdtResets} (Clean)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">SD Storage Available:</span>
                      <span>{activeMachine.sdCardFreeMb} MB Free</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4 border-line space-y-3">
                  <p className="text-xs font-bold text-ink-900">Sensor Diagnostic Bus</p>
                  <div className="space-y-2 text-xs text-ink-700">
                    <div className="flex items-center justify-between border-b border-line pb-1">
                      <span>Flow Meter Hall Sensor</span>
                      <span className="text-leaf-600 font-bold">PASS (18 pulses/100ml)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-line pb-1">
                      <span>Boiler NTC Thermistor</span>
                      <span className="text-leaf-600 font-bold">PASS (±0.1°C variance)</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-line pb-1">
                      <span>Cup Optical Drop Sensor</span>
                      <span className="text-leaf-600 font-bold">PASS (Infrared calibrated)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Window Solenoid Latch</span>
                      <span className="text-leaf-600 font-bold">PASS (0 ms jitter)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. CAMERAS TAB */}
          {machineActiveTab === 'cameras' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">
                    Dual Surveillance &amp; Audit Cameras
                  </h3>
                  <p className="text-xs text-ink-500">
                    Internal Dispense Camera and External Customer Facing Camera.
                  </p>
                </div>
                <button
                  onClick={() => toast('Extracting 30-second synchronized MP4 clip...', 'info')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 text-white hover:bg-black rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Request 30s Evidence Clip</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Channel 1: Dispense */}
                <div className="card overflow-hidden border-line">
                  <div className="p-3 bg-page border-b border-line flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-900">
                      Channel 1: Internal Dispense Cam
                    </span>
                    <span className="text-[10px] font-bold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded">
                      LIVE · 25 FPS
                    </span>
                  </div>
                  {/* Video Mock Canvas */}
                  <div className="h-56 bg-slate-900 relative flex items-center justify-center text-white">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-3 font-mono text-[10px] text-emerald-400">
                      <div className="flex justify-between">
                        <span>REC ● CH-01 NOZZLE</span>
                        <span>01-10-2026 11:42:15</span>
                      </div>
                      <div className="flex justify-between text-white/80">
                        <span>CUP PRESENT: YES</span>
                        <span>VALVE: CLOSED</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-400/60 flex items-center justify-center mx-auto mb-2">
                        ☕
                      </div>
                      <p className="text-xs text-slate-300">Dispense Chute Target View</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white text-xs text-ink-500 flex justify-between">
                    <span>SD Loop: 7 Days Retention</span>
                    <span className="font-mono">Resolution: 1080p H.265</span>
                  </div>
                </div>

                {/* Channel 2: Customer */}
                <div className="card overflow-hidden border-line">
                  <div className="p-3 bg-page border-b border-line flex items-center justify-between">
                    <span className="text-xs font-bold text-ink-900">
                      Channel 2: Customer Window Cam
                    </span>
                    <span className="text-[10px] font-bold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded">
                      LIVE · 25 FPS
                    </span>
                  </div>
                  <div className="h-56 bg-slate-900 relative flex items-center justify-center text-white">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-3 font-mono text-[10px] text-emerald-400">
                      <div className="flex justify-between">
                        <span>REC ● CH-02 FACING</span>
                        <span>01-10-2026 11:42:15</span>
                      </div>
                      <div className="flex justify-between text-white/80">
                        <span>WINDOW SENSOR: LATCHED</span>
                        <span>LIGHTING: LUX 420</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-sky-400/60 flex items-center justify-center mx-auto mb-2">
                        👤
                      </div>
                      <p className="text-xs text-slate-300">Customer Pickup Bay View</p>
                    </div>
                  </div>
                  <div className="p-3 bg-white text-xs text-ink-500 flex justify-between">
                    <span>SD Loop: 7 Days Retention</span>
                    <span className="font-mono">Resolution: 1080p H.265</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. COMMANDS TAB */}
          {machineActiveTab === 'commands' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">Remote MQTT Command Queue</h3>
                  <p className="text-xs text-ink-500">
                    Asynchronous hardware dispatches with TTL countdown and JSON acknowledgement.
                  </p>
                </div>
                <button
                  onClick={() => toast('Re-issuing calibration command...', 'info')}
                  className="px-3 py-1.5 rounded-lg border border-line bg-page text-xs font-semibold hover:bg-white"
                >
                  Send Ping
                </button>
              </div>

              <div className="card overflow-hidden border-line text-xs">
                <table className="w-full text-left">
                  <thead className="bg-page border-b border-line text-ink-400 font-semibold text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Command ID</th>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Sent At</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Requested By</th>
                      <th className="py-2.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    <tr className="hover:bg-page/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-ink-900">CMD-4912</td>
                      <td className="py-2.5 px-4">TEST_DISPENSE (20ml)</td>
                      <td className="py-2.5 px-4 text-ink-500 font-mono">11:15 AM</td>
                      <td className="py-2.5 px-4">
                        <span className="text-leaf-600 font-bold bg-leaf-50 px-2 py-0.5 rounded">
                          EXECUTED
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-ink-600">Chief Rohan</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() =>
                            setCommandPayloadOpen(
                              JSON.stringify(
                                { code: 0, status: 'SUCCESS', pulses: 18, ml: 20.2 },
                                null,
                                2
                              )
                            )
                          }
                          className="text-brand-500 hover:underline font-semibold"
                        >
                          View Result JSON
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-page/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-ink-900">CMD-4908</td>
                      <td className="py-2.5 px-4">SYNC_CLOCK_NTP</td>
                      <td className="py-2.5 px-4 text-ink-500 font-mono">08:00 AM</td>
                      <td className="py-2.5 px-4">
                        <span className="text-leaf-600 font-bold bg-leaf-50 px-2 py-0.5 rounded">
                          EXECUTED
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-ink-600">Cron Scheduler</td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() =>
                            setCommandPayloadOpen(
                              JSON.stringify(
                                { code: 0, offset_ms: -4, source: 'in.pool.ntp.org' },
                                null,
                                2
                              )
                            )
                          }
                          className="text-brand-500 hover:underline font-semibold"
                        >
                          View Result JSON
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {commandPayloadOpen && (
                <div className="card p-4 bg-ink-900 text-brand-300 font-mono text-xs rounded-xl relative">
                  <button
                    onClick={() => setCommandPayloadOpen(null)}
                    className="absolute top-2 right-2 text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                  <p className="text-white font-bold mb-2">MQTT Result Payload:</p>
                  <pre>{commandPayloadOpen}</pre>
                </div>
              )}
            </div>
          )}

          {/* 8. MAINTENANCE TAB */}
          {machineActiveTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">Service Logs &amp; Tasks</h3>
                  <p className="text-xs text-ink-500">
                    Technician visit history, sanitization cycles, and nozzle flush routines.
                  </p>
                </div>
                <button
                  onClick={() => toast('Maintenance visit scheduled for tomorrow 06:00 AM', 'success')}
                  className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-semibold shadow-xs"
                >
                  Schedule Tech Visit
                </button>
              </div>

              <div className="space-y-3">
                <div className="card p-3.5 border-line flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-leaf-50 text-leaf-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink-900">
                        Sanitization &amp; Descaling Cycle Completed
                      </p>
                      <span className="text-[11px] text-ink-400 font-mono">
                        Yesterday, 04:30 AM
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Technician Suresh K. cleaned milk tubes with food-grade citric solution, inspected flow sensors, and flushed 400ml sterile hot water.
                    </p>
                  </div>
                </div>

                <div className="card p-3.5 border-line flex items-start gap-3">
                  <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-ink-900">
                        Cup Hopper Belt Realignment
                      </p>
                      <span className="text-[11px] text-ink-400 font-mono">
                        28 Sep 2026
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Tensioned chute belt gear to eliminate cup tilt errors during dispense. Tested 10 consecutive drop tests nominal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. SETTINGS TAB */}
          {machineActiveTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm font-bold text-ink-900">Per-Machine Configuration</h3>
                <p className="text-xs text-ink-500">
                  Override fleet defaults specifically for {activeMachine.name}.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={activeMachine.name}
                    className="w-full px-3 py-2 border border-line rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Boiler Target Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={activeMachine.targetTemp}
                    onChange={(e) => setTargetTemp(activeMachine.id, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-line rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Lock Policy on Critical Fault
                  </label>
                  <select className="w-full px-3 py-2 border border-line rounded-lg bg-white">
                    <option>Automatic Immediate Lock (Safe)</option>
                    <option>Warning Only (Allow Cashless Retries)</option>
                  </select>
                </div>

                <button
                  onClick={() => toast('Machine configuration updated successfully', 'success')}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mount Tank Modal */}
      {mountModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <h3 className="text-base font-bold text-ink-900 pb-2 border-b border-line">
              Mount Milk Batch Tank on {activeMachine.code}
            </h3>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Milk Volume (Litres)
                </label>
                <input
                  type="number"
                  value={mountLiters}
                  onChange={(e) => setMountLiters(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  FSSAI Batch Barcode UID
                </label>
                <input
                  type="text"
                  placeholder="FSSAI-MH-2026-904"
                  value={mountUid}
                  onChange={(e) => setMountUid(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono uppercase"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMountModalOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-page rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    mountTank(activeMachine.id, mountLiters, mountUid);
                    setMountModalOpen(false);
                  }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs"
                >
                  Mount Tank
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refill Consumables Modal */}
      {refillModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-line rounded-2xl p-6 max-w-md w-full shadow-pop">
            <h3 className="text-base font-bold text-ink-900 pb-2 border-b border-line">
              Refill Consumables on {activeMachine.code}
            </h3>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Select Variant / Item
                </label>
                <select
                  value={refillVariant}
                  onChange={(e) => setRefillVariant(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg bg-white"
                >
                  <option>Manhattan Velvet Cappuccino</option>
                  <option>Classic Café Latte</option>
                  <option>Grande Roast</option>
                  <option>Chilled Manhattan Frappe</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-ink-700 mb-1">
                  Units Added
                </label>
                <input
                  type="number"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-line rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRefillModalOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-page rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    refillStock(activeMachine.id, refillVariant, refillAmount);
                    setRefillModalOpen(false);
                  }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg shadow-xs"
                >
                  Confirm Refill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
