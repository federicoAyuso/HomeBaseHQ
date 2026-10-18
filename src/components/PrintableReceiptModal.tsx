import React from 'react';
import { Payment, Tenant, Unit, Property } from '../types';
import { Printer, X, ShieldCheck, Building2, Download } from 'lucide-react';

interface PrintableReceiptModalProps {
  payment: Payment | null;
  tenants: Tenant[];
  units: Unit[];
  properties: Property[];
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  payment,
  tenants,
  units,
  properties,
  onClose,
}) => {
  if (!payment) return null;

  const tenant = tenants.find((t) => t.id === payment.tenantId);
  const unit = units.find((u) => u.id === (payment.unitId || tenant?.assignedUnitIds[0]));
  const property = unit ? properties.find((p) => p.id === unit.propertyId) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl w-full max-w-xl p-8 shadow-2xl space-y-6 relative print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Top Action Controls (hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Official Payment Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RECEIPT CONTENT AREA (Styled for Print) */}
        <div className="space-y-6 print:m-6">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-sm shrink-0">
                <img src="/logo.png" alt="Homebase Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Homebase HQ</h1>
                <p className="text-xs text-slate-500 font-medium">Rental Asset & Property Management</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receipt Number</p>
              <p className="text-lg font-mono font-bold text-slate-900">{payment.receiptNumber}</p>
              <p className="text-xs text-slate-500 mt-1">Date: {payment.date}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Tenant Details</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{tenant?.name || 'Valued Tenant'}</p>
              <p className="text-slate-600 mt-0.5">Contact: {tenant?.contact || 'N/A'}</p>
              <p className="text-slate-600">Bank: {tenant?.bankDetails || 'N/A'}</p>
            </div>

            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Property & Unit</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{property?.name || 'Property Building'}</p>
              <p className="text-slate-600 mt-0.5">Unit: {unit?.unitNumber || 'Unspecified'}</p>
              <p className="text-slate-600">Power Meter: {unit?.meterSerial || 'N/A'}</p>
              {unit?.waterMeterSerial && (
                <p className="text-slate-600">Water Meter: {unit.waterMeterSerial}</p>
              )}
            </div>
          </div>

          {/* Payment Itemization Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px]">
                <th className="py-2">Description</th>
                <th className="py-2">Method</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3">
                  <span className="font-bold text-slate-900">Rental Payment</span>
                  <p className="text-[11px] text-slate-500">{payment.notes || 'Monthly rent collection'}</p>
                </td>
                <td className="py-3 font-mono text-slate-700">{payment.paymentMethod}</td>
                <td className="py-3 text-right font-bold text-slate-900">P{payment.amount.toLocaleString()}</td>
              </tr>

              {payment.expense > 0 && (
                <tr className="text-slate-600">
                  <td className="py-2">Maintenance Expense Deductible</td>
                  <td className="py-2 font-mono">Deduction</td>
                  <td className="py-2 text-right font-bold text-rose-600">-P{payment.expense.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total Box */}
          <div className="flex items-center justify-between p-4 bg-indigo-600 text-white rounded-xl shadow-xs">
            <div>
              <p className="text-xs text-indigo-100 font-semibold uppercase">Total Paid & Received</p>
              <p className="text-[10px] text-emerald-300 font-medium">Status: Fully Paid & Verified</p>
            </div>
            <p className="text-2xl font-black">P{payment.amount.toLocaleString()}</p>
          </div>

          {/* Footer Signature & Verification */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Homebase HQ Digital Record</span>
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-900">Miranda E Cavanagh</p>
              <p className="text-[10px] text-slate-400">Property Owner & Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
