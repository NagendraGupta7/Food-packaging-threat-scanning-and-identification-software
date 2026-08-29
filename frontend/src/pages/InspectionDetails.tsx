import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE } from '../config';
import { FileText, AlertTriangle, AlertOctagon, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';


interface Violation {
  id: number;
  rule_id: string;
  field?: string | null;
  status: string;
  severity: string;
  message: string;
  confidence?: number | null;
}

export default function InspectionDetails() {
  const { id } = useParams();
  const [showExplanation, setShowExplanation] = useState(false);

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/inspections/${id}`);
      return res.data;
    }
  });

  const handleDownloadReport = async () => {
      const res = await axios.get(`${API_BASE}/reports/${id}`);
      console.log(res.data);
      alert(`Report generated: ${res.data.title}\nScore: ${res.data.compliance_score}\n(In production, this would trigger a PDF download)`);
  };

  if (isLoading) return <div className="text-warm-granite font-geist p-8">Loading...</div>;
  if (!inspection) return <div className="text-signal-orange p-8">Inspection not found.</div>;

  return (
    <div className="space-y-[40px]">
      <div className="flex justify-between items-end">
        <div>
            <div className="font-geist-mono text-[12px] uppercase text-pale-stone tracking-tight mb-2">
                Inspection • {inspection.inspection_id}
            </div>
            <h1 className="font-geist text-[44px] text-bone leading-none">Result: {inspection.status}</h1>
        </div>
        <div className="flex space-x-4">
            <button onClick={handleDownloadReport} className="bg-transparent text-bone border border-ash-stroke font-geist text-[14px] px-6 py-2 flex items-center hover:text-chalk">
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-[24px]">
          {/* Image & Bounding Boxes */}
          <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px]">
              <h3 className="font-geist-mono text-[12px] uppercase text-pale-stone mb-4">Captured Evidence</h3>
              {inspection.images && inspection.images.length > 0 ? (
                  <img src={`http://localhost:8000${inspection.images[0].image_url}`} className="w-full rounded-[3px] border border-ash-stroke" />
              ) : (
                  <div className="h-48 border border-ash-stroke flex items-center justify-center text-warm-granite font-geist">No Image Found</div>
              )}
          </div>

          {/* AI Analysis */}
          <div className="space-y-[24px]">
              <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px]">
                  <h3 className="font-geist-mono text-[12px] uppercase text-pale-stone mb-4">Compliance Score</h3>
                  <div className="text-[72px] font-geist text-bone tracking-[-2.88px] leading-none">
                      {inspection.compliance_score}/100
                  </div>
              </div>

              <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px]">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-geist-mono text-[12px] uppercase text-pale-stone">Detected Violations</h3>
                      <button 
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="text-signal-orange font-geist text-[12px] flex items-center hover:underline"
                      >
                          <Info className="w-3 h-3 mr-1" />
                          Explain Why
                      </button>
                  </div>
                  
                  {inspection.status === 'COMPLIANT' ? (
                      <div className="text-metric-green font-geist flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          No violations detected.
                      </div>
                  ) : inspection.violations && inspection.violations.length > 0 ? (
                      <div className="space-y-4">
                          {inspection.violations.map((v: Violation) => (
                              <div key={v.id} className="flex items-start text-bone font-geist">
                                  {v.severity === 'HIGH' || v.severity === 'CRITICAL' ? (
                                      <AlertOctagon className="w-5 h-5 text-signal-orange mr-3 shrink-0 mt-0.5" />
                                  ) : (
                                      <AlertTriangle className="w-5 h-5 text-warm-granite mr-3 shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                      <div className="text-[14px]">{v.message}</div>
                                      <div className="text-[12px] text-warm-granite mt-1">
                                          Rule ID: {v.rule_id} • Severity: {v.severity}
                                          {typeof v.confidence === 'number' && ` • Confidence: ${Math.round(v.confidence * 100)}%`}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-warm-granite font-geist text-[14px]">
                          Awaiting analysis, or no declaration issues were flagged.
                      </div>
                  )}

                  {showExplanation && (
                      <div className="mt-6 p-4 border border-ash-stroke bg-obsidian-canvas rounded-[3px] space-y-2">
                          <div className="font-geist-mono text-[12px] text-pale-stone uppercase">How this was determined</div>
                          <p className="font-geist text-[14px] text-bone">
                              The image was processed with OCR to extract label text, then checked against the required
                              Legal Metrology declarations (manufacturer, net quantity, MRP, packing date, consumer care,
                              country of origin). A declaration is marked as a violation when it could not be confidently
                              located in the extracted text.
                          </p>
                          <p className="font-geist text-[14px] text-warm-granite mt-2">
                              <strong>Recommended Action:</strong> Verify visually against the physical package. If a
                              flagged declaration is present but on another panel, capture and upload an additional image.
                          </p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
