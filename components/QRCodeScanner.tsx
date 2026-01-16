import React, { useState, useEffect } from 'react';
import { Camera, X, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface QRCodeScannerProps {
  onScan: (mockStudentId: string) => void;
  onClose: () => void;
  isScanning: boolean;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose, isScanning }) => {
  const [scanningEffect, setScanningEffect] = useState(0);

  // Simulate scanning process
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanningEffect(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm relative">
        <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="text-white bg-black/50 p-2 rounded-full hover:bg-white/20">
                <X size={24} />
            </button>
        </div>

        <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative aspect-[3/4]">
            {/* Simulated Camera Feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center">
                <Camera size={64} className="text-slate-600 animate-pulse" />
                <p className="absolute bottom-10 text-slate-400 text-sm">Aguardando QR Code...</p>
            </div>

            {/* Scanner Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/50 rounded-3xl"></div>
            
            {/* Scanning Laser Line */}
            <div 
                className="absolute left-10 right-10 h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-20"
                style={{ top: `${15 + (scanningEffect * 0.7)}%` }}
            ></div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 px-8">
                <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={() => {
                        // Simulate successful scan of a random student ID
                        // In a real app, this would come from the QR library decoding
                        const randomId = `s${Math.floor(Math.random() * 3) + 1}`;
                        onScan(randomId);
                    }}
                >
                    <CheckCircle className="w-5 h-5" /> Simular Leitura
                </Button>
            </div>
        </div>
        <p className="text-center text-white mt-4 font-medium">Posicione o código no quadrado</p>
      </div>
    </div>
  );
};