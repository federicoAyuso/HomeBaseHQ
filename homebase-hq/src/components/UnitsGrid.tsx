import React, { useState } from 'react';
import { Unit, Property, Tenant } from '../types';
import {
  Home,
  Plus,
  Search,
  Copy,
  Check,
  Zap,
  Droplets,
  DollarSign,
  UserCheck,
  Pencil,
  X,
  Building,
} from 'lucide-react';

interface UnitsGridProps {
  units: Unit[];
  properties: Property[];
  tenants: Tenant[];
  onAddUnit: (
    unitNumber: string,
    propertyId: string,
    meterSerial: string,
    waterMeterSerial: string,
    rentAmount: number,
    bedrooms: number,
    bathrooms: number
  ) => void;
  onUpdateUnit?: (id: string, updates: Partial<Unit>) => void;
}

export const UnitsGrid: React.FC<UnitsGridProps> = ({
  units,
  properties,
  tenants,
  onAddUnit,
  onUpdateUnit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [copiedMeterId, setCopiedMeterId] = useState<string | null>(null);
  const [copiedWaterMeterId, setCopiedWaterMeterId] = useState<string | null>(null);

  // Add form fields
  const [unitNumber, setUnitNumber] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [meterSerial, setMeterSerial] = useState('');
  const [waterMeterSerial, setWaterMeterSerial] = useState('');
  const [rentAmount, setRentAmount] = useState(1500);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);

  // Edit form fields
  const [editUnitNumber, setEditUnitNumber] = useState('');
  const [editMeterSerial, setEditMeterSerial] = useState('');
  const [editWaterMeterSerial, setEditWaterMeterSerial] = useState('');
  const [editRentAmount, setEditRentAmount] = useState(1500);
  const [editStatus, setEditStatus] = useState<Unit['status']>('Available');
  const [editBedrooms, setEditBedrooms] = useState(2);
  const [editBathrooms, setEditBathrooms] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUnits = units.filter((u) => {
    const prop = properties.find((p) => p.id === u.propertyId);
    const matchesSearch =
      u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.meterSerial && u.meterSerial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.waterMeterSerial && u.waterMeterSerial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prop && prop.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyMeter = (serial: string, id: string) => {
    navigator.clipboard.writeText(serial);
    setCopiedMeterId(id);
    setTimeout(() => setCopiedMeterId(null), 2000);
  };

  const handleCopyWaterMeter = (serial: string, id: string) => {
    navigator.clipboard.writeText(serial);
    setCopiedWaterMeterId(id);
    setTimeout(() => setCopiedWaterMeterId(null), 2000);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNumber || !propertyId) return;
    onAddUnit(
      unitNumber,
      propertyId,
      meterSerial,
      waterMeterSerial,
      rentAmount,
      bedrooms,
      bathrooms
    );
    setUnitNumber('');
    setPropertyId('');
    setMeterSerial('');
    setWaterMeterSerial('');
    setShowAddModal(false);
  };

  const openEditModal = (u: Unit) => {
    setEditingUnit(u);
    setEditUnitNumber(u.unitNumber);
    setEditMeterSerial(u.meterSerial || '');
    setEditWaterMeterSerial(u.waterMeterSerial || '');
    setEditRentAmount(u.rentAmount);
    setEditStatus(u.status);
    setEditBedrooms(u.bedrooms || 2);
    setEditBathrooms(u.bathrooms || 1);
  };

  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    if (onUpdateUnit) {
      onUpdateUnit(editingUnit.id, {
        unitNumber: editUnitNumber,
        meterSerial: editMeterSerial,
        waterMeterSerial: editWaterMeterSerial,
        rentAmount: editRentAmount,
        status: editStatus,
        bedrooms: editBedrooms,
        bathrooms: editBathrooms,
      });
    }
    setEditingUnit(null);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Home className="w-5 h-5" />
            </div>
            <span>Units & Meter Serial Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track unit availability, power & water meter serials, monthly rent in Botswana Pula (P), and assigned tenants
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 text-cyan-200" />
          <span>Add New Unit</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by unit number, property name, power meter, or water meter number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full liquid-glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="liquid-glass-input rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-slate-900 text-white">All Statuses</option>
          <option value="Available" className="bg-slate-900 text-white">Available Only</option>
          <option value="Occupied" className="bg-slate-900 text-white">Occupied Only</option>
          <option value="Maintenance" className="bg-slate-900 text-white">Under Maintenance</option>
        </select>
      </div>

      {/* Units Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUnits.map((u) => {
          const prop = properties.find((p) => p.id === u.propertyId);
          const tenant = tenants.find((t) => t.id === u.currentTenantId);

          return (
            <div
              key={u.id}
              className="liquid-glass-card rounded-2xl p-5 space-y-3.5 hover:border-cyan-400/40 transition group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    <span>{prop?.name || 'Property'}</span>
                  </span>
                  <h3 className="font-bold text-white text-base mt-0.5">{u.unitNumber}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      u.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                        : u.status === 'Occupied'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    {u.status}
                  </span>

                  <button
                    onClick={() => openEditModal(u)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 transition cursor-pointer"
                    title="Edit Unit & Meter Serials"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Power Meter Serial Box */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-between text-xs backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-wider">
                      Power Meter Serial
                    </p>
                    <p className="font-mono font-bold text-white tracking-wide">
                      {u.meterSerial || 'N/A'}
                    </p>
                  </div>
                </div>

                {u.meterSerial && (
                  <button
                    onClick={() => handleCopyMeter(u.meterSerial!, u.id)}
                    className="p-1.5 hover:bg-amber-400/20 rounded-lg text-slate-300 hover:text-amber-200 transition flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Copy Power Meter Serial"
                  >
                    {copiedMeterId === u.id ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Water Meter Serial Box - Directly under Power Meter Serial */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-between text-xs backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-cyan-300/80 uppercase tracking-wider">
                      Water Meter Serial
                    </p>
                    <p className="font-mono font-bold text-white tracking-wide">
                      {u.waterMeterSerial || (
                        <span className="text-slate-400 font-sans text-xs italic font-normal">
                          Not entered
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {u.waterMeterSerial ? (
                    <button
                      onClick={() => handleCopyWaterMeter(u.waterMeterSerial!, u.id)}
                      className="p-1.5 hover:bg-cyan-400/20 rounded-lg text-slate-300 hover:text-cyan-200 transition flex items-center gap-1 text-[11px] cursor-pointer"
                      title="Copy Water Meter Serial"
                    >
                      {copiedWaterMeterId === u.id ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                          <Check className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => openEditModal(u)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold transition cursor-pointer"
                    >
                      + Enter Water No.
                    </button>
                  )}
                </div>
              </div>

              {/* Rent & Specifications */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1 font-bold text-white text-sm">
                  <span className="text-emerald-400">P</span>
                  <span>{u.rentAmount.toLocaleString()} / mo</span>
                </div>
                <span className="text-slate-400 text-[11px] font-medium">
                  {u.bedrooms} Bed • {u.bathrooms} Bath
                </span>
              </div>

              {/* Assigned Tenant Status */}
              <div className="pt-2.5 border-t border-white/10 text-xs flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Assigned: </span>
                  <span className="font-semibold text-slate-200">
                    {tenant ? tenant.name : 'Unassigned (Vacant)'}
                  </span>
                </div>

                <button
                  onClick={() => openEditModal(u)}
                  className="text-[11px] text-cyan-300 hover:text-white font-medium hover:underline cursor-pointer"
                >
                  Edit Unit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Unit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-cyan-400" />
                <span>Add Unit & Meter Info</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-white">Select Property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Unit Number / Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. Unit 302 or Suite 4A"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              {/* Power Meter Serial Field */}
              <div>
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Power Meter Serial Code</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTR-98210-X"
                  value={meterSerial}
                  onChange={(e) => setMeterSerial(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                />
              </div>

              {/* Water Meter Serial Field - under Power Meter Serial */}
              <div>
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Water Meter Serial / Number</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. WTR-88120-W or 049281"
                  value={waterMeterSerial}
                  onChange={(e) => setWaterMeterSerial(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter the dedicated water meter number for this Botswana rental unit.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Monthly Rent (P)</label>
                  <input
                    type="number"
                    value={rentAmount}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bedrooms</label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bathrooms</label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Unit & Meter Serials Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-cyan-400" />
                  <span>Edit Unit & Meter Serials</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Update meter serial codes, water numbers, and rent specifications.
                </p>
              </div>
              <button
                onClick={() => setEditingUnit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUnit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Unit Identifier / Name</label>
                <input
                  type="text"
                  value={editUnitNumber}
                  onChange={(e) => setEditUnitNumber(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Unit Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Unit['status'])}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none cursor-pointer"
                >
                  <option value="Available" className="bg-slate-900 text-white">Available</option>
                  <option value="Occupied" className="bg-slate-900 text-white">Occupied</option>
                  <option value="Maintenance" className="bg-slate-900 text-white">Maintenance</option>
                </select>
              </div>

              {/* Power Meter Serial Field */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/20 space-y-1.5 backdrop-blur-md">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Power Meter Serial</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. MTR-88319-A"
                  value={editMeterSerial}
                  onChange={(e) => setEditMeterSerial(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono font-bold"
                />
              </div>

              {/* Water Meter Serial Field - under Power Meter Serial */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 space-y-1.5 backdrop-blur-md">
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Water Meter Serial / Number</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. WTR-55101-W or 049281"
                  value={editWaterMeterSerial}
                  onChange={(e) => setEditWaterMeterSerial(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400">
                  Enter the water number for this unit.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Monthly Rent (P)</label>
                  <input
                    type="number"
                    value={editRentAmount}
                    onChange={(e) => setEditRentAmount(Number(e.target.value))}
                    required
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bedrooms</label>
                  <input
                    type="number"
                    value={editBedrooms}
                    onChange={(e) => setEditBedrooms(Number(e.target.value))}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300">Bathrooms</label>
                  <input
                    type="number"
                    value={editBathrooms}
                    onChange={(e) => setEditBathrooms(Number(e.target.value))}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white mt-1 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Update Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
