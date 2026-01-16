
import React from 'react';
import { RouteStatus, FreightJob, JobStatus } from '../types';
import { MapSimulation } from './MapSimulation';
import { LogOut, Package, Truck, MapPin, Clock, Plus } from 'lucide-react';

interface ClientDashboardProps {
  job: FreightJob;
  routeStatus: RouteStatus;
  allJobs: FreightJob[];
  onLogout: () => void;
  onPlaceOrder: () => void; // Now triggers the Wizard in App.tsx
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  job,
  routeStatus,
  allJobs,
  onLogout,
  onPlaceOrder
}) => {
  const getStatusInfo = () => {
    switch (job.status) {
        case JobStatus.IN_TRANSIT: 
            return { text: 'Carreta em trânsito', color: 'bg-brand-orange', icon: <Truck size={20} className="text-white"/> };
        case JobStatus.DELIVERED: 
            return { text: 'Entrega realizada', color: 'bg-emerald-500', icon: <Package size={20} className="text-white"/> };
        default: 
            return { text: 'Aguardando agendamento', color: 'bg-slate-400', icon: <Clock size={20} className="text-white"/> };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden relative">
        <div className="flex-none bg-white p-4 shadow-sm flex justify-between items-center z-20 pt-safe border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Truck className="text-brand-orange" />
                Carreto do Carlos
            </h1>
            <div className="flex gap-2">
                 <button onClick={onPlaceOrder} className="bg-brand-orange hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 active:scale-95 flex items-center gap-2 transition-colors">
                    <Plus size={18} /> Novo Frete
                </button>
                <button onClick={onLogout} className="text-slate-500 hover:text-slate-900 transition-colors bg-slate-100 p-2 rounded-xl active:scale-95">
                    <LogOut size={20} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 max-w-2xl mx-auto w-full pb-24">
            
            {/* Status Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Cód. Rastreio</p>
                        <h2 className="text-2xl font-black text-slate-900">#{job.id.toUpperCase()}</h2>
                    </div>
                    <div className={`p-3 rounded-2xl shadow-lg ${statusInfo.color}`}>
                        {statusInfo.icon}
                    </div>
                </div>

                <div className="mb-6">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <img src={job.photoUrl} alt="Cargo" className="w-full h-full object-cover rounded-lg mix-blend-multiply" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{job.cargoType}</p>
                            <p className="text-xs text-slate-500">{job.weight}</p>
                        </div>
                     </div>
                     {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {job.requirements.map(req => (
                                <span key={req} className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                                    {req}
                                </span>
                            ))}
                        </div>
                     )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-sm font-medium text-slate-900 mb-2">{statusInfo.text}</p>
                    {job.status === JobStatus.IN_TRANSIT && (
                         <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-orange h-full w-2/3 animate-pulse"></div>
                         </div>
                    )}
                </div>
            </div>

            {/* Map Card */}
            <div className="bg-white rounded-3xl p-1 shadow-card border border-slate-100 h-80 relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                    <MapPin size={14} className="text-brand-orange"/>
                    Localização da Carreta
                </div>
                <div className="w-full h-full rounded-[1.25rem] overflow-hidden">
                     <MapSimulation routeStatus={routeStatus} jobs={allJobs} />
                </div>
            </div>
        </div>
    </div>
  );
};
