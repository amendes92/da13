import React, { useState, useEffect } from 'react';
import { RouteStatus, FreightJob, JobStatus } from '../types';
import { Button } from './Button';
import { QRCodeScanner } from './QRCodeScanner';
import { MapSimulation } from './MapSimulation';
import { LogOut, Check, XCircle, Navigation, Search, MapPin, Truck, Package, RotateCw, Calendar, DollarSign, Camera } from 'lucide-react';
import { calculateRoute } from '../services/mapService';

interface DriverDashboardProps {
  jobs: FreightJob[];
  routeStatus: RouteStatus;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
  onToggleRoute: (directions?: any) => void;
  onOptimizeRoute: () => Promise<void>;
  onLogout: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  jobs,
  routeStatus,
  onUpdateStatus,
  onToggleRoute,
  onOptimizeRoute,
  onLogout
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'navigation'>('overview');

  const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING).length;
  const completedJobs = jobs.filter(j => j.status === JobStatus.DELIVERED).length;
  const totalMoney = jobs.reduce((acc, job) => acc + (job.status === JobStatus.DELIVERED ? parseFloat(job.price.replace('R$ ', '').replace(',', '.')) : 0), 0);

  const handleStartRoute = async () => {
    setIsOptimizing(true);
    try {
        await onOptimizeRoute();
        const directions = await calculateRoute(routeStatus.currentLocation, jobs);
        onToggleRoute(directions);
        setViewMode('navigation');
    } catch (error) {
        console.error("Error starting route", error);
        alert("Erro ao calcular rota.");
    } finally {
        setIsOptimizing(false);
    }
  };

  if (viewMode === 'navigation') {
    const nextJob = jobs.find(j => j.status === JobStatus.PENDING || j.status === JobStatus.IN_TRANSIT);
    
    return (
        <div className="h-[100dvh] flex flex-col bg-slate-900 relative">
            <div className="absolute top-4 left-4 right-4 z-20 bg-slate-800/90 backdrop-blur text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 border border-slate-700">
                <div className="bg-brand-orange p-3 rounded-xl shadow-lg shadow-orange-500/20">
                    <Truck size={28} className="text-white" />
                </div>
                <div>
                    <p className="text-sm text-slate-400 font-medium mb-0.5">Próxima Entrega</p>
                    <h2 className="text-lg font-bold leading-tight truncate max-w-[200px]">
                        {nextJob ? nextJob.address : 'Todas as entregas concluídas'}
                    </h2>
                </div>
            </div>

            <div className="flex-1 relative">
                <MapSimulation routeStatus={routeStatus} jobs={jobs} />
                
                <div className="absolute bottom-64 left-4 bg-slate-800 rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-xl border-4 border-slate-700 z-10 text-white">
                    <span className="text-xl font-bold">{routeStatus.speed}</span>
                    <span className="text-[10px] text-slate-400 font-medium">km/h</span>
                </div>
            </div>

            <div className="bg-slate-900 rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.5)] p-6 pb-safe z-20 relative border-t border-slate-800">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-700 rounded-full"></div>

                {nextJob ? (
                    <>
                        <div className="flex items-start gap-4 mb-6 mt-2">
                             <img 
                                 src={nextJob.photoUrl} 
                                 alt={nextJob.clientName} 
                                 className="w-20 h-20 rounded-lg object-cover ring-2 ring-slate-700"
                             />
                             <div className="flex-1">
                                 <h3 className="font-bold text-xl text-white">{nextJob.clientName}</h3>
                                 <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                                     <Package size={14} className="text-brand-orange"/> {nextJob.cargoType}
                                 </p>
                                 <div className="flex items-center gap-3 mt-2">
                                     <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{nextJob.weight}</span>
                                     <span className="text-brand-orange font-bold text-sm">{nextJob.price}</span>
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <Button 
                                variant="secondary" 
                                onClick={() => {
                                    if(window.confirm(`Cancelar entrega para ${nextJob.clientName}?`)) {
                                        onUpdateStatus(nextJob.id, JobStatus.CANCELED);
                                    }
                                }}
                                className="h-14 bg-slate-800 text-red-400 border-slate-700 hover:bg-slate-700 hover:text-red-300"
                            >
                                <XCircle size={20} /> Cancelar
                            </Button>

                            <Button 
                                variant={nextJob.status === JobStatus.IN_TRANSIT ? 'success' : 'cta'}
                                onClick={() => {
                                    if (nextJob.status === JobStatus.PENDING) {
                                        onUpdateStatus(nextJob.id, JobStatus.IN_TRANSIT);
                                    } else {
                                        setIsScannerOpen(true);
                                    }
                                }} 
                                className="h-14"
                            >
                                {nextJob.status === JobStatus.PENDING ? (
                                    <><Navigation size={20} /> Iniciar</>
                                ) : (
                                    <><Check size={20} /> Entregar</>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-900">
                            <Check size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Serviço Finalizado!</h3>
                        <p className="text-slate-400">Bom trabalho, motorista.</p>
                    </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex gap-3">
                     <Button variant="secondary" onClick={() => setViewMode('overview')} className="flex-1 bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                        <Truck size={20} /> Meus Fretes
                    </Button>
                </div>
            </div>

            <QRCodeScanner 
                isScanning={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={(id) => {
                    if (nextJob) {
                        onUpdateStatus(nextJob.id, JobStatus.DELIVERED);
                    }
                    setIsScannerOpen(false);
                }}
            />
        </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[40%] z-0 bg-slate-900">
         <div className="absolute inset-0 opacity-40">
            <MapSimulation routeStatus={routeStatus} jobs={jobs} showRoute={routeStatus.isActive} />
         </div>
         <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
      </div>

      <div className="absolute top-0 left-0 right-0 pt-safe px-4 py-4 flex justify-between items-start z-10">
         <button onClick={onLogout} className="bg-slate-900/50 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-red-500/80 transition-colors">
            <LogOut size={20} />
         </button>
         <div className="bg-brand-orange px-4 py-2 rounded-full shadow-lg shadow-orange-500/30 text-white font-bold text-sm flex items-center gap-2">
            {routeStatus.isActive ? 'Em Rota' : 'Disponível'}
         </div>
      </div>

      <div className="absolute top-[30%] bottom-0 left-0 right-0 bg-slate-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col z-20 animate-in slide-in-from-bottom duration-500">
         <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
         </div>

         <div className="flex-1 flex flex-col px-6 pt-2 pb-safe overflow-hidden">
            
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900">Painel do Motorista</h1>
                <p className="text-slate-500 text-sm mt-1">Hoje, {new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                        <Package size={14} /> Entregas
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">{completedJobs}</span>
                        <span className="text-sm text-slate-400">/ {jobs.length}</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                     <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                        <DollarSign size={14} /> Ganhos
                    </div>
                    <span className="text-2xl font-black text-emerald-600">R$ {totalMoney.toFixed(2)}</span>
                </div>
            </div>

            <div className="relative mb-4">
                 <div className="absolute left-3 top-3.5 text-slate-400">
                    <Search size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar pedido..." 
                    className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl py-3 pl-10 pr-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow"
                />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 -mr-2 relative space-y-4">
                {jobs.map((job, index) => {
                    const isPending = job.status === JobStatus.PENDING;
                    const isDone = job.status === JobStatus.DELIVERED;

                    return (
                        <div key={job.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-orange text-white'}`}>
                                    {isDone ? <Check size={14} /> : index + 1}
                                </span>
                                <div className={`w-0.5 h-full ${index === jobs.length -1 ? 'hidden' : 'bg-slate-200'}`}></div>
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>{job.clientName}</h3>
                                    <span className="text-brand-orange font-bold text-sm">{job.price}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1 flex items-start gap-1">
                                    <MapPin size={14} className="mt-0.5 flex-shrink-0" /> {job.address}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">{job.weight}</span>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                        job.status === JobStatus.PENDING ? 'bg-yellow-50 text-yellow-600' :
                                        job.status === JobStatus.IN_TRANSIT ? 'bg-blue-50 text-blue-600' :
                                        'bg-emerald-50 text-emerald-600'
                                    }`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-200">
                 <Button variant="cta" fullWidth onClick={handleStartRoute} disabled={isOptimizing} className="h-14 text-lg">
                    {isOptimizing ? 'Otimizando Rota...' : (
                        <>
                            <RotateCw size={20} /> Iniciar Dia de Trabalho
                        </>
                    )}
                </Button>
            </div>
         </div>
      </div>
    </div>
  );
};