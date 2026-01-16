
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { FreightJob, RouteStatus, JobStatus } from '../types';
import { MapSimulation } from './MapSimulation';
import { MAP_CENTER } from '../constants';
import { AddressAutocomplete } from './AddressAutocomplete';
import { MapPin, Box, CheckSquare, Truck, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Camera, Info, Crosshair, Clock, Car, Armchair, Table2, Tv2, Lamp, Plus, Minus, Check, MessageSquare, User, ClipboardList, ArrowUpDown, Sun, Moon, Sunset, Watch, Ruler, Edit2, Download, Refrigerator, Sofa, FileText } from 'lucide-react';

interface FreightRequestWizardProps {
  onComplete: (jobData: Partial<FreightJob>, action: 'dashboard' | 'home') => void;
  onCancel: () => void;
  initialPickupAddress?: string;
  initialPickupLat?: number;
  initialPickupLng?: number;
}

type VehicleType = 'van' | 'carreto' | 'caminhao';

export const FreightRequestWizard: React.FC<FreightRequestWizardProps> = ({ 
    onComplete, 
    onCancel, 
    initialPickupAddress,
    initialPickupLat,
    initialPickupLng
}) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const [formData, setFormData] = useState({
    pickupAddress: initialPickupAddress || '',
    pickupLat: initialPickupLat || 0,
    pickupLng: initialPickupLng || 0,
    address: '', // Delivery
    destLat: 0,
    destLng: 0,
    cargoType: '',
    date: new Date(),
    timeSlot: 'Manhã (8h - 12h)',
    requirements: [] as string[]
  });

  // Time Selection State
  const [timeMode, setTimeMode] = useState<'shift' | 'specific'>('shift');

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Item Selection State (Step 4) - UPDATED ITEMS
  const [items, setItems] = useState({
    refrigerator: 0,
    sofa: 0,
    table: 0,
    furniture: 0,
    boxes: 0, 
  });
  
  // Observation State
  const [observation, setObservation] = useState('');

  // Route Data
  const [distance, setDistance] = useState<{ text: string; value: number } | null>(null);
  const [duration, setDuration] = useState<string>('');
  const [vehicle, setVehicle] = useState<VehicleType>('van');
  const [directionsResult, setDirectionsResult] = useState<any>(null);

  // Checklist States (Step 5)
  const [needsHelpers, setNeedsHelpers] = useState(false);
  const [disassembly, setDisassembly] = useState(false);
  const [hasElevator, setHasElevator] = useState(false); 

  const totalSteps = 6;

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  useEffect(() => {
    setOrderId(`#${Math.floor(Math.random() * 900000) + 100000}`);
  }, []);

  // Updated Weight Calculation
  const estimatedWeight = 
    (items.refrigerator * 80) + 
    (items.sofa * 60) + 
    (items.table * 40) + 
    (items.furniture * 30) + 
    (items.boxes * 15);

  useEffect(() => {
    const parts = [];
    if (items.refrigerator) parts.push(`${items.refrigerator}x Geladeira`);
    if (items.sofa) parts.push(`${items.sofa}x Sofá`);
    if (items.table) parts.push(`${items.table}x Mesa`);
    if (items.furniture) parts.push(`${items.furniture}x Móveis`);
    if (items.boxes) parts.push(`${items.boxes}x Caixas`);
    
    let desc = parts.join(', ') || 'Carga Diversa';
    
    // Append observation to cargo type for display purposes
    if (observation.trim()) {
        desc += ` (Obs: ${observation})`;
    }

    setFormData(prev => ({ ...prev, cargoType: desc }));

    if (estimatedWeight > 3000) setVehicle('caminhao');
    else if (estimatedWeight > 800) setVehicle('carreto');
    else setVehicle('van');

  }, [items, observation, estimatedWeight]);

  // Initial Geo Location fallback if no address provided
  useEffect(() => {
      // If we don't have a pickup address passed in, try to get user location
      if (step === 1 && !isSuccess && navigator.geolocation && !formData.pickupLat && !initialPickupAddress) {
        // Just used to center map potentially, but we rely on AddressAutocomplete mostly now
      }
  }, [step, isSuccess, initialPickupAddress]);

  // Calculate Route logic
  useEffect(() => {
    if (formData.pickupLat && formData.destLat && !isSuccess) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        if (!google) return;

        const service = new google.maps.DirectionsService();
        service.route({
            origin: { lat: formData.pickupLat, lng: formData.pickupLng },
            destination: { lat: formData.destLat, lng: formData.destLng },
            travelMode: google.maps.TravelMode.DRIVING
        }, (result: any, status: any) => {
            if (status === 'OK' && result.routes[0] && result.routes[0].legs[0]) {
                const leg = result.routes[0].legs[0];
                setDistance({ text: leg.distance.text, value: leg.distance.value });
                setDuration(leg.duration.text);
                setDirectionsResult(result);
            }
        });
    } else {
        setDirectionsResult(null);
        setDistance(null); // Reset distance if inputs change and are invalid
    }
  }, [formData.pickupLat, formData.pickupLng, formData.destLat, formData.destLng, isSuccess]);

  const calculatePrice = () => {
      if (!distance) return "A calcular";
      
      const km = distance.value / 1000;
      let basePrice = 0;
      let kmPrice = 0;

      switch (vehicle) {
          case 'van':
              basePrice = 120;
              kmPrice = 4.5;
              break;
          case 'carreto':
              basePrice = 250;
              kmPrice = 7.0;
              break;
          case 'caminhao':
              basePrice = 550;
              kmPrice = 12.0;
              break;
      }

      let total = basePrice + (km * kmPrice);
      if (needsHelpers) total += 120;
      if (disassembly) total += 100;
      if (!hasElevator) total += 50;

      return total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = () => {
      setIsSuccess(true);
  };

  const handleEditOrder = () => {
      setIsSuccess(false);
      setStep(6); // Go to review step
  };

  const finalizeOrder = (action: 'dashboard' | 'home') => {
    const requirements = [];
    if (needsHelpers) requirements.push("Carga e Descarga");
    if (disassembly) requirements.push("Desmontagem");
    if (hasElevator) requirements.push("Elevador");
    else requirements.push("Escada");

    const vehicleName = vehicle === 'van' ? 'Van Utilitária' : vehicle === 'carreto' ? 'VUC (Carreto)' : 'Caminhão Toco';

    onComplete({
      ...formData,
      requirements,
      clientName: "Cliente Atual",
      price: calculatePrice(),
      weight: vehicleName, 
      photoUrl: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=150&h=150&fit=crop",
      lat: formData.pickupLat,
      lng: formData.pickupLng,
      id: orderId 
    }, action);
  };

  const updateItem = (key: keyof typeof items, delta: number) => {
      setItems(prev => ({
          ...prev,
          [key]: Math.max(0, prev[key] + delta)
      }));
  };

  const getMapRouteStatus = (): RouteStatus => {
      return {
          isActive: !!directionsResult,
          currentLocation: formData.pickupLat ? { lat: formData.pickupLat, lng: formData.pickupLng } : MAP_CENTER,
          speed: 0,
          nextStop: '',
          eta: '',
          directionsResult: directionsResult
      };
  };

  const getMapJobs = (): FreightJob[] => {
      const jobs: FreightJob[] = [];
      if (formData.pickupLat) {
          jobs.push({
              id: 'pickup',
              lat: formData.pickupLat,
              lng: formData.pickupLng,
              clientName: 'Retirada',
              status: JobStatus.IN_TRANSIT, 
              address: formData.pickupAddress,
              cargoType: '', weight: '', price: '', photoUrl: ''
          });
      }
      if (formData.destLat) {
          jobs.push({
              id: 'dropoff',
              lat: formData.destLat,
              lng: formData.destLng,
              clientName: 'Entrega',
              status: JobStatus.PENDING, 
              address: formData.address,
              cargoType: '', weight: '', price: '', photoUrl: ''
          });
      }
      return jobs;
  };

  // --- UI COMPONENTS ---

  const renderHeader = () => (
    <div className="flex flex-col items-center pt-2 pb-6 bg-white z-20 relative px-8">
        <div className="flex items-center justify-between w-full max-w-xs relative">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10"></div>
            
            {/* Progress Line */}
            <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-orange -z-10 transition-all duration-500"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>

            {[1, 2, 3, 4, 5, 6].map((s) => (
                <div 
                    key={s} 
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-4 text-xs font-bold transition-all duration-300 z-10 ${
                        step >= s 
                        ? 'bg-white border-brand-orange text-brand-orange scale-110 shadow-lg' 
                        : 'bg-slate-100 border-slate-100 text-slate-400'
                    }`}
                >
                    {step > s ? <Check size={14} strokeWidth={3} /> : s}
                </div>
            ))}
        </div>
    </div>
  );

  const renderCalendar = () => {
    // ... (Calendar code remains the same)
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-card border border-slate-100">
            <div className="flex justify-between items-center mb-4 px-2">
                <span className="font-bold text-slate-800 capitalize">
                    {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-slate-100 rounded-full"><ChevronLeft size={16}/></button>
                    <button className="p-1 hover:bg-slate-100 rounded-full"><ChevronRight size={16}/></button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-xs font-bold text-brand-orange uppercase">{d}</div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
                {blanks.map(b => <div key={`blank-${b}`} />)}
                {days.map(day => {
                    const isSelected = formData.date.getDate() === day && formData.date.getMonth() === currentMonth.getMonth();
                    return (
                        <button
                            key={day}
                            onClick={() => setFormData(prev => ({ ...prev, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) }))}
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                isSelected 
                                ? 'bg-brand-orange text-white shadow-lg shadow-orange-500/30 font-bold scale-110' 
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderTimeSelection = () => {
     // ... (Time selection remains the same)
    const shiftSlots = [
        { id: 'Manhã (8h - 12h)', label: 'Manhã', sub: '8h - 12h', icon: Sun },
        { id: 'Tarde (13h - 17h)', label: 'Tarde', sub: '13h - 17h', icon: Sunset },
        { id: 'Noite (18h - 22h)', label: 'Noite', sub: '18h - 22h', icon: Moon },
    ];

    const specificTimes = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '18:00'
    ];

    return (
        <div className="mt-6">
            <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">Escolha o<br/>Horário</h2>

            {/* Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
                <button 
                    onClick={() => setTimeMode('shift')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        timeMode === 'shift' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Por Turno
                </button>
                <button 
                    onClick={() => setTimeMode('specific')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        timeMode === 'specific' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Por Horário
                </button>
            </div>

            {/* Content based on Tab */}
            {timeMode === 'shift' ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                    {shiftSlots.map((slot) => {
                        const isSelected = formData.timeSlot === slot.id;
                        return (
                            <label 
                                key={slot.id} 
                                className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                                    isSelected 
                                    ? 'border-brand-orange bg-brand-orange/5' 
                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                                onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot.id }))}
                            >
                                <div className={`p-2 rounded-full mr-4 ${isSelected ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <slot.icon size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{slot.label}</p>
                                    <p className="text-xs text-slate-500">{slot.sub}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-brand-orange' : 'border-slate-300'
                                }`}>
                                    {isSelected && <div className="w-3 h-3 rounded-full bg-brand-orange"></div>}
                                </div>
                            </label>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                    {specificTimes.map((time) => {
                        const isSelected = formData.timeSlot === time;
                        return (
                            <button
                                key={time}
                                onClick={() => setFormData(prev => ({ ...prev, timeSlot: time }))}
                                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                                    isSelected 
                                    ? 'border-brand-orange bg-brand-orange text-white shadow-lg shadow-orange-500/30' 
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                {time}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
  };

  if (isSuccess) {
      return (
        <div className="h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden animate-in fade-in duration-500">
            {/* Header Success */}
            <div className="bg-emerald-500 pt-safe pb-6 px-6 text-white rounded-b-[2.5rem] shadow-xl z-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex justify-between items-start mb-4">
                     <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                        <Check size={24} strokeWidth={3} />
                     </div>
                     <button onClick={() => finalizeOrder('dashboard')} className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold hover:bg-white/30 transition-colors">
                        Ver Meus Pedidos
                     </button>
                </div>
                <h1 className="text-3xl font-black mb-1">Pedido Recebido!</h1>
                <p className="opacity-90 font-medium">Cód: {orderId}</p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4 -mt-4 pt-8 pb-32">
                
                {/* Map Summary */}
                <div className="bg-white p-1 rounded-3xl shadow-card border border-slate-100 h-48 relative z-10">
                     <div className="w-full h-full rounded-[1.25rem] overflow-hidden relative">
                         <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black/30 pointer-events-none"></div>
                         <div className="absolute bottom-3 left-3 z-20 text-white">
                             <p className="text-xs font-bold uppercase opacity-80">Distância Total</p>
                             <p className="text-xl font-black">{distance?.text}</p>
                         </div>
                         <MapSimulation routeStatus={getMapRouteStatus()} jobs={getMapJobs()} showRoute={true} />
                     </div>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <h3 className="font-bold text-slate-900 text-lg">Resumo</h3>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold">Data</p>
                            <p className="font-bold text-slate-900">{formData.date.toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                             <div className="mt-1 text-brand-orange"><MapPin size={16} /></div>
                             <div>
                                 <p className="text-xs text-slate-400 font-bold uppercase">Origem</p>
                                 <p className="text-sm font-medium text-slate-900 leading-tight">{formData.pickupAddress}</p>
                             </div>
                        </div>
                        <div className="flex gap-3 items-start">
                             <div className="mt-1 text-slate-400"><MapPin size={16} /></div>
                             <div>
                                 <p className="text-xs text-slate-400 font-bold uppercase">Destino</p>
                                 <p className="text-sm font-medium text-slate-900 leading-tight">{formData.address}</p>
                             </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Itens</p>
                        <p className="text-sm text-slate-700 font-medium">{formData.cargoType}</p>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                             {needsHelpers && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Ajudantes</span>}
                             {disassembly && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">Montagem</span>}
                             {hasElevator && <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">Elevador</span>}
                        </div>
                    </div>

                     <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Total Estimado</span>
                        <span className="text-2xl font-black">{calculatePrice()}</span>
                    </div>
                </div>

                <Button variant="secondary" fullWidth onClick={() => alert('PDF Baixado!')} className="border-slate-200">
                    <Download size={18} /> Baixar Orçamento PDF
                </Button>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe flex gap-3 z-30">
                <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={handleEditOrder}
                    className="flex-1 border-slate-300 text-slate-700"
                >
                    <Edit2 size={18} /> Editar Pedido
                </Button>
                <Button 
                    variant="cta" 
                    fullWidth 
                    onClick={() => finalizeOrder('home')}
                    className="flex-1"
                >
                    Voltar ao Início
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white p-4 pt-safe flex items-center justify-between z-30 border-b border-slate-50">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
           <ChevronLeft size={24} />
        </button>
        <div className="font-bold text-slate-900">ZapMudança</div>
        <div className="w-6"></div>
      </div>

      {renderHeader()}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
          
          {/* STEP 1: ROUTE & QUOTE */}
          {step === 1 && (
            <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
                <div className="px-6 pt-6 shrink-0">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Criação de Cotação</h2>
                    
                    <div className="bg-white p-6 rounded-[2rem] shadow-card border border-slate-100 relative z-40">
                        {/* Origin */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-slate-900 ml-1 mb-1 block">Origem <span className="text-slate-400 font-normal">(CEP ou Endereço)</span></label>
                            <div className="relative z-50">
                                <AddressAutocomplete
                                    value={formData.pickupAddress}
                                    placeholder="Insira o endereço de origem"
                                    onChange={(addr, lat, lng) => setFormData(prev => ({...prev, pickupAddress: addr, pickupLat: lat, pickupLng: lng}))}
                                    onClear={() => setFormData(prev => ({...prev, pickupAddress: '', pickupLat: 0, pickupLng: 0}))}
                                />
                            </div>
                        </div>

                        {/* Swap Button */}
                        <div className="absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                            <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
                                <ArrowUpDown size={18} />
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="mt-8">
                            <label className="text-xs font-bold text-slate-900 ml-1 mb-1 block">Destino <span className="text-slate-400 font-normal">(CEP ou Endereço)</span></label>
                            <div className="relative z-40">
                                <AddressAutocomplete
                                    value={formData.address}
                                    placeholder="Insira o endereço de destino"
                                    onChange={(addr, lat, lng) => setFormData(prev => ({...prev, address: addr, destLat: lat, destLng: lng}))}
                                    onClear={() => setFormData(prev => ({...prev, address: '', destLat: 0, destLng: 0}))}
                                />
                            </div>
                        </div>

                        {/* Distance & Time */}
                        {distance && (
                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-3">
                                    <div className="bg-brand-orange/10 p-2 rounded-full text-brand-orange">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Distância</p>
                                        <p className="text-xl font-black text-slate-900">{distance.text}</p>
                                    </div>
                                </div>
                                <div className="h-10 w-[1px] bg-slate-100"></div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Tempo</p>
                                        <p className="text-xl font-black text-slate-900">{duration}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Preview - ONLY SHOWS IF DISTANCE IS CALCULATED */}
                {distance && (
                    <div className="flex-1 p-6 min-h-[250px] relative animate-in fade-in slide-in-from-bottom-4 duration-500 z-0">
                        <div className="w-full h-full rounded-[2rem] overflow-hidden shadow-inner border border-slate-200 relative bg-slate-200">
                            <MapSimulation routeStatus={getMapRouteStatus()} jobs={getMapJobs()} showRoute={true} />
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* STEP 2: DATE ONLY */}
          {step === 2 && (
             <div className="flex-1 overflow-y-auto no-scrollbar px-6 animate-in slide-in-from-right duration-300">
                <div className="mt-6">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">Agendar Data da<br/>Mudança</h2>
                    
                    <label className="text-xs font-bold text-slate-900 ml-1 mb-2 block">Data Desejada</label>
                    {renderCalendar()}
                </div>
             </div>
          )}

          {/* STEP 3: TIME SELECTION */}
          {step === 3 && (
             <div className="flex-1 overflow-y-auto no-scrollbar px-6 animate-in slide-in-from-right duration-300">
                {renderTimeSelection()}
             </div>
          )}

          {/* STEP 4: ITEMS (UPDATED) */}
          {step === 4 && (
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 animate-in slide-in-from-right duration-300">
                <div className="mt-6 mb-6">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Selecione os Itens da<br/>Sua Mudança</h2>
                </div>

                <div className="space-y-3">
                    {/* Item Row Helper */}
                    {[
                        { key: 'refrigerator', label: 'Geladeira', icon: Refrigerator },
                        { key: 'sofa', label: 'Sofá', icon: Sofa },
                        { key: 'table', label: 'Mesa', icon: Table2 },
                        { key: 'furniture', label: 'Móveis', icon: Armchair },
                        { key: 'boxes', label: 'Caixas', icon: Box },
                    ].map((item) => (
                        <div key={item.key} className={`bg-white rounded-2xl border-2 p-4 flex items-center justify-between transition-all ${
                            // @ts-ignore
                            items[item.key] > 0 ? 'border-brand-orange shadow-lg shadow-orange-500/10' : 'border-slate-100'
                        }`}>
                            <div className="flex items-center gap-4">
                                <div className="text-slate-700">
                                    <item.icon size={24} strokeWidth={1.5} />
                                </div>
                                <span className="font-bold text-slate-800">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* @ts-ignore */}
                                {items[item.key] > 0 && (
                                    <>
                                        {/* @ts-ignore */}
                                        <button onClick={() => updateItem(item.key, -1)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"><Minus size={14}/></button>
                                        {/* @ts-ignore */}
                                        <span className="font-bold text-slate-900 w-4 text-center">{items[item.key]}</span>
                                    </>
                                )}
                                {/* @ts-ignore */}
                                <button onClick={() => updateItem(item.key, 1)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${items[item.key] > 0 ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {/* @ts-ignore */}
                                    {items[item.key] > 0 ? <Plus size={14}/> : <Plus size={16}/>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Observation Field */}
                <div className="mt-6">
                    <label className="text-xs font-bold text-slate-900 ml-1 mb-2 flex items-center gap-2">
                        <FileText size={14} className="text-slate-400"/> Observações
                    </label>
                    <textarea 
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        placeholder="Ex: Sofá de 3 lugares, Geladeira duplex, Cuidado com o vidro..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange placeholder:text-slate-400 h-24 resize-none"
                    />
                </div>

                <div className="mt-6 mb-4 px-2">
                    <p className="text-slate-400 text-sm font-medium">Total Estimado: <span className="text-slate-900 font-bold">{estimatedWeight}kg</span></p>
                </div>
            </div>
          )}

          {/* STEP 5: SERVICES (NEW) */}
          {step === 5 && (
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 animate-in slide-in-from-right duration-300">
                <div className="mt-6 mb-6">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Serviços<br/>Adicionais</h2>
                    <p className="text-slate-500 mt-2">Precisa de ajuda extra?</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {[
                    { label: "Ajuda (Carga/Descarga)", checked: needsHelpers, set: setNeedsHelpers, icon: User },
                    { label: "Montagem/Desmontagem", checked: disassembly, set: setDisassembly, icon: Tool },
                    { label: "Possui Elevador?", checked: hasElevator, set: setHasElevator, icon: ArrowUpDown },
                    ].map((item, idx) => (
                    <label key={idx} className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                             {/* @ts-ignore */}
                            <div className={`p-2 rounded-xl ${item.checked ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-400'}`}>
                                 {/* @ts-ignore */}
                                <item.icon size={20} />
                            </div>
                            <span className="font-bold text-slate-800 text-lg">{item.label}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked ? 'border-brand-orange bg-brand-orange text-white' : 'border-slate-200 bg-white'
                        }`}>
                        {item.checked && <Check size={16} strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={item.checked} onChange={(e) => item.set(e.target.checked)} />
                    </label>
                    ))}
                </div>
            </div>
          )}

          {/* STEP 6: FINAL REVIEW (NEW) */}
          {step === 6 && (
             <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 animate-in slide-in-from-right duration-300">
                 <div className="mt-6 mb-6 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Resumo do Pedido</h2>
                    <p className="text-slate-500">Confira tudo antes de finalizar.</p>
                </div>

                {/* Mini Map Preview */}
                <div className="h-48 rounded-2xl overflow-hidden shadow-inner border border-slate-200 mb-6 relative pointer-events-none">
                     <MapSimulation routeStatus={getMapRouteStatus()} jobs={getMapJobs()} showRoute={true} />
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100 space-y-4">
                    
                    {/* Route Details */}
                    <div className="flex justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                                <Ruler size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Distância</p>
                                <p className="font-bold text-slate-900">{distance?.text || '--'}</p>
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-3 flex-row-reverse">
                            <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                                <Clock size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">Tempo</p>
                                <p className="font-bold text-slate-900">{duration || '--'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date Details */}
                    <div className="flex justify-between border-b border-slate-100 pb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Data</p>
                            <p className="font-bold text-slate-900">{formData.date.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase">Horário</p>
                            <p className="font-bold text-slate-900">{formData.timeSlot.split('(')[0]}</p>
                        </div>
                    </div>
                    
                    {/* Price Card */}
                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-slate-400 text-sm mb-1">Valor Total Estimado</p>
                                <p className="text-3xl font-black">{calculatePrice()}</p>
                            </div>
                            <Truck className="text-brand-orange mb-1" size={32} />
                        </div>
                    </div>
                </div>
             </div>
          )}

      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-slate-100 p-4 pb-safe z-30">
        <div className="flex gap-3">
            {step > 1 && (
                <Button 
                variant="secondary" 
                onClick={handleBack} 
                className="flex-1"
                >
                <ChevronLeft size={20} /> Voltar
                </Button>
            )}
            
            <Button 
                variant="cta" 
                fullWidth 
                onClick={step === totalSteps ? handleSubmit : handleNext}
                className="flex-[2] text-lg shadow-xl shadow-orange-600/20"
                disabled={step === 1 && (!formData.pickupAddress || !formData.address || !distance)}
            >
                {step === totalSteps ? 'Confirmar Pedido' : step === 1 ? 'Verificar Disponibilidade' : 'Confirmar e Avançar'} 
                {step !== totalSteps && <ChevronRight size={20} />}
            </Button>
        </div>
      </div>
    </div>
  );
};

// Helper Icon component for Tool (since it wasn't imported but used in Step 5 loop)
const Tool = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);
