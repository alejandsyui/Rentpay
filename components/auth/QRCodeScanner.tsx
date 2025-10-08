
import React, { useRef, useEffect, useState } from 'react';
import type { User } from '../../types';

// Let TypeScript know jsQR is available globally from the CDN script
declare var jsQR: any;

interface QRCodeScannerProps {
  onScanSuccess: (user: User) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (!videoElement || !canvasElement) return;

    const canvasContext = canvasElement.getContext('2d', { willReadFrequently: true });
    if (!canvasContext) return;

    let stream: MediaStream;

    const tick = () => {
      if (!isScanning) return;
      
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        canvasElement.height = videoElement.videoHeight;
        canvasElement.width = videoElement.videoWidth;
        canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          try {
            const userData = JSON.parse(code.data) as User;
            // Basic validation
            if (userData.name && userData.address && userData.phone && userData.role === 'tenant' && typeof userData.rentAmount === 'number') {
              setIsScanning(false);
              // Ensure subTenants is at least an empty array if not present
              const fullUserData = { ...userData, subTenants: userData.subTenants || [] };
              onScanSuccess(fullUserData);
              onClose();
              return; // Stop the loop
            } else {
              setScanError("Invalid QR code format. Please scan a valid tenant QR code.");
            }
          } catch (e) {
            setScanError("Failed to parse QR code. Please scan a valid tenant QR code.");
          }
        }
      }
      animationFrameId.current = requestAnimationFrame(tick);
    };

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        videoElement.srcObject = stream;
        videoElement.setAttribute("playsinline", "true"); // required for iOS Safari
        await videoElement.play();
        setIsLoading(false); // Camera is ready
        animationFrameId.current = requestAnimationFrame(tick);
      } catch (err) {
        console.error("Camera Error:", err);
        setIsLoading(false);
        setScanError("Could not access camera. Please check permissions and try again.");
      }
    };

    startScan();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // The dependencies are correct as we only want this effect to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all relative">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Scan Tenant QR Code
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close scanner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div className="p-4 sm:p-6 relative aspect-square bg-slate-900 rounded-b-lg">
             <video ref={videoRef} className="w-full h-full object-cover hidden" playsInline muted></video>
             <canvas ref={canvasRef} className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}></canvas>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2/3 h-2/3 border-4 border-dashed border-white/50 rounded-lg"></div>
             </div>
             {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                    <svg className="animate-spin h-8 w-8 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="p-4 text-center text-white">Initializing camera...</p>
                </div>
             )}
             {scanError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <p className="p-4 text-center text-white">{scanError}</p>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
