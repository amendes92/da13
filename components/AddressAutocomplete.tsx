
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Loader2, Navigation } from 'lucide-react';

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value = '',
  onChange,
  placeholder = "Digite o endereço...",
  className = '',
  onClear
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state if prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = (input: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google || !google.maps || !google.maps.places) return;

    if (!input.trim()) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    const service = new google.maps.places.AutocompleteService();
    
    // Bounds for Sao Paulo (can be removed to search globally)
    const spBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-24.00, -46.85),
        new google.maps.LatLng(-23.35, -46.30)
    );

    service.getPlacePredictions({
      input,
      componentRestrictions: { country: 'br' },
      locationBias: spBounds,
      types: ['geocode', 'establishment'] // Search for addresses and businesses
    }, (results: PlacePrediction[] | null, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        setPredictions(results);
        setIsOpen(true);
      } else {
        setPredictions([]);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    fetchPredictions(val);
    
    // If cleared manually
    if (val === '' && onClear) onClear();
  };

  const handleSelectPrediction = (prediction: PlacePrediction) => {
    setIsLoading(true);
    setInputValue(prediction.description);
    setIsOpen(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ placeId: prediction.place_id }, (results: any, status: any) => {
      setIsLoading(false);
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        onChange(prediction.description, location.lat(), location.lng());
      }
    });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
        
        try {
          const response = await geocoder.geocode({ location: latlng });
          if (response.results[0]) {
            const address = response.results[0].formatted_address;
            setInputValue(address);
            onChange(address, latlng.lat, latlng.lng);
          }
        } catch (e) {
          console.error("Geocoding error", e);
        } finally {
            setIsLoading(false);
        }
      }, () => setIsLoading(false));
    }
  };

  const handleClear = () => {
      setInputValue('');
      setPredictions([]);
      setIsOpen(false);
      if(onClear) onClear();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            onFocus={() => inputValue && predictions.length > 0 && setIsOpen(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-12 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange placeholder:text-slate-400 shadow-sm transition-all"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {isLoading ? <Loader2 size={20} className="animate-spin text-brand-orange" /> : <Search size={20} />}
        </div>
        
        {inputValue ? (
            <button 
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
                <X size={18} />
            </button>
        ) : (
            <button 
                onClick={handleUseMyLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-orange hover:bg-orange-50 rounded-lg transition-colors"
                title="Usar minha localização"
            >
                <Navigation size={18} />
            </button>
        )}
      </div>

      {/* Custom Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto">
            <ul className="divide-y divide-slate-50">
                {predictions.map((pred) => (
                    <li 
                        key={pred.place_id}
                        onClick={() => handleSelectPrediction(pred)}
                        className="p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors flex items-center gap-3 group"
                    >
                        <div className="bg-slate-100 p-2 rounded-full text-slate-400 group-hover:bg-white group-hover:text-brand-orange group-hover:shadow-sm transition-all">
                            <MapPin size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">
                                {pred.structured_formatting.main_text}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {pred.structured_formatting.secondary_text}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
             <div className="bg-slate-50 p-2 flex justify-end">
                <img src="https://developers.google.com/static/maps/documentation/images/powered_by_google_on_white.png" alt="Powered by Google" className="h-4 opacity-70" />
            </div>
        </div>
      )}
    </div>
  );
};
