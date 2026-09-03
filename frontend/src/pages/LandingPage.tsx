import { Link } from 'react-router-dom';
import { ShieldCheck, BarChart3, Lock, Settings, Activity, ArrowRight, Scan, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

const MOCK_ACTIVITY_HEIGHTS = [35, 60, 45, 80, 55, 90, 70, 40, 85, 95, 65, 50, 75, 88, 60, 92, 45, 78, 85, 100];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-bone font-geist selection:bg-chalk selection:text-black">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-signal-orange/20 border border-signal-orange rounded flex items-center justify-center">
              <Scan className="w-3.5 h-3.5 text-signal-orange" />
            </div>
            <span className="font-geist-mono text-[13px] font-bold tracking-[0.15em] uppercase text-bone">COMPLIANCE FACTORY</span>
          </div>
          <div className="hidden lg:flex items-center space-x-8">
            {['Overview', 'OCR Engine', 'Metrology Rules', 'Barcode GS1', 'Live Ledger', 'Documentation'].map(item => (
              <a key={item} href="#features" className="font-geist-mono text-[11px] uppercase tracking-wider text-warm-granite hover:text-bone transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="bg-bone text-black font-geist text-[12px] font-semibold px-4 py-2 rounded-[3px] hover:bg-opacity-90 transition-opacity">LOG IN</Link>
            <Link to="/inspections/new" className="hidden md:block font-geist text-[12px] text-warm-granite hover:text-bone uppercase border-l border-[#1a1a1a] pl-4">START SCAN</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-[140px] pb-[80px] max-w-[1400px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-[60px] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#161616] border border-[#2a2a2a] rounded-full">
              <span className="w-2 h-2 rounded-full bg-metric-green animate-pulse"></span>
              <span className="font-geist-mono text-[11px] text-warm-granite uppercase tracking-wider">Legal Metrology & Packaging Threat AI</span>
            </div>

            <h1 className="font-geist text-[48px] md:text-[58px] leading-[1.08] tracking-[-0.03em] font-semibold text-white">
              Food Packaging Threat Scanning & Compliance Engine
            </h1>
            <p className="font-geist text-[15px] text-warm-granite max-w-[480px] leading-relaxed">
              Automated computer vision and multi-pass OCR inspection for packaged commodities. Detect labeling violations, verify mandatory declarations, and audit packaging integrity in seconds.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <Link to="/login" className="bg-chalk text-black font-geist text-[14px] font-medium px-6 py-3 rounded-[3px] hover:bg-opacity-90 transition-opacity flex items-center">
                Launch Inspection <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/inspections" className="font-geist-mono text-[13px] text-warm-granite hover:text-bone uppercase tracking-wider border border-[#222] px-5 py-3 rounded-[3px] hover:border-ash-stroke transition-colors">
                View Ledger
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Live Inspection Simulation Card */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[10px] overflow-hidden shadow-2xl">
              <div className="h-9 bg-[#111] border-b border-[#1a1a1a] flex items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="font-geist-mono text-[11px] text-warm-granite">Live Metrology Pipeline</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111] p-4 border border-[#222] rounded-[6px]">
                    <div className="font-geist-mono text-[10px] text-warm-granite uppercase mb-1">OCR Confidence</div>
                    <div className="text-[28px] text-bone font-semibold">98.4%</div>
                    <div className="mt-2 h-[2px] bg-gradient-to-r from-blue-500 to-transparent"></div>
                  </div>
                  <div className="bg-[#111] p-4 border border-[#222] rounded-[6px]">
                    <div className="font-geist-mono text-[10px] text-warm-granite uppercase mb-1">PCR 2011 Verified</div>
                    <div className="text-[28px] text-metric-green font-semibold">6 / 6 Rules</div>
                    <div className="mt-2 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent"></div>
                  </div>
                </div>

                <div className="bg-[#111] p-4 border border-[#222] rounded-[6px] space-y-2">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="font-geist text-bone font-medium">Real-time Declaration Scanner</span>
                    <span className="font-geist-mono text-metric-green text-[11px] flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  </div>
                  <div className="h-16 flex items-end space-x-1.5 pt-2">
                    {MOCK_ACTIVITY_HEIGHTS.map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-[#252525] hover:bg-signal-orange transition-colors rounded-t-sm" 
                        style={{ height: `${h}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Surface Features */}
      <section id="features" className="py-[80px] bg-[#050505] border-y border-[#111]">
        <div className="max-w-[1200px] mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="font-geist text-[32px] font-semibold text-white">
              End-to-End Packaged Commodity Verification
            </h2>
            <p className="font-geist text-[15px] text-warm-granite max-w-[650px] mx-auto">
              Built to assist legal metrology inspectors and quality assurance teams in verifying mandatory statutory declarations and identifying package tampering.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-[8px] space-y-3">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded flex items-center justify-center">
                <Scan className="w-5 h-5" />
              </div>
              <h3 className="font-geist text-[16px] text-bone font-semibold">Ensemble OCR Engine</h3>
              <p className="font-geist text-[13px] text-warm-granite leading-relaxed">
                Combines dual-pass adaptive contrast enhancement with Tesseract neural OCR to accurately parse curved, reflective, or low-light packaging text.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-[8px] space-y-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-geist text-[16px] text-bone font-semibold">PCR 2011 Compliance Rules</h3>
              <p className="font-geist text-[13px] text-warm-granite leading-relaxed">
                Evaluates statutory declarations including Net Quantity, MRP (incl. taxes), Manufacturer/Packer address, Date of Mfg, and Consumer Helpline.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-[8px] space-y-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-geist text-[16px] text-bone font-semibold">Audit Ledger & Reports</h3>
              <p className="font-geist text-[13px] text-warm-granite leading-relaxed">
                Persists all scan evidence, confidence levels, and violation histories in PostgreSQL/SQLite with one-click printable compliance reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise / System Capabilities */}
      <section className="py-[100px] max-w-[1400px] mx-auto px-6">
        <div className="mb-12">
          <div className="font-geist-mono text-[11px] text-warm-granite uppercase tracking-wider mb-2">Capabilities</div>
          <h2 className="font-geist text-[36px] font-semibold text-white max-w-[600px] leading-tight">
            Production-grade architecture for compliance teams
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <ShieldCheck className="w-5 h-5" />, title: 'AUTHENTICATED MULTI-USER', desc: 'Secure JWT token authentication with bcrypt password hashing and role-based authorization.' },
            { icon: <BarChart3 className="w-5 h-5" />, title: 'REAL-TIME ANALYTICS', desc: 'Dynamic dashboard tracking compliance trends, severity distributions, and high-risk commodity alerts.' },
            { icon: <Lock className="w-5 h-5" />, title: 'LOCAL & CLOUD DEPLOYABLE', desc: 'Ready for local SQLite zero-config runtime, full-stack Docker Compose, or cloud hosting (Render + Neon).' },
            { icon: <Scan className="w-5 h-5" />, title: 'BARCODE & GS1 LOOKUP', desc: 'Integrated camera barcode scanner with automated product metadata and specification matching.' },
            { icon: <Settings className="w-5 h-5" />, title: 'EXTENSIBLE RULE ENGINE', desc: 'Customizable rule matrix supporting category-specific regulatory standards and threshold checks.' },
            { icon: <Activity className="w-5 h-5" />, title: 'LIVE EVIDENCE ARCHIVAL', desc: 'Full image bounding box logs and inspection image persistence for tamper-proof audits.' }
          ].map((feature, i) => (
            <div key={i} className="border border-[#1a1a1a] p-6 rounded-[8px] bg-[#0a0a0a] hover:border-ash-stroke transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-signal-orange">{feature.icon}</div>
                <h3 className="font-geist-mono text-[12px] uppercase text-bone tracking-wider font-semibold">{feature.title}</h3>
              </div>
              <p className="font-geist text-[13px] text-warm-granite leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 text-center text-warm-granite font-geist-mono text-[12px]">
        © 2026 Food Packaging Threat Scanning & Legal Metrology Inspection Platform.
      </footer>
    </div>
  );
}
