import React, { useState } from 'react';
import { Region, Property } from '../types';
import { MapPin, Plus, Building, Search, Trash2, Home, X } from 'lucide-react';

interface RegionsAndPropertiesProps {
  regions: Region[];
  properties: Property[];
  onAddRegion: (name: string, description: string) => void;
  onAddProperty: (name: string, address: string, regionId: string, imageUrl?: string) => void;
  onDeleteRegion: (id: string) => void;
}

export const RegionsAndProperties: React.FC<RegionsAndPropertiesProps> = ({
  regions,
  properties,
  onAddRegion,
  onAddProperty,
  onDeleteRegion,
}) => {
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showPropModal, setShowPropModal] = useState(false);
  const [regionName, setRegionName] = useState('');
  const [regionDesc, setRegionDesc] = useState('');

  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propRegionId, setPropRegionId] = useState('');
  const [propImage, setPropImage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegionFilter === 'all' || p.regionId === selectedRegionFilter;
    return matchesSearch && matchesRegion;
  });

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim()) return;
    onAddRegion(regionName, regionDesc);
    setRegionName('');
    setRegionDesc('');
    setShowRegionModal(false);
  };

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !propAddress || !propRegionId) return;
    onAddProperty(propName, propAddress, propRegionId, propImage || undefined);
    setPropName('');
    setPropAddress('');
    setPropRegionId('');
    setPropImage('');
    setShowPropModal(false);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <MapPin className="w-5 h-5" />
            </div>
            <span>Regions & Property Portfolio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage real estate regions, multi-family buildings, and complexes across Botswana
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowRegionModal(true)}
            className="px-3.5 py-2.5 rounded-xl liquid-glass-pill hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition border border-white/15"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>Add Region</span>
          </button>

          <button
            onClick={() => setShowPropModal(true)}
            className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-cyan-200" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Regions Strip */}
      <div className="liquid-glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span>Active Regional Divisions</span>
          </h2>
          <span className="text-xs text-cyan-300 font-mono font-medium">
            {regions.length} Regions Configured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {regions.map((r) => {
            const count = properties.filter((p) => p.regionId === r.id).length;
            return (
              <div
                key={r.id}
                className="p-3.5 rounded-xl liquid-glass-subtle border border-white/10 flex items-center justify-between group hover:border-cyan-400/30 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{r.name}</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono px-1.5 py-0.5 rounded font-bold">
                      {r.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{count} Properties Assigned</p>
                </div>

                <button
                  onClick={() => onDeleteRegion(r.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                  title="Delete Region"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Property Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search property by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full liquid-glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <select
          value={selectedRegionFilter}
          onChange={(e) => setSelectedRegionFilter(e.target.value)}
          className="liquid-glass-input rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
        >
          <option value="all" className="bg-slate-900 text-white">All Regions</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id} className="bg-slate-900 text-white">
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((p) => {
          const region = regions.find((r) => r.id === p.regionId);
          return (
            <div
              key={p.id}
              className="liquid-glass-card rounded-2xl overflow-hidden group hover:border-cyan-400/40 transition flex flex-col"
            >
              <div className="h-44 w-full overflow-hidden relative">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-3 right-3 liquid-glass px-2.5 py-1 rounded-full text-cyan-300 text-[10px] font-bold border border-cyan-400/30 shadow-md">
                  {region?.name || 'Region'}
                </div>
              </div>

              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{p.address}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    <span>{p.totalUnits} Total Units</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    Active Portfolio
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Region Modal */}
      {showRegionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Add New Region</h2>
              <button
                onClick={() => setShowRegionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRegion} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Region Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gaborone Central or Francistown"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  placeholder="Regional operational focus..."
                  value={regionDesc}
                  onChange={(e) => setRegionDesc(e.target.value)}
                  rows={3}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRegionModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Create Region
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Modal */}
      {showPropModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white">Add New Property</h2>
              <button
                onClick={() => setShowPropModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Property Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunset Heights Complex"
                  value={propName}
                  onChange={(e) => setPropName(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Physical Address</label>
                <input
                  type="text"
                  placeholder="Plot 4920, Extension 11, Gaborone"
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Assign Region</label>
                <select
                  value={propRegionId}
                  onChange={(e) => setPropRegionId(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-white">Select Region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Cover Image URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={propImage}
                  onChange={(e) => setPropImage(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPropModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Create Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
