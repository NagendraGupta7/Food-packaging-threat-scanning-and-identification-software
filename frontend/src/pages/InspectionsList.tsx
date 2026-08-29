import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';


export default function InspectionsList() {
  const navigate = useNavigate();

  const { data: inspections, isLoading } = useQuery({
    queryKey: ['inspections_list'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/inspections/`);
      return res.data;
    },
    refetchInterval: 5000 // Refresh every 5 seconds for live updates
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-[40px]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-geist text-[32px] text-bone tracking-tight">Inspections Ledger</h1>
          <p className="font-geist text-[14px] text-warm-granite mt-2">
            Live feed of all package scans, complaints, and AI resolution steps.
          </p>
        </div>
        <Link 
          to="/inspections/new"
          className="bg-chalk text-obsidian-canvas font-geist text-[14px] px-6 py-3 rounded-[3px] hover:opacity-90 transition-opacity flex items-center"
        >
          <Clock className="w-4 h-4 mr-2" />
          New Scan
        </Link>
      </div>

      <div className="bg-[#0d0d0d] border border-carbon-lift rounded-[10px] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-carbon-lift bg-obsidian-canvas/50">
              <th className="p-4 font-geist-mono text-[12px] uppercase text-pale-stone font-normal tracking-wider">Date & Time</th>
              <th className="p-4 font-geist-mono text-[12px] uppercase text-pale-stone font-normal tracking-wider">Product Name</th>
              <th className="p-4 font-geist-mono text-[12px] uppercase text-pale-stone font-normal tracking-wider">Type of Complaint</th>
              <th className="p-4 font-geist-mono text-[12px] uppercase text-pale-stone font-normal tracking-wider">How to Clear</th>
              <th className="p-4 font-geist-mono text-[12px] uppercase text-pale-stone font-normal tracking-wider text-right">AI Resolution</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-warm-granite font-geist text-[14px]">Loading ledger data...</td>
              </tr>
            ) : inspections?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-warm-granite font-geist text-[14px]">No inspections recorded yet. Start a new scan.</td>
              </tr>
            ) : (
              inspections?.map((inspection: any) => {
                const isCompliant = inspection.status === "COMPLIANT";
                return (
                  <tr key={inspection.id} onClick={() => navigate(`/inspections/${inspection.id}`)} className="border-b border-carbon-lift hover:bg-carbon-lift/30 cursor-pointer transition-colors group">
                    <td className="p-4">
                      <div className="font-geist-mono text-[14px] text-bone">
                        {new Date(inspection.created_at).toLocaleDateString()}
                      </div>
                      <div className="font-geist-mono text-[12px] text-warm-granite mt-1">
                        {new Date(inspection.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-geist text-[15px] text-bone font-medium">{inspection.product?.name || "Unknown Product"}</div>
                      <div className="font-geist-mono text-[12px] text-warm-granite mt-1">{inspection.inspection_id}</div>
                    </td>
                    <td className="p-4">
                      {isCompliant ? (
                        <div className="inline-flex items-center px-2 py-1 rounded-[3px] bg-metric-green/10 text-metric-green border border-metric-green/20 font-geist text-[12px]">
                          <CheckCircle className="w-3 h-3 mr-1" /> No Complaints
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2 py-1 rounded-[3px] bg-signal-orange/10 text-signal-orange border border-signal-orange/20 font-geist text-[12px]">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Labeling Violation
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                       <span className="font-geist text-[13px] text-warm-granite">
                          {isCompliant ? "N/A - Product Passed" : "Requires packaging redesign & re-scan"}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="inline-flex items-center text-sky-400 group-hover:text-bone transition-colors font-geist text-[13px] font-medium">
                         <Info className="w-4 h-4 mr-1" /> View AI Breakdown
                       </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
