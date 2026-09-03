import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE, API_ORIGIN } from '../config';
import { FileText, AlertTriangle, AlertOctagon, CheckCircle, Info, Printer, X } from 'lucide-react';
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
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/inspections/${id}`);
      return res.data;
    }
  });

  const handleOpenReport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/reports/${id}`);
      setReportData(res.data);
      setReportModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Could not generate report.');
    }
  };

  if (isLoading) return <div className="text-warm-granite font-geist p-8">Loading inspection...</div>;
  if (!inspection) return <div className="text-signal-orange p-8">Inspection not found.</div>;

  const isCompliant = inspection.status === 'COMPLIANT';

  return (
    <div className="space-y-[40px]">
      <div className="flex justify-between items-end">
        <div>
            <div className="font-geist-mono text-[12px] uppercase text-pale-stone tracking-tight mb-2">
                Inspection • {inspection.inspection_id}
            </div>
            <h1 className="font-geist text-[40px] text-bone leading-none font-semibold">
              Result: <span className={isCompliant ? 'text-metric-green' : 'text-signal-orange'}>{inspection.status}</span>
            </h1>
        </div>
        <div className="flex space-x-4">
            <button 
              onClick={handleOpenReport} 
              className="bg-chalk text-obsidian-canvas font-geist text-[14px] font-medium px-6 py-2 rounded-[3px] flex items-center hover:opacity-90 transition-opacity"
            >
                <FileText className="w-4 h-4 mr-2" />
                View & Print Report
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-[24px]">
          {/* Image & Bounding Boxes */}
          <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px]">
              <h3 className="font-geist-mono text-[12px] uppercase text-pale-stone mb-4">Captured Evidence</h3>
              {inspection.images && inspection.images.length > 0 ? (
                  <img 
                    src={`${API_ORIGIN}${inspection.images[0].image_url}`} 
                    alt="Inspection Evidence"
                    className="w-full max-h-[460px] object-contain rounded-[3px] border border-ash-stroke bg-black" 
                  />
              ) : (
                  <div className="h-48 border border-ash-stroke flex items-center justify-center text-warm-granite font-geist">No Image Found</div>
              )}
          </div>

          {/* AI Analysis */}
          <div className="space-y-[24px]">
              <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px]">
                  <h3 className="font-geist-mono text-[12px] uppercase text-pale-stone mb-4">Compliance Score</h3>
                  <div className="text-[72px] font-geist text-bone tracking-[-2.88px] leading-none">
                      {inspection.compliance_score ?? 0}/100
                  </div>
              </div>

              <div className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px]">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-geist-mono text-[12px] uppercase text-pale-stone">Detected Declarations & Violations</h3>
                      <button 
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="text-signal-orange font-geist text-[12px] flex items-center hover:underline"
                      >
                          <Info className="w-3 h-3 mr-1" />
                          Explain Why
                      </button>
                  </div>
                  
                  {isCompliant ? (
                      <div className="text-metric-green font-geist flex items-center py-2">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          All mandatory declarations detected & compliant.
                      </div>
                  ) : inspection.violations && inspection.violations.length > 0 ? (
                      <div className="space-y-4">
                          {inspection.violations.map((v: Violation) => (
                              <div key={v.id} className="flex items-start text-bone font-geist">
                                  {v.severity === 'HIGH' || v.severity === 'CRITICAL' ? (
                                      <AlertOctagon className="w-5 h-5 text-signal-orange mr-3 shrink-0 mt-0.5" />
                                  ) : (
                                      <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                      <div className="text-[14px] text-bone font-medium">{v.message}</div>
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
                              The image was processed with OCR to extract label text, then validated against mandatory Legal Metrology declarations (Manufacturer/Packer details, Net Quantity, MRP, Month/Year of packing, Consumer Care, Country of Origin).
                          </p>
                          <p className="font-geist text-[14px] text-warm-granite mt-2">
                              <strong>Recommended Action:</strong> Verify visually against the physical package. If a flagged declaration is present on an uncaptured side, scan the additional panel.
                          </p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Official Inspection Report Modal */}
      {reportModalOpen && reportData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-ash-stroke rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 text-bone shadow-2xl">
            <div className="flex justify-between items-center border-b border-carbon-lift pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-signal-orange" />
                <h2 className="font-geist text-[18px] font-bold tracking-tight">Compliance Inspection Report</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => window.print()} 
                  className="bg-carbon-lift hover:bg-ash-stroke text-bone text-[13px] px-3 py-1.5 rounded-[3px] flex items-center transition-colors"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print / Save PDF
                </button>
                <button 
                  onClick={() => setReportModalOpen(false)} 
                  className="text-warm-granite hover:text-bone p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 font-geist text-[14px]">
              <div className="bg-[#0a0a0a] p-4 rounded-[6px] border border-carbon-lift grid grid-cols-2 gap-4">
                <div>
                  <span className="text-warm-granite text-[12px] block">Report ID</span>
                  <span className="font-geist-mono text-bone font-medium">{reportData.report_id}</span>
                </div>
                <div>
                  <span className="text-warm-granite text-[12px] block">Inspection Date</span>
                  <span className="text-bone">{reportData.inspection_details?.date}</span>
                </div>
                <div>
                  <span className="text-warm-granite text-[12px] block">Product</span>
                  <span className="text-bone">{reportData.inspection_details?.product_name}</span>
                </div>
                <div>
                  <span className="text-warm-granite text-[12px] block">Inspector</span>
                  <span className="text-bone">{reportData.inspection_details?.inspector}</span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-[6px] border border-carbon-lift flex justify-between items-center">
                <div>
                  <span className="text-warm-granite text-[12px] block">Overall Finding</span>
                  <span className={`text-[16px] font-bold ${reportData.overall_result === 'COMPLIANT' ? 'text-metric-green' : 'text-signal-orange'}`}>
                    {reportData.overall_result}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-warm-granite text-[12px] block">Compliance Score</span>
                  <span className="text-[20px] font-bold text-bone">{reportData.compliance_score ?? 0}/100</span>
                </div>
              </div>

              <div>
                <h4 className="font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Findings & Violations</h4>
                {reportData.violations?.length === 0 ? (
                  <p className="text-metric-green text-[13px] bg-metric-green/10 p-3 rounded border border-metric-green/20">
                    No violations detected. Product meets all verified packaged commodity guidelines.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reportData.violations.map((v: any, idx: number) => (
                      <div key={idx} className="bg-[#0a0a0a] border border-carbon-lift p-3 rounded text-[13px] space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-bone">{v.message}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-geist-mono ${v.severity === 'HIGH' ? 'bg-signal-orange/20 text-signal-orange' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {v.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-warm-granite">Rule ID: {v.rule_id} • Status: {v.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[12px] text-warm-granite italic pt-2 border-t border-carbon-lift">
                {reportData.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
