'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Printer, ArrowLeft } from 'lucide-react';

export default function OrderPrintStubPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, toast } = useAdmin();

  const orderId = params?.id as string;
  const order = orders.find((o) => o.id === orderId) || orders[0];

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders Queue</span>
        </button>

        {/* A5 Printable Stub */}
        <div className="bg-white border-2 border-line rounded-2xl p-8 shadow-sm font-mono text-ink-900 space-y-4">
          <div className="text-center pb-4 border-b-2 border-dashed border-line">
            <h1 className="text-xl font-bold tracking-tight">MANHATTAN COFFEE</h1>
            <p className="text-xs text-ink-500 mt-0.5">Automated Vending Network</p>
            <p className="text-[10px] text-ink-400 mt-1">FSSAI Lic: 11526999000142</p>
          </div>

          <div className="py-2 text-xs space-y-2 border-b-2 border-dashed border-line">
            <div className="flex justify-between">
              <span>ORDER NO:</span>
              <span className="font-bold">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE/TIME:</span>
              <span>{order.time}</span>
            </div>
            <div className="flex justify-between">
              <span>VENDING UNIT:</span>
              <span>{order.machineName}</span>
            </div>
            <div className="flex justify-between">
              <span>BEVERAGE:</span>
              <span className="font-bold">{order.variant}</span>
            </div>
            <div className="flex justify-between">
              <span>METHOD:</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>UTR REF:</span>
              <span className="truncate max-w-[200px]">{order.utr}</span>
            </div>
          </div>

          <div className="py-2 flex justify-between font-bold text-base">
            <span>TOTAL AMOUNT PAID:</span>
            <span>₹{order.netAmount}.00</span>
          </div>

          <div className="text-center text-[11px] text-ink-500 pt-2 border-t border-line font-sans leading-relaxed">
            Brewed fresh at optimal 65.4°C temperature.
            <br />
            Support Hotline: WhatsApp +91 98200 11999
          </div>

          <button
            onClick={() => {
              window.print();
              toast('Sent to printer spooler', 'success');
            }}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-sans font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
