import { Link } from 'react-router-dom';
import { Terminal, Shield, BarChart3, Lock, Settings, Activity, ArrowRight, Monitor, Smartphone, MessageSquare, Layout } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-bone font-geist selection:bg-chalk selection:text-black">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-[14px] h-[14px] bg-transparent border-[2px] border-bone rounded-sm flex items-center justify-center">
              <div className="w-[4px] h-[4px] bg-bone rounded-full"></div>
            </div>
            <span className="font-geist-mono text-[13px] font-bold tracking-[0.2em] uppercase">FACTORY</span>
          </div>
          <div className="hidden lg:flex items-center space-x-8">
            {['Product', 'Enterprise', 'Pricing', 'News', 'Company', 'Careers', 'Docs'].map(item => (
              <a key={item} href="#" className="font-geist-mono text-[11px] uppercase tracking-wider text-warm-granite hover:text-bone transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="bg-bone text-black font-geist text-[12px] font-medium px-4 py-2 hover:bg-opacity-90 transition-opacity">LOG IN</Link>
            <a href="#" className="hidden md:block font-geist text-[12px] text-warm-granite hover:text-bone uppercase border-l border-[#1a1a1a] pl-4">CONTACT SALES</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-[160px] pb-[100px] max-w-[1400px] mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-[60px] items-center">
          <div className="space-y-8">
            <h1 className="font-geist text-[64px] leading-[1.05] tracking-[-0.03em] font-medium text-white max-w-[500px]">
              Build Your Software Factory
            </h1>
            <p className="font-geist-mono text-[14px] text-warm-granite max-w-[400px] leading-relaxed">
              A self-improving system for your SDLC. Ingest continuous signals and deploy production software.
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="bg-bone text-black font-geist text-[14px] font-medium px-6 py-3 hover:bg-opacity-90 transition-opacity">DOWNLOAD</Link>
              <a href="#" className="font-geist-mono text-[13px] text-warm-granite hover:text-bone uppercase tracking-wider flex items-center group">
                CONTACT SALES <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
          <div className="relative">
            {/* Mock Dashboard UI */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[8px] overflow-hidden shadow-2xl">
              <div className="h-8 bg-[#111] border-b border-[#1a1a1a] flex items-center px-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-[#111] p-4 border border-[#222] rounded-[4px]">
                  <div className="font-geist-mono text-[10px] text-warm-granite uppercase mb-2">Total Inspections</div>
                  <div className="text-[32px] text-bone">198</div>
                  <div className="mt-2 h-[2px] bg-gradient-to-r from-blue-500 to-transparent"></div>
                </div>
                <div className="bg-[#111] p-4 border border-[#222] rounded-[4px]">
                  <div className="font-geist-mono text-[10px] text-warm-granite uppercase mb-2">Violations</div>
                  <div className="text-[32px] text-bone">147</div>
                  <div className="mt-2 h-[2px] bg-gradient-to-r from-red-500 to-transparent"></div>
                </div>
                <div className="bg-[#111] p-4 border border-[#222] rounded-[4px] col-span-2">
                   <div className="font-geist-mono text-[10px] text-warm-granite uppercase mb-2">Live Activity</div>
                   <div className="h-20 flex items-end space-x-1">
                     {[...Array(20)].map((_, i) => (
                       <div key={i} className="flex-1 bg-[#333] hover:bg-[#555] transition-colors" style={{ height: `${Math.random() * 100}%` }}></div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Surface Tabs */}
      <section className="py-[120px] bg-[#050505] border-y border-[#111]">
        <div className="max-w-[1000px] mx-auto px-6 text-center space-y-8">
          <h2 className="font-geist text-[32px] font-medium text-white max-w-[600px] mx-auto leading-tight">
            One platform, every surface your team works on.
          </h2>
          <p className="font-geist-mono text-[14px] text-warm-granite max-w-[600px] mx-auto">
            Droids ship from your desktop, browser, mobile device, terminal, or pipeline. Analytics and Agent Readiness close the loop on what is working and what is blocking.
          </p>
          <div className="flex justify-center space-x-8 pt-8">
            <div className="flex items-center text-warm-granite hover:text-bone cursor-pointer transition-colors"><Monitor className="w-4 h-4 mr-2"/> Desktop</div>
            <div className="flex items-center text-bone border-b-2 border-bone pb-1 cursor-pointer"><Smartphone className="w-4 h-4 mr-2"/> Web / Mobile</div>
            <div className="flex items-center text-warm-granite hover:text-bone cursor-pointer transition-colors"><MessageSquare className="w-4 h-4 mr-2"/> Slack</div>
            <div className="flex items-center text-warm-granite hover:text-bone cursor-pointer transition-colors"><Layout className="w-4 h-4 mr-2"/> Jira</div>
          </div>
          
          <div className="mt-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-[8px] h-[500px] flex items-center justify-center">
             <div className="text-warm-granite font-geist-mono text-[12px]">Web UI Preview</div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-[120px] max-w-[1400px] mx-auto px-6">
        <div className="mb-16">
          <div className="font-geist-mono text-[11px] text-warm-granite uppercase tracking-wider mb-4">Features</div>
          <h2 className="font-geist text-[40px] font-medium text-white max-w-[500px] leading-tight">
            Build for the enterprise from day one
          </h2>
          <p className="font-geist text-[16px] text-warm-granite mt-4 max-w-[600px]">
            Security, compliance, and control aren't afterthoughts. Every feature ships enterprise-ready.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Shield />, title: 'FULLY AIR-GAPPED', desc: 'Deploy entirely on your infrastructure with zero internet dependency' },
            { icon: <BarChart3 />, title: 'RICH ANALYTICS', desc: 'Deep visibility into agent performance, code quality, and team adoption' },
            { icon: <Lock />, title: 'SAML / IDP INTEGRATION', desc: 'Enterprise SSO with SAML 2.0, OIDC, and directory sync' },
            { icon: <Terminal />, title: 'COST CONTROLS', desc: 'Set per-team and per-project token budgets with real-time tracking' },
            { icon: <Settings />, title: 'CENTRALIZED ORG CONFIG', desc: 'Manage skills, permissions, model routing, and policies from one pane' },
            { icon: <Activity />, title: 'OTEL NATIVE', desc: 'First-class OpenTelemetry support out of the box' }
          ].map((feature, i) => (
            <div key={i} className="border border-[#1a1a1a] p-8 rounded-[4px] hover:bg-[#050505] transition-colors cursor-pointer group">
              <div className="flex items-center space-x-3 mb-6">
                <div className="text-warm-granite group-hover:text-bone transition-colors">{feature.icon}</div>
                <h3 className="font-geist-mono text-[12px] uppercase text-bone tracking-wider">{feature.title}</h3>
              </div>
              <p className="font-geist text-[14px] text-warm-granite leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-12 text-center text-warm-granite font-geist-mono text-[12px]">
        © 2026 FACTORY INC. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
