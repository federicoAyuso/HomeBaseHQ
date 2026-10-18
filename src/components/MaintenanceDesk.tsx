import React, { useState } from 'react';
import { MaintenanceTicket, Unit, Property, Tenant } from '../types';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldAlert, MessageSquare, Send, X } from 'lucide-react';

interface MaintenanceDeskProps {
  tickets: MaintenanceTicket[];
  units: Unit[];
  properties: Property[];
  tenants: Tenant[];
  onCreateTicket: (data: {
    unitId: string;
    propertyId?: string;
    title: string;
    description: string;
    category: MaintenanceTicket['category'];
    priority: MaintenanceTicket['priority'];
    assignedTo?: string;
    imageUrl?: string;
  }) => void;
  onUpdateTicket: (id: string, status: MaintenanceTicket['status'], updateText?: string) => void;
}

export const MaintenanceDesk: React.FC<MaintenanceDeskProps> = ({
  tickets,
  units,
  properties,
  tenants,
  onCreateTicket,
  onUpdateTicket,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [unitId, setUnitId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceTicket['category']>('Plumbing');
  const [priority, setPriority] = useState<MaintenanceTicket['priority']>('Medium');
  const [assignedTo, setAssignedTo] = useState('Property Management Team');
  const [imageUrl, setImageUrl] = useState('');

  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [updateComment, setUpdateComment] = useState('');

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'All') return true;
    return t.status === activeTab;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitId || !title) return;

    onCreateTicket({
      unitId,
      title,
      description,
      category,
      priority,
      assignedTo,
      imageUrl: imageUrl || undefined,
    });

    setTitle('');
    setDescription('');
    setImageUrl('');
    setShowModal(false);
  };

  const handlePostUpdate = (ticketId: string) => {
    if (!updateComment.trim()) return;
    onUpdateTicket(ticketId, selectedTicket?.status || 'Open', updateComment);
    setUpdateComment('');
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <span>Tenant Maintenance & Ticketing Desk</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log repair tickets, assign contractors, track resolution progress, and respond to tenants
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl liquid-btn-primary text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 text-cyan-200" />
          <span>Log Maintenance Request</span>
        </button>
      </div>

      {/* Tabs with Liquid Glass pills */}
      <div className="flex items-center gap-2 pb-2 overflow-x-auto">
        {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === tab
                ? 'liquid-btn-primary text-white shadow-md'
                : 'liquid-glass-pill text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ticket List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTickets.map((t) => {
          const unit = units.find((u) => u.id === t.unitId);
          const property = unit ? properties.find((p) => p.id === unit.propertyId) : null;

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`liquid-glass-card rounded-2xl p-5 space-y-3.5 cursor-pointer transition relative overflow-hidden ${
                selectedTicket?.id === t.id
                  ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                  : 'hover:border-cyan-400/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        t.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          : t.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs font-mono font-semibold text-cyan-300">{t.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-base mt-1.5">{t.title}</h3>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    t.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : t.status === 'In Progress'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{t.description}</p>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Unit: <strong className="text-slate-200">{property?.name} - {unit?.unitNumber}</strong>
                </span>
                <span>
                  Assigned: <strong className="text-cyan-300">{t.assignedTo || 'Unassigned'}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details & Timeline Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                  Ticket #{selectedTicket.id}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedTicket.title}</h2>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl liquid-glass-subtle border border-white/10 text-xs text-slate-200 space-y-2">
              <p><strong>Description:</strong> {selectedTicket.description}</p>
              <p><strong>Assigned To:</strong> {selectedTicket.assignedTo}</p>
              <p><strong>Priority:</strong> {selectedTicket.priority}</p>
            </div>

            {/* Quick Status Updater */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Change Status:</span>
              {(['Open', 'In Progress', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    onUpdateTicket(selectedTicket.id, st);
                    setSelectedTicket({ ...selectedTicket, status: st });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedTicket.status === st
                      ? 'liquid-btn-primary text-white'
                      : 'liquid-glass-pill text-slate-300 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Ticket Updates Timeline */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Activity Timeline & Responses
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedTicket.updates?.map((u) => (
                  <div key={u.id} className="p-2.5 rounded-xl liquid-glass-subtle border border-white/10 text-xs text-slate-200">
                    <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold mb-1">
                      <span>{u.author}</span>
                      <span>{new Date(u.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p>{u.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Post update or progress note..."
                  value={updateComment}
                  onChange={(e) => setUpdateComment(e.target.value)}
                  className="flex-1 liquid-glass-input rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={() => handlePostUpdate(selectedTicket.id)}
                  className="p-2 liquid-btn-primary text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="liquid-glass border border-white/20 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <span>Log Maintenance Request</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Unit *</label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                >
                  <option value="" className="bg-slate-900 text-white">Select Unit</option>
                  {units.map((u) => {
                    const p = properties.find((pr) => pr.id === u.propertyId);
                    return (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {p?.name} - {u.unitNumber}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Issue Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen Sink Pipe Leak"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MaintenanceTicket['category'])}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value="Plumbing" className="bg-slate-900 text-white">Plumbing</option>
                    <option value="Electrical" className="bg-slate-900 text-white">Electrical</option>
                    <option value="HVAC" className="bg-slate-900 text-white">HVAC</option>
                    <option value="Appliance" className="bg-slate-900 text-white">Appliance</option>
                    <option value="Structural" className="bg-slate-900 text-white">Structural</option>
                    <option value="General" className="bg-slate-900 text-white">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MaintenanceTicket['priority'])}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                  >
                    <option value="Low" className="bg-slate-900 text-white">Low</option>
                    <option value="Medium" className="bg-slate-900 text-white">Medium</option>
                    <option value="High" className="bg-slate-900 text-white">High</option>
                    <option value="Urgent" className="bg-slate-900 text-white">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue for contractors..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Assigned Contractor / Team</label>
                <input
                  type="text"
                  placeholder="e.g. Metro Plumbing (Dave)"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs text-white mt-1 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 liquid-btn-primary text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
