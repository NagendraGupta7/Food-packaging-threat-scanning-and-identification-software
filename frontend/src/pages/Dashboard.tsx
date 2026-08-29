import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE } from '../config';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie
} from 'recharts';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';


export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/dashboard/`);
      return res.data;
    },
    refetchInterval: 5000
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <div>
        <h1 className="font-geist text-[24px] text-bone font-semibold tracking-tight">Dashboard Overview</h1>
        <p className="font-geist text-[14px] text-warm-granite mt-1">Real-time metrics and inspection status</p>
      </div>

      {/* 6 Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Inspections', value: stats?.total_inspections, icon: <ClipboardCheck className="w-6 h-6 text-blue-400" /> },
          { label: 'Compliant', value: stats?.compliant, icon: <CheckCircle2 className="w-6 h-6 text-green-500" /> },
          { label: 'Non-Compliant', value: stats?.non_compliant, icon: <XCircle className="w-6 h-6 text-red-500" /> },
          { label: 'Needs Review', value: stats?.needs_review, icon: <Clock className="w-6 h-6 text-gray-400" /> },
          { label: 'High Risk', value: stats?.high_risk, icon: <AlertCircle className="w-6 h-6 text-red-600" /> },
          { label: 'Open Violations', value: stats?.open_violations, icon: <AlertTriangle className="w-6 h-6 text-yellow-500" /> },
        ].map((metric, i) => (
          <div key={i} className="bg-[#0d0d0d] border border-carbon-lift p-4 rounded-[8px] flex flex-col items-center text-center">
            <div className="mb-2">{metric.icon}</div>
            <div className="font-geist text-[12px] text-warm-granite mb-1">{metric.label}</div>
            <div className="font-geist text-[24px] text-bone font-bold">
              {isLoading ? '...' : metric.value || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-[#0d0d0d] border border-carbon-lift p-6 rounded-[8px]">
           <h3 className="font-geist text-[14px] font-medium text-bone mb-6">Compliance Trend (7 Days)</h3>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.compliance_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#0d0d0d] border border-carbon-lift p-6 rounded-[8px]">
           <h3 className="font-geist text-[14px] font-medium text-bone mb-6">Violations by Severity</h3>
           <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.violations_severity || []} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} cursor={{ fill: '#222' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(stats?.violations_severity || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Row 2: Table and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-[#0d0d0d] border border-carbon-lift p-6 rounded-[8px]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-geist text-[14px] font-medium text-bone">Recent Inspections</h3>
             <a href="/inspections" className="text-sky-400 text-[12px] hover:underline">View all</a>
           </div>
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-carbon-lift">
                 <th className="pb-2 font-geist text-[12px] text-warm-granite font-normal">Inspection ID</th>
                 <th className="pb-2 font-geist text-[12px] text-warm-granite font-normal">Product</th>
                 <th className="pb-2 font-geist text-[12px] text-warm-granite font-normal">Status</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td className="py-3 font-geist-mono text-[12px] text-bone border-b border-carbon-lift">INS-20260826044916</td>
                 <td className="py-3 font-geist text-[12px] text-bone border-b border-carbon-lift">Premium Snacks Pack</td>
                 <td className="py-3 font-geist text-[12px] border-b border-carbon-lift text-signal-orange">Non-Compliant</td>
               </tr>
               <tr>
                 <td className="py-3 font-geist-mono text-[12px] text-bone border-b border-carbon-lift">INS-20260826041122</td>
                 <td className="py-3 font-geist text-[12px] text-bone border-b border-carbon-lift">Beverage Pack 500ml</td>
                 <td className="py-3 font-geist text-[12px] border-b border-carbon-lift text-metric-green">Compliant</td>
               </tr>
             </tbody>
           </table>
        </div>

        {/* Pie Chart */}
        <div className="bg-[#0d0d0d] border border-carbon-lift p-6 rounded-[8px]">
           <h3 className="font-geist text-[14px] font-medium text-bone mb-4">Category Breakdown</h3>
           <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.category_breakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {(stats?.category_breakdown || []).map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][index % 4]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-[20px] font-bold text-bone">{isLoading ? 0 : 100}%</span>
                 <span className="text-[10px] text-warm-granite">Scanned</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
