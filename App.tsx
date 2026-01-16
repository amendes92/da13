
import React, { useState, useEffect } from 'react';
import { UserRole, FreightJob, RouteStatus, JobStatus } from './types';
import { INITIAL_JOBS, MAP_CENTER } from './constants';
import { DriverDashboard } from './components/DriverDashboard';
import { ClientDashboard } from './components/ParentDashboard';
import { FreightRequestWizard } from './components/FreightRequestWizard'; 
import { LoginScreen } from './components/LoginScreen'; 
import { Button } from './components/Button';
import { Truck, Package, MapPin, UserCircle2, ArrowRight } from 'lucide-react';
import { optimizeRoute } from './services/geminiService';
import { AddressAutocomplete } from './components/AddressAutocomplete';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.NONE);
  const [jobs, setJobs] = useState<FreightJob[]>(INITIAL_JOBS);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>({
    isActive: false,
    currentLocation: MAP_CENTER,
    speed: 0,
    nextStop: 'Garagem',
    eta: '--:--'
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Navigation States
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); 
  const [showLogin, setShowLogin] = useState(false);
  
  // Guest Data
  const [guestAddress, setGuestAddress] = useState('');
  const [guestLocation, setGuestLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRouteStatus(prev => ({
            ...prev,
            currentLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.warn("Geolocation failed", error);
          setLocationError("Usando localização padrão (SP).");
        }
      );
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (routeStatus.isActive) {
      interval = setInterval(() => {
        setRouteStatus(prev => ({
          ...prev,
          speed: Math.floor(Math.random() * (80 - 40) + 40),
          eta: `${Math.floor(Math.random() * 20) + 15} min`
        }));
      }, 3000);
    } else {
        setRouteStatus(prev => ({ ...prev, speed: 0, eta: '--:--' }));
    }
    return () => clearInterval(interval);
  }, [routeStatus.isActive]);

  const handleUpdateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
  };

  const handleToggleRoute = (directions?: any) => {
    setRouteStatus(prev => ({
        ...prev,
        isActive: !prev.isActive,
        nextStop: !prev.isActive ? jobs[0].address : 'Base',
        directionsResult: directions || undefined
    }));
  };

  const handleOptimizeRoute = async () => {
    try {
      const orderedIds = await optimizeRoute(jobs);
      const reorderedJobs = orderedIds
        .map(id => jobs.find(j => j.id === id))
        .filter((j): j is FreightJob => !!j);
      const missingJobs = jobs.filter(j => !orderedIds.includes(j.id));
      setJobs([...reorderedJobs, ...missingJobs]);
    } catch (error) {
      console.error("Failed to update route order", error);
    }
  };

  const handlePlaceOrder = (newJob: Partial<FreightJob>, action: 'dashboard' | 'home') => {
    const fullJob: FreightJob = {
      id: `j${Date.now()}`,
      clientName: newJob.clientName || 'Cliente',
      address: newJob.address || '',
      pickupAddress: newJob.pickupAddress || '',
      cargoType: newJob.cargoType || 'Carga Geral',
      weight: newJob.weight || 'A calcular',
      price: newJob.price || 'Sob Consulta',
      status: JobStatus.PENDING,
      photoUrl: newJob.photoUrl || '',
      lat: newJob.lat || MAP_CENTER.lat,
      lng: newJob.lng || MAP_CENTER.lng,
      requirements: newJob.requirements || []
    };
    
    // Add to front of list
    setJobs(prev => [fullJob, ...prev]);
    
    // Navigation logic
    if (action === 'home') {
        setUserRole(UserRole.NONE); 
        setIsPlacingOrder(false);
        setGuestAddress('');
        setGuestLocation(null);
    } else {
        setUserRole(UserRole.CLIENT); 
        setIsPlacingOrder(false);
    }
  };

  const handleGuestEntry = () => {
      setUserRole(UserRole.GUEST);
      setIsPlacingOrder(true);
  };

  const renderLanding = () => (
    <div className="h-[100dvh] w-full bg-slate-900 flex flex-col items-center p-6 relative overflow-hidden text-white">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-orange rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
         <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse-slow"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md flex flex-col h-full animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex-1 flex flex-col justify-center items-center text-center">
             <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl mb-6 shadow-2xl shadow-orange-500/20 transform -rotate-3 border-4 border-slate-200">
                <Truck size={48} className="text-brand-orange" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Carreto do Carlos</h1>
            <p className="text-slate-400 text-lg font-medium">Mudanças e fretes rápidos.</p>
        </div>

        {/* Input Section (Guest Mode) */}
        <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl mb-6">
            <label className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2 block">Cotação Rápida</label>
            <h3 className="text-xl font-bold text-white mb-4">Onde vamos buscar sua carga?</h3>
            
            <div className="relative mb-4 text-slate-800">
                <AddressAutocomplete 
                    value={guestAddress}
                    onChange={(addr, lat, lng) => {
                        setGuestAddress(addr);
                        setGuestLocation({ lat, lng });
                    }}
                    placeholder="Digite o endereço de retirada..."
                    className="z-50"
                    onClear={() => {
                        setGuestAddress('');
                        setGuestLocation(null);
                    }}
                />
            </div>

            <Button 
                variant="cta" 
                fullWidth 
                onClick={handleGuestEntry}
                className="h-14 text-lg font-bold shadow-lg shadow-orange-500/20"
            >
                {guestAddress ? 'Cotar Agora' : 'Continuar como Convidado'} <ArrowRight size={20} />
            </Button>
        </div>

        {/* Login Link */}
        <div className="text-center pb-safe">
            <button 
                onClick={() => setShowLogin(true)}
                className="text-slate-400 hover:text-white font-medium text-sm flex items-center justify-center gap-2 mx-auto py-2 transition-colors"
            >
                <UserCircle2 size={16} /> Já sou cliente? Fazer Login
            </button>
            <p className="text-[10px] text-slate-600 mt-4">v2.0.0 • By Santana Mendes</p>
        </div>
      </div>
    </div>
  );

  // Main Render Flow
  if (userRole === UserRole.NONE) {
    if (showLogin) {
      return (
        <LoginScreen 
          onLogin={(role) => setUserRole(role)}
          onBack={() => setShowLogin(false)}
        />
      );
    }
    return renderLanding();
  }

  if (userRole === UserRole.DRIVER) {
    return (
      <DriverDashboard 
        jobs={jobs}
        routeStatus={routeStatus}
        onUpdateStatus={handleUpdateJobStatus}
        onToggleRoute={handleToggleRoute}
        onOptimizeRoute={handleOptimizeRoute}
        onLogout={() => {
            setUserRole(UserRole.NONE);
            setShowLogin(false);
        }}
      />
    );
  }

  // Client / Guest Logic
  if (isPlacingOrder) {
      return (
          <FreightRequestWizard 
            onComplete={handlePlaceOrder} 
            onCancel={() => {
                // If guest cancels, go back to landing. If client, go to dashboard
                if (userRole === UserRole.GUEST) {
                    setUserRole(UserRole.NONE);
                    setGuestAddress('');
                    setGuestLocation(null);
                } else {
                    setIsPlacingOrder(false);
                }
            }}
            initialPickupAddress={guestAddress}
            initialPickupLat={guestLocation?.lat}
            initialPickupLng={guestLocation?.lng}
          />
      );
  }

  return (
    <ClientDashboard 
        job={jobs[0]} 
        routeStatus={routeStatus}
        allJobs={jobs}
        onLogout={() => {
            setUserRole(UserRole.NONE);
            setGuestAddress('');
            setGuestLocation(null);
            setShowLogin(false);
        }}
        onPlaceOrder={() => setIsPlacingOrder(true)} 
    />
  );
};

export default App;
