import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import { Camera, X, Flashlight, SwitchCamera, QrCode, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string, format: string) => void;
}

const BarcodeScanner = ({ isOpen, onClose, onScan }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
        },
        (decodedText, decodedResult) => {
          const format = decodedResult.result.format?.formatName || "UNKNOWN";
          setLastScanned(decodedText);
          onScan(decodedText, format);
          toast.success(`Scanned: ${decodedText}`, {
            description: `Format: ${format}`,
          });
        },
        (errorMessage) => {
          // Ignore scan errors (happens when no code is visible)
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast.error("Could not access camera", {
        description: "Please ensure camera permissions are granted",
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    scannerRef.current = null;
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Scan Barcode / QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner viewport */}
          <div 
            ref={containerRef}
            className="relative bg-muted rounded-lg overflow-hidden"
          >
            <div id="barcode-reader" className="w-full" />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-40 border-2 border-primary rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br" />
                  
                  {/* Scanning line animation */}
                  <div className="absolute inset-x-2 h-0.5 bg-primary/80 animate-pulse" 
                       style={{ 
                         animation: 'scan 2s ease-in-out infinite',
                         top: '50%'
                       }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Position the barcode within the frame
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Barcode className="w-4 h-4" /> Barcodes
              </span>
              <span className="flex items-center gap-1">
                <QrCode className="w-4 h-4" /> QR Codes
              </span>
            </div>
          </div>

          {/* Last scanned */}
          {lastScanned && (
            <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Last Scanned</p>
                <p className="font-mono text-sm font-medium">{lastScanned}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(lastScanned);
                  toast.success("Copied to clipboard");
                }}
              >
                Copy
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <style>{`
          @keyframes scan {
            0%, 100% { transform: translateY(-20px); opacity: 0.5; }
            50% { transform: translateY(20px); opacity: 1; }
          }
          #barcode-reader video {
            width: 100% !important;
            border-radius: 0.5rem;
          }
          #barcode-reader__scan_region {
            min-height: 200px;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
