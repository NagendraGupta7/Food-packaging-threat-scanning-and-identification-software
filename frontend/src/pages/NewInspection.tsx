import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, ShieldCheck, Camera, X, Aperture } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';


export default function NewInspection() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [inspectorName, setInspectorName] = useState('John Doe');
  const [barcode, setBarcode] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  // Camera Capture State
  const [imageScanning, setImageScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader;
    if (scanning && barcodeVideoRef.current) {
      codeReader = new BrowserMultiFormatReader();
      codeReader.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        barcodeVideoRef.current,
        async (result, _err) => {
          if (result) {
            const decodedText = result.getText();
            setBarcode(decodedText);
            codeReader.reset();
            setScanning(false);
            
            try {
                const res = await axios.get(`${API_BASE}/products/barcode/${decodedText}`);
                if (res.data && res.data.name) {
                    setProductName(res.data.name);
                    if (res.data.details) setProductDetails(res.data.details);
                }
            } catch (apiErr) {
                setProductName(`Product #${decodedText.substring(0, 4)}`);
                setProductDetails('No details available in the global GS1 database.');
            }
          }
        }
      ).catch(console.error);

      return () => {
        codeReader.reset();
      };
    }
  }, [scanning]);

  const startCamera = async () => {
    setImageScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Could not access camera. Please allow permissions.");
      setImageScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setImageScanning(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
            setFile(capturedFile);
            setPreview(URL.createObjectURL(capturedFile));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !file) return;

    try {
      setLoading(true);
      
      // 1. Create the inspection (and product)
      const form = new FormData();
      form.append('product_name', productName);
      form.append('inspector_name', inspectorName);
      
      const res = await axios.post(`${API_BASE}/inspections/`, form);
      const inspectionId = res.data.id;

      // 2. Upload the image
      const imageForm = new FormData();
      imageForm.append('file', file);
      imageForm.append('view_type', 'front');
      
      await axios.post(`${API_BASE}/inspections/${inspectionId}/images`, imageForm);

      // Redirect to inspection view
      navigate(`/inspections/${inspectionId}`);
    } catch (err: any) {
      console.error(err);
      if (err?.response) {
        const detail = err.response.data?.detail || JSON.stringify(err.response.data);
        alert(`Error creating inspection (HTTP ${err.response.status}): ${detail}`);
      } else if (err?.request) {
        alert("Error creating inspection: no response from backend. Is it running at http://localhost:8000?");
      } else {
        alert(`Error creating inspection: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-[40px]">
      <div>
        <h1 className="font-geist text-[44px] text-bone tracking-[-1.1px] leading-none mb-2">New Inspection</h1>
        <p className="font-geist text-[16px] text-warm-granite">Upload a product image to initiate an AI compliance check.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[32px]">
        
        {/* Product Details */}
        <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px] space-y-6">
           <div>
              <label className="block font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Scan Barcode (EAN/UPC)</label>
              
              {scanning ? (
                <div className="bg-obsidian-canvas border border-carbon-lift p-4 rounded-[3px]">
                   <div className="flex justify-between items-center mb-4">
                     <span className="font-geist text-[12px] text-warm-granite">Point camera at barcode...</span>
                     <button type="button" onClick={() => setScanning(false)} className="text-signal-orange hover:text-bone">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="w-full max-w-[400px] mx-auto overflow-hidden rounded-[3px] bg-black">
                     <video ref={barcodeVideoRef} className="w-full h-auto object-cover max-h-[300px]" autoPlay playsInline></video>
                   </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                    <input 
                      type="text"
                      value={barcode}
                      className="flex-1 bg-obsidian-canvas border border-carbon-lift text-bone p-3 rounded-[3px] focus:outline-none focus:border-ash-stroke font-geist text-[14px]"
                      placeholder="Scan or type barcode (e.g. 8901234567890)"
                      onChange={async (e) => {
                          const val = e.target.value;
                          setBarcode(val);
                          if(val.length >= 6) {
                              try {
                                  const res = await axios.get(`${API_BASE}/products/barcode/${val}`);
                                  if (res.data && res.data.name) {
                                      setProductName(res.data.name);
                                      if (res.data.details) setProductDetails(res.data.details);
                                  }
                              } catch (err: any) {
                                  if (err?.response?.status === 401) {
                                      console.error('Barcode lookup failed: not authenticated. Try logging out and back in.');
                                  } else if (err?.request && !err?.response) {
                                      console.error('Barcode lookup failed: no response from backend.');
                                  }
                                  // A 404 (barcode not in the mock database) is expected and ignored —
                                  // the user can still fill in the product name manually.
                              }
                          }
                      }}
                    />
                    <button type="button" onClick={() => setScanning(true)} className="bg-carbon-lift text-bone px-4 py-2 rounded-[3px] font-geist text-[14px] hover:bg-ash-stroke flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                    </button>
                </div>
              )}
           </div>
           
           <div>
              <label className="block font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Product Name</label>
              <input 
                type="text"
                required
                value={productName}
                onChange={e => setProductName(e.target.value)}
                className="w-full bg-obsidian-canvas border border-carbon-lift text-bone p-3 rounded-[3px] focus:outline-none focus:border-ash-stroke font-geist text-[14px]"
                placeholder="e.g. ABC Foods 500g Pack"
              />
           </div>
           <div>
              <label className="block font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Inspector</label>
              <input 
                type="text"
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                className="w-full bg-obsidian-canvas border border-carbon-lift text-warm-granite p-3 rounded-[3px] focus:outline-none focus:border-ash-stroke font-geist text-[14px]"
              />
           </div>
           <div>
              <label className="block font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Product Details & Specifications</label>
              <textarea 
                readOnly
                value={productDetails}
                className="w-full h-32 bg-[#050505] border border-carbon-lift text-warm-granite p-3 rounded-[3px] focus:outline-none focus:border-ash-stroke font-geist text-[13px] whitespace-pre-wrap leading-relaxed"
                placeholder="Product specifications will populate after barcode scan..."
              />
           </div>
        </div>

        {/* Image Upload / Capture */}
        <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px] space-y-6">
           <label className="block font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Package Image</label>
           
           {imageScanning ? (
             <div className="bg-obsidian-canvas border border-carbon-lift p-4 rounded-[3px]">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-geist text-[12px] text-warm-granite">Position package in frame...</span>
                  <button type="button" onClick={stopCamera} className="text-signal-orange hover:text-bone">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative w-full max-w-[600px] mx-auto overflow-hidden rounded-[3px] bg-black">
                   <video ref={videoRef} autoPlay playsInline className="w-full h-auto object-cover max-h-[400px]"></video>
                   <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                     <button type="button" onClick={captureImage} className="bg-chalk text-obsidian-canvas font-geist text-[14px] px-6 py-2 rounded-full hover:opacity-90 flex items-center shadow-lg">
                       <Aperture className="w-4 h-4 mr-2" />
                       Take Photo
                     </button>
                   </div>
                </div>
             </div>
           ) : !preview ? (
             <div className="border-2 border-dashed border-carbon-lift hover:border-ash-stroke transition-colors rounded-[10px] p-12 flex flex-col items-center justify-center text-center cursor-pointer relative group">
               <UploadCloud className="w-10 h-10 text-warm-granite mb-4 group-hover:text-bone transition-colors" />
               <p className="font-geist text-[14px] text-bone mb-1">Click to upload or drag and drop</p>
               <p className="font-geist text-[14px] text-warm-granite mb-6">JPG, PNG (Max 10MB)</p>
               
               <div className="flex space-x-4 z-10">
                 <button type="button" onClick={startCamera} className="bg-carbon-lift text-bone font-geist text-[12px] px-4 py-2 rounded-[3px] hover:bg-ash-stroke flex items-center">
                    <Camera className="w-3 h-3 mr-2" />
                    Use Camera
                 </button>
                 <label className="bg-carbon-lift text-bone font-geist text-[12px] px-4 py-2 rounded-[3px] hover:bg-ash-stroke cursor-pointer">
                    Browse Files
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                 </label>
               </div>
               {/* Hidden overlay input for drag and drop */}
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
               />
             </div>
           ) : (
             <div className="relative rounded-[10px] overflow-hidden border border-carbon-lift group">
               <img src={preview} alt="Preview" className="w-full h-auto object-cover max-h-[400px]" />
               <div className="absolute inset-0 bg-obsidian-canvas/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity space-x-4">
                  <button type="button" onClick={startCamera} className="bg-carbon-lift text-bone px-4 py-2 rounded-[3px] font-geist text-[14px] hover:bg-ash-stroke flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Retake Photo
                  </button>
                  <label className="bg-carbon-lift text-bone px-4 py-2 rounded-[3px] font-geist text-[14px] cursor-pointer hover:bg-ash-stroke">
                    Change File
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
               </div>
             </div>
           )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
           <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="bg-transparent text-bone font-geist text-[14px] px-6 py-3 border border-ash-stroke rounded-[3px] hover:text-chalk"
           >
             Cancel
           </button>
           <button 
            type="submit" 
            disabled={!productName || !file || loading}
            className="bg-chalk text-obsidian-canvas font-geist text-[14px] px-6 py-3 rounded-[3px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
           >
             {loading ? 'Processing...' : (
               <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Analyze Compliance
               </>
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
