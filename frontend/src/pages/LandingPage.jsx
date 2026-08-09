import React, { useState } from 'react';
import {
  Sparkles, Eye, Bot, Users, CheckCircle2, ArrowRight, Play,
  Building2, Calendar, MapPin, AlertTriangle, FileCheck, Award,
  Clock, Check, Star, ChevronDown, X, CheckCircle,
  TrendingUp, Zap, Activity, ListChecks, Globe
} from 'lucide-react';
import heroTeamImg from '../assets/hero_team.png';

// Exact auraForcz logo mark & text matching mockup
export function AuraLogo({ className = "w-9 h-9", textClassName = "text-2xl font-black" }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Logo Mark: 4 spiraling curved vanes forming a circle */}
      <div className={`relative ${className} flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Top Cyan Vane */}
          <path d="M50 10 C68 10 82 22 86 38 C87 44 82 48 76 45 C67 40 60 30 50 24 C40 18 30 17 22 22 C30 14 40 10 50 10 Z" fill="#00b4d8" />
          {/* Right Pink Vane */}
          <path d="M90 50 C90 68 78 82 62 86 C56 87 52 82 55 76 C60 67 70 60 76 50 C82 40 83 30 78 22 C86 30 90 40 90 50 Z" fill="#ec4899" />
          {/* Bottom Orange Vane */}
          <path d="M50 90 C32 90 18 78 14 62 C13 56 18 52 24 55 C33 60 40 70 50 76 C60 82 70 83 78 78 C70 86 60 90 50 90 Z" fill="#f97316" />
          {/* Left Purple Vane */}
          <path d="M10 50 C10 32 22 18 38 14 C44 13 48 18 45 24 C40 33 30 40 24 50 C18 60 17 70 22 78 C14 70 10 60 10 50 Z" fill="#8b5cf6" />
          {/* Inner ring */}
          <circle cx="50" cy="50" r="16" fill="#ffffff" />
          <circle cx="50" cy="50" r="7" fill="#4f46e5" />
        </svg>
      </div>
      <span className={`${textClassName} tracking-tight font-extrabold flex items-center`}>
        <span className="text-[#0d1527]">aura</span>
        <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">Forcz</span>
      </span>
    </div>
  );
}

function Stars({ n = 5 }) {
  return (
    <span style={{display:'flex'}}>
      {Array.from({length:5}).map((_,i) => (
        <Star key={i} className="w-3 h-3" style={{color:i<n?'#fbbf24':'#cbd5e1',fill:i<n?'#fbbf24':'#cbd5e1'}} />
      ))}
    </span>
  );
}

export default function LandingPage({ onLoginClick }) {
  const [activeNav, setActiveNav] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setForm({ name: '', email: '', company: '', phone: '' });
    }, 2500);
  };

  const navItems = [
    { label: 'Product',   key: 'product',   items: ['Task Automation','AI Insights','Scheduling Engine','Analytics'] },
    { label: 'Features',  key: 'features',  items: ['Intelligent Task Mgmt','Smart Scheduling','Real-time Tracking','Incident Mgmt'] },
    { label: 'Solutions', key: 'solutions', items: ['Housekeeping','Caretaking','Facility Mgmt','Property Mgmt'] },
    { label: 'Resources', key: 'resources', items: ['Blog','Case Studies','Help Center','Webinars'] },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{fontFamily:'Inter,Segoe UI,sans-serif'}}>

      {/* HEADER */}
      <header style={{position:'sticky',top:0,zIndex:50,background:'rgba(255,255,255,0.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid #f1f5f9',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" style={{height:'64px'}}>
          <div className="flex items-center gap-8">
            <AuraLogo />
            <nav className="hidden lg:flex items-center gap-6" style={{fontSize:'13px',fontWeight:600,color:'#475569'}}>
              {navItems.map(n => (
                <div key={n.key} style={{position:'relative'}} onMouseEnter={() => setActiveNav(n.key)} onMouseLeave={() => setActiveNav(null)}>
                  <button className="flex items-center gap-1 py-2" style={{color:activeNav===n.key?'#7c3aed':'#475569',background:'none',border:'none',cursor:'pointer',fontWeight:600,fontSize:'13px'}}>
                    {n.label} <ChevronDown className="w-3.5 h-3.5" style={{opacity:.6,transition:'transform .2s',transform:activeNav===n.key?'rotate(180deg)':'none'}} />
                  </button>
                  {activeNav === n.key && (
                    <div style={{position:'absolute',top:'100%',left:0,width:'200px',background:'#fff',borderRadius:'16px',boxShadow:'0 8px 30px rgba(0,0,0,0.12)',border:'1px solid #f1f5f9',padding:'8px',zIndex:100}}>
                      {n.items.map(item => (
                        <a key={item} href="#" style={{display:'block',padding:'8px 12px',borderRadius:'12px',fontSize:'12px',fontWeight:600,color:'#334155',textDecoration:'none'}}
                          onMouseEnter={e=>e.currentTarget.style.background='#f5f3ff'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          {item}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <a href="#" style={{color:'#475569',textDecoration:'none'}}>Pricing</a>
              <a href="#" style={{color:'#475569',textDecoration:'none'}}>About Us</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLoginClick} style={{padding:'8px 20px',borderRadius:'99px',fontSize:'13px',fontWeight:600,color:'#334155',background:'#fff',border:'1.5px solid #cbd5e1',cursor:'pointer'}}>Login</button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5" style={{padding:'8px 20px',borderRadius:'99px',fontSize:'13px',fontWeight:700,color:'#fff',background:'linear-gradient(to right,#7c3aed,#ec4899)',border:'none',cursor:'pointer',boxShadow:'0 4px 14px rgba(124,58,237,.3)'}}>
              Request Demo <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{background:'linear-gradient(135deg,#fafbff 0%,#fff 50%,#fdf4ff 100%)',paddingTop:'40px',paddingBottom:0,overflow:'hidden'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{display:'grid',gridTemplateColumns:'5fr 7fr',gap:'32px',alignItems:'center',minHeight:'520px'}}>

            {/* LEFT COPY */}
            <div style={{display:'flex',flexDirection:'column',gap:'28px',zIndex:10,position:'relative',paddingBottom:'40px'}}>
              <div>
                <h1 style={{fontSize:'clamp(36px,4.2vw,56px)',fontWeight:900,lineHeight:1.08,letterSpacing:'-0.02em',color:'#0d1527',margin:0}}>
                  Smarter Tasks.<br/>
                  Stronger Teams.<br/>
                  <span style={{background:'linear-gradient(to right,#7c3aed,#4f46e5,#ec4899)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Better Every Day.</span>
                </h1>
                <p style={{color:'#64748b',fontSize:'15px',lineHeight:1.65,marginTop:'16px',maxWidth:'440px'}}>
                  AuraForcz empowers organizations to manage housekeeping and caretaking operations with intelligent task assignment, scheduling and AI-driven insights.
                </p>
              </div>
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2" style={{padding:'13px 28px',borderRadius:'99px',fontSize:'15px',fontWeight:700,color:'#fff',background:'linear-gradient(to right,#7c3aed,#ec4899)',border:'none',cursor:'pointer',boxShadow:'0 6px 20px rgba(124,58,237,.35)'}}>
                  Request Demo <ArrowRight className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2" style={{padding:'13px 24px',borderRadius:'99px',fontSize:'15px',fontWeight:600,color:'#334155',background:'#fff',border:'1.5px solid #e2e8f0',cursor:'pointer'}}>
                  Explore Platform
                  <span style={{width:'26px',height:'26px',borderRadius:'50%',background:'#f5f3ff',border:'1px solid #ede9fe',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Play className="w-2.5 h-2.5" style={{fill:'#7c3aed',color:'#7c3aed',marginLeft:'2px'}} />
                  </span>
                </button>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'8px',paddingTop:'12px',borderTop:'1px solid #f1f5f9'}}>
                {[
                  {icon:<Sparkles className="w-3.5 h-3.5" style={{color:'#7c3aed'}} />, label:'AI Powered'},
                  {icon:<Eye className="w-3.5 h-3.5" style={{color:'#06b6d4'}} />, label:'Real-time Visibility'},
                  {icon:<Zap className="w-3.5 h-3.5" style={{color:'#ec4899'}} />, label:'Smart Automation'},
                  {icon:<Users className="w-3.5 h-3.5" style={{color:'#6366f1'}} />, label:'People First'},
                ].map(b => (
                  <span key={b.label} className="flex items-center gap-1.5" style={{fontSize:'11px',fontWeight:600,color:'#475569',background:'#fff',border:'1px solid #e2e8f0',borderRadius:'99px',padding:'6px 12px'}}>
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT VISUAL STACK */}
            <div style={{position:'relative',height:'520px'}}>

              {/* Dashboard window – background */}
              <div style={{position:'absolute',top:'12px',right:0,width:'540px',background:'#fff',borderRadius:'16px',boxShadow:'0 20px 60px rgba(0,0,0,0.12)',border:'1px solid #e2e8f0',overflow:'hidden',zIndex:1}}>
                <div style={{display:'flex',alignItems:'center',height:'28px',background:'#f8fafc',borderBottom:'1px solid #e2e8f0',padding:'0 12px',gap:'6px'}}>
                  <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#f87171'}} />
                  <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#fbbf24'}} />
                  <span style={{width:'10px',height:'10px',borderRadius:'50%',background:'#34d399'}} />
                  <span style={{marginLeft:'8px',fontSize:'9px',color:'#94a3b8',fontWeight:500}}>auraForcz — Dashboard Overview</span>
                </div>
                <div style={{display:'flex'}}>
                  <div style={{width:'88px',background:'#090e1a',padding:'10px',color:'#fff',flexShrink:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:'4px',marginBottom:'10px'}}>
                      <div style={{width:'16px',height:'16px',borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#ec4899)'}} />
                      <span style={{fontSize:'7px',fontWeight:'bold',color:'#fff'}}>auraForcz</span>
                    </div>
                    {['Dashboard','Tasks','Schedules','Attendance','Reports'].map((s,i) => (
                      <div key={s} style={{padding:'4px 6px',borderRadius:'6px',fontSize:'8px',fontWeight:500,color:i===0?'#fff':'#64748b',background:i===0?'#7c3aed':'transparent',marginBottom:'2px'}}>{s}</div>
                    ))}
                  </div>
                  <div style={{flex:1,padding:'12px',background:'#f8fafc',display:'flex',flexDirection:'column',gap:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:'11px',fontWeight:'bold',color:'#0f172a'}}>Dashboard Overview</span>
                      <span style={{fontSize:'8px',background:'#ecfdf5',color:'#059669',fontWeight:600,padding:'2px 8px',borderRadius:'99px',border:'1px solid #a7f3d0'}}>Live Feed</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
                      {[
                        {l:'Total Tasks',v:'1,248',sub:'↑ +11.5%',sc:'#059669'},
                        {l:'Completed',  v:'876',  sub:'+13.3%', sc:'#059669'},
                        {l:'In Progress',v:'234',  sub:'+4.1%',  sc:'#d97706'},
                        {l:'Yet to Start',v:'138', sub:'-2.8%',  sc:'#dc2626'},
                      ].map(m => (
                        <div key={m.l} style={{background:'#fff',borderRadius:'10px',padding:'8px 4px',border:'1px solid #f1f5f9',textAlign:'center'}}>
                          <div style={{fontSize:'7px',color:'#94a3b8',fontWeight:500}}>{m.l}</div>
                          <div style={{fontSize:'14px',fontWeight:900,color:'#0f172a'}}>{m.v}</div>
                          <div style={{fontSize:'7px',fontWeight:700,color:m.sc}}>{m.sub}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                      <div style={{background:'#fff',borderRadius:'10px',padding:'8px',border:'1px solid #f1f5f9'}}>
                        <div style={{fontSize:'8px',fontWeight:'bold',color:'#334155',marginBottom:'6px'}}>Task Status</div>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <div style={{position:'relative',width:'40px',height:'40px',flexShrink:0}}>
                            <svg viewBox="0 0 36 36" style={{width:'40px',height:'40px',transform:'rotate(-90deg)'}}>
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="65 35" />
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-65" />
                              <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-85" />
                            </svg>
                            <span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'7px',fontWeight:900,color:'#0f172a'}}>85%</span>
                          </div>
                          <div style={{fontSize:'7px',display:'flex',flexDirection:'column',gap:'3px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#10b981',flexShrink:0}} />Completed 70%</div>
                            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#3b82f6',flexShrink:0}} />In Progress 18%</div>
                            <div style={{display:'flex',alignItems:'center',gap:'4px'}}><span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#f59e0b',flexShrink:0}} />Yet to Start 12%</div>
                          </div>
                        </div>
                      </div>
                      <div style={{background:'#fff',borderRadius:'10px',padding:'8px',border:'1px solid #f1f5f9'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                          <span style={{fontSize:'8px',fontWeight:'bold',color:'#334155'}}>Today's Schedule</span>
                          <span style={{fontSize:'7px',color:'#7c3aed',fontWeight:600,cursor:'pointer'}}>View all</span>
                        </div>
                        {[{n:'Lobby Cleaning',s:'In Progress',bg:'#fffbeb',c:'#92400e'},{n:'Bedroom Sanit.',s:'Completed',bg:'#ecfdf5',c:'#065f46'},{n:'Floor Sweeping',s:'In Progress',bg:'#fffbeb',c:'#92400e'}].map(t => (
                          <div key={t.n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'7px',marginBottom:'3px'}}>
                            <span style={{color:'#334155',fontWeight:500}}>{t.n}</span>
                            <span style={{padding:'1px 5px',borderRadius:'4px',fontWeight:600,background:t.bg,color:t.c,fontSize:'6px'}}>{t.s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Housekeepers photo – foreground */}
              <div style={{position:'absolute',bottom:0,left:'20px',zIndex:10,pointerEvents:'none'}}>
                <img src={heroTeamImg} alt="AuraForcz housekeeping team"
                  style={{height:'460px',objectFit:'contain',objectPosition:'bottom',filter:'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'}} />
              </div>

              {/* Smartphone – right foreground */}
              <div style={{position:'absolute',bottom:0,right:0,zIndex:20,width:'176px'}}>
                <div style={{background:'#0d1117',borderRadius:'24px',padding:'12px',boxShadow:'0 20px 60px rgba(0,0,0,0.35)',border:'4px solid #1e2530',color:'#fff'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #1e2530',paddingBottom:'6px',marginBottom:'8px'}}>
                    <span style={{fontSize:'9px',fontWeight:'bold',display:'flex',alignItems:'center',gap:'4px'}}>
                      <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#34d399',display:'inline-block'}} />My Tasks
                    </span>
                    <span style={{fontSize:'8px',color:'#64748b'}}>Today</span>
                  </div>
                  {[
                    {t:'Lobby Cleaning', time:'9:00 AM', s:'In Progress',bg:'rgba(59,130,246,.2)',c:'#93c5fd'},
                    {t:'Restroom Sanit.',time:'10:30 AM',s:'Completed',  bg:'rgba(16,185,129,.2)',c:'#6ee7b7'},
                    {t:'Pantry Cleaning',time:'11:30 AM',s:'Pending',    bg:'rgba(245,158,11,.2)', c:'#fcd34d'},
                    {t:'Waste Collect.', time:'1:00 PM', s:'In Progress',bg:'rgba(59,130,246,.2)',c:'#93c5fd'},
                  ].map(t => (
                    <div key={t.t} style={{background:'#1a2332',borderRadius:'8px',padding:'6px 8px',marginBottom:'5px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontSize:'7.5px',fontWeight:600,color:'#fff'}}>{t.t}</div>
                        <div style={{fontSize:'7px',color:'#64748b'}}>{t.time}</div>
                      </div>
                      <span style={{fontSize:'6.5px',fontWeight:700,padding:'2px 5px',borderRadius:'4px',background:t.bg,color:t.c}}>{t.s}</span>
                    </div>
                  ))}
                  <div style={{background:'linear-gradient(to right,rgba(124,58,237,.5),rgba(79,70,229,.5))',border:'1px solid rgba(124,58,237,.3)',borderRadius:'10px',padding:'8px',marginTop:'6px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'7px',fontWeight:'bold',color:'#c4b5fd',marginBottom:'4px'}}>
                      <Sparkles className="w-2.5 h-2.5" /> AI Recommendation
                    </div>
                    <p style={{fontSize:'7px',color:'#cbd5e1',lineHeight:1.4,margin:0}}>
                      Assign Pantry cleaning to <strong style={{color:'#fff'}}>Priya S.</strong> based on skills, punctuality & proximity.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. Stat Counter Bar (Full width gradient strip) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="rounded-2xl bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] via-[#ec4899] to-[#f97316] p-6 sm:p-7 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            
            <div className="pt-2 md:pt-0">
              <div className="flex justify-center mb-1">
                <Building2 className="w-5 h-5 text-white/90" />
              </div>
              <div className="text-2xl sm:text-3xl font-black">500+</div>
              <div className="text-xs text-purple-100 font-semibold mt-0.5">Organizations</div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="flex justify-center mb-1">
                <FileCheck className="w-5 h-5 text-white/90" />
              </div>
              <div className="text-2xl sm:text-3xl font-black">25,000+</div>
              <div className="text-xs text-purple-100 font-semibold mt-0.5">Tasks Completed Daily</div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="flex justify-center mb-1">
                <MapPin className="w-5 h-5 text-white/90" />
              </div>
              <div className="text-2xl sm:text-3xl font-black">100+</div>
              <div className="text-xs text-purple-100 font-semibold mt-0.5">Locations Managed</div>
            </div>

            <div className="pt-2 md:pt-0">
              <div className="flex justify-center mb-1">
                <Award className="w-5 h-5 text-white/90" />
              </div>
              <div className="text-2xl sm:text-3xl font-black">10,000+</div>
              <div className="text-xs text-purple-100 font-semibold mt-0.5">Happy Professionals</div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Features & Capabilities Section */}
      <section id="features" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-3xl mx-auto space-y-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              FEATURES & CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-1">
              Everything you need to run a high-performing operation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Intelligent Task Management</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Create, assign and track tasks across locations and shifts seamlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Smart Scheduling</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Auto-generate schedules based on skills, availability and workload.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Real-time Tracking</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Live updates on task status, attendance and location with QR verification.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Issue & Incident Management</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Report, escalate and resolve issues faster.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Templates & Checklists</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Standardized task templates and checklists ensure consistency.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-purple-100 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Multi-location & Shift Management</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Manage multiple sites, shifts and teams from one place.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. AI Outcomes Section (LEVERAGING AI FOR BETTER OUTCOMES) */}
      <section id="ai-insights" className="py-10 bg-[#f9fafb] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-purple-600 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200">
                LEVERAGING AI FOR BETTER OUTCOMES
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                AI that understands people, tasks and performance
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                AuraForcz uses AI to analyze behavior, punctuality, work patterns and task outcomes to help you make smarter decisions.
              </p>

              <ul className="space-y-2.5 pt-1">
                {[
                  "Proactive task assignments",
                  "Predict delays and optimize workforce",
                  "Analyze punctuality and work completion",
                  "Evaluate behavior and attitude",
                  "Rank professionals based on overall performance"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Middle Radial Diagram */}
            <div className="lg:col-span-5 flex justify-center py-2">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                
                {/* Dotted Circle */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-purple-200" />
                
                {/* Central Logo Core */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-white shadow-xl border-4 border-purple-100 flex items-center justify-center">
                  <AuraLogo className="w-10 h-10" textClassName="hidden" />
                </div>

                {/* 6 Radial Nodes */}
                <div className="absolute -top-1 left-4 bg-white shadow-md border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-10">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">
                    <Calendar className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Work & Schedules</span>
                </div>

                <div className="absolute top-2 right-4 bg-white shadow-md border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-10">
                  <div className="w-5 h-5 rounded-md bg-cyan-50 text-cyan-600 flex items-center justify-center text-[10px]">
                    <FileCheck className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Task History</span>
                </div>

                <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white shadow-md border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-10">
                  <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-[10px]">
                    <Clock className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Punctuality</span>
                </div>

                <div className="absolute bottom-2 right-2 bg-white shadow-md border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-10">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px]">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Work Completion</span>
                </div>

                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white shadow-md border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-10">
                  <div className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-[10px]">
                    <Award className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Behavior & Attitude</span>
                </div>

                <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-white shadow-md border border-slate-100 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-10">
                  <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-[10px]">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800">Skills & Expertise</span>
                </div>

              </div>
            </div>

            {/* Right Card: AI Insights */}
            <div className="lg:col-span-3">
              <div className="bg-[#f3f0ff] rounded-3xl p-5 border border-purple-100 shadow-sm space-y-3 text-left">
                <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                  <h3 className="font-extrabold text-xs text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Insights
                  </h3>
                </div>

                <div className="space-y-2.5">
                  
                  {/* Top Performer */}
                  <div className="bg-white p-2.5 rounded-xl shadow-2xs border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                          PS
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-900">Top Performer</div>
                          <div className="text-[9px] text-slate-500">Priya S.</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        98% ↑
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">98% tasks completed</div>
                  </div>

                  {/* Needs Improvement */}
                  <div className="bg-white p-2.5 rounded-xl shadow-2xs border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                          RK
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-900">Needs Improvement</div>
                          <div className="text-[9px] text-slate-500">Ramesh K.</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        Multiple delays
                      </span>
                    </div>
                  </div>

                  {/* High Workload Alert */}
                  <div className="bg-white p-2.5 rounded-xl shadow-2xs border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                          F3
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-900">High Workload Alert</div>
                          <div className="text-[9px] text-slate-500">Floor 3 Team</div>
                        </div>
                      </div>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                  </div>

                  {/* Smart Recommendation */}
                  <div className="bg-purple-600 text-white p-2.5 rounded-xl shadow-xs">
                    <div className="text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommendation
                    </div>
                    <p className="text-[9px] text-purple-100 mt-0.5 leading-snug">
                      Reassign 2 tasks from Ramesh K. to Arjun S.
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Integrations Bar */}
      <section className="py-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-4">
            CONNECTS WITH WHAT YOU USE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-85">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">🌐 Google Workspace</span>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">💼 Microsoft 365</span>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">💬 Slack</span>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">📱 WhatsApp</span>
            <span className="text-sm font-bold text-amber-600 flex items-center gap-1.5">📊 Power BI</span>
            <span className="text-sm font-bold text-blue-700 flex items-center gap-1.5">🔷 SAP</span>
            <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">🌿 Freshdesk</span>
            <span className="text-xs font-semibold text-slate-400">& More</span>
          </div>
        </div>
      </section>

      {/* 7. Admin Dashboard Section (LIGHT CARD UI matching mockup) */}
      <section id="admin-dashboard" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Visual: LIGHT Admin Dashboard Container */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200 text-slate-900 space-y-4">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Performance Overview</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Insights
                  </span>
                </div>

                {/* 4 Light Metric Box Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Productivity Score</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">92%</div>
                    <div className="text-[9px] text-emerald-600 font-semibold">▲ +8.4%</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Punctuality</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">95%</div>
                    <div className="text-[9px] text-emerald-600 font-semibold">▲ +6.2%</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Task Completion</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">91%</div>
                    <div className="text-[9px] text-emerald-600 font-semibold">▲ +7.1%</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] text-slate-500 font-medium">Behavior Score</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">4.6/5</div>
                    <div className="text-[9px] text-emerald-600 font-semibold">▲ +8.2%</div>
                  </div>
                </div>

                {/* Top Professionals Leaderboard Table */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Professionals</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100 text-[10px]">
                          <th className="pb-2">Rank</th>
                          <th className="pb-2">Professional</th>
                          <th className="pb-2">Tasks Completed</th>
                          <th className="pb-2">Punctuality</th>
                          <th className="pb-2">Behavior Score</th>
                          <th className="pb-2 text-right">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { rank: 1, name: "Priya S.", tasks: 138, punctuality: "98%", behavior: "4.8" },
                          { rank: 2, name: "Ramesh K.", tasks: 115, punctuality: "90%", behavior: "4.7" },
                          { rank: 3, name: "Meena T.", tasks: 110, punctuality: "94%", behavior: "4.6" },
                          { rank: 4, name: "Arjun M.", tasks: 105, punctuality: "92%", behavior: "4.5" },
                          { rank: 5, name: "Kavitha R.", tasks: 98, punctuality: "91%", behavior: "4.4" }
                        ].map((row) => (
                          <tr key={row.rank} className="hover:bg-slate-50">
                            <td className="py-2.5 font-bold text-slate-400">{row.rank}</td>
                            <td className="py-2.5 font-semibold text-slate-900 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                                {row.name[0]}
                              </div>
                              {row.name}
                            </td>
                            <td className="py-2.5 text-slate-600">{row.tasks}</td>
                            <td className="py-2.5 text-emerald-600 font-bold">{row.punctuality}</td>
                            <td className="py-2.5 text-slate-700">{row.behavior}</td>
                            <td className="py-2.5 text-right text-amber-400">★★★★★</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Copy */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-[10px] font-bold tracking-widest uppercase text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                ADMIN DASHBOARD
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Data-driven insights.<br />Better decisions.
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Get a 360° view of your operations with powerful dashboards and AI-driven analytics.
              </p>

              <ul className="space-y-2.5 pt-1">
                {[
                  "Performance ranking of professionals",
                  "Punctuality and behavior analytics",
                  "Work completion trends",
                  "Proactive alerts and recommendations"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800">
                    <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <button 
                  onClick={onLoginClick}
                  className="px-6 py-3 rounded-full text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  Explore Dashboard <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Trusted By Organizations That Care */}
      <section className="py-10 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-6">
            TRUSTED BY ORGANIZATIONS THAT CARE
          </p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-items-center opacity-75">
            <span className="text-base font-black text-slate-700 tracking-wider">PRESTIGE</span>
            <span className="text-xl font-black text-slate-800 tracking-tighter">DLF</span>
            <span className="text-base font-black text-slate-700 tracking-widest">GMR</span>
            <span className="text-xl font-black text-slate-900 tracking-widest">ISS</span>
            <span className="text-xs font-black text-slate-700 tracking-tight">BROOKFIELD</span>
            <span className="text-base font-black text-slate-800 tracking-widest">CBRE</span>
          </div>
        </div>
      </section>

      {/* 9. CTA Banner */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-2 text-left max-w-2xl">
            <div className="flex items-center gap-2">
              <AuraLogo className="w-7 h-7" textClassName="text-xl text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Elevate your operations. Empower your people.
            </h2>
            <p className="text-purple-100 text-xs sm:text-sm font-medium">
              Join hundreds of organizations transforming their facilities with AuraForcz.
            </p>
          </div>

          <div>
            <button 
              onClick={() => setShowModal(true)}
              className="px-7 py-3 rounded-full text-xs font-bold text-purple-700 bg-white hover:bg-slate-50 shadow-md transition-all flex items-center gap-1.5 group whitespace-nowrap cursor-pointer"
            >
              Request Demo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* 10. Footer */}
      <footer id="footer" className="bg-[#060b26] text-slate-300 pt-10 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 text-left">
            
            {/* Logo & Description */}
            <div className="lg:col-span-2 space-y-3">
              <AuraLogo textClassName="text-xl text-white" />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                AI-powered platform that simplifies task management, scheduling and workforce operations for housekeeping and caretaking teams.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>

            {/* Solutions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Solutions</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><span className="hover:text-white cursor-pointer">Housekeeping</span></li>
                <li><span className="hover:text-white cursor-pointer">Caretaking</span></li>
                <li><span className="hover:text-white cursor-pointer">Facility Management</span></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><span className="hover:text-white cursor-pointer">Blog</span></li>
                <li><span className="hover:text-white cursor-pointer">Case Studies</span></li>
                <li><span className="hover:text-white cursor-pointer">Help Center</span></li>
              </ul>
            </div>

            {/* Our Offices */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Our Offices</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-purple-400" /> Chennai, India
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Level 5, Olympia Tech Park, Guindy, Chennai - 600032
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-white flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-purple-400" /> Melbourne, Australia
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Level 10, 459 Collins Street, Melbourne, VIC 3000
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© 2025 AuraForcz. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            </div>
          </div>

        </div>
      </footer>

      {/* DEMO MODAL */}
      {showModal && (
        <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(4px)'}}>
          <div style={{width:'100%',maxWidth:'420px',background:'#fff',borderRadius:'24px',boxShadow:'0 25px 80px rgba(0,0,0,.25)',overflow:'hidden'}}>
            <div style={{background:'linear-gradient(to right,#7c3aed,#ec4899)',padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <h3 style={{color:'#fff',fontWeight:900,fontSize:'18px',margin:'0 0 2px'}}>Request a Demo</h3>
                <p style={{color:'rgba(255,255,255,.7)',fontSize:'12px',margin:0}}>We'll reach out within 24 hours</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{width:'30px',height:'30px',borderRadius:'50%',background:'rgba(255,255,255,.2)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <X className="w-4 h-4" style={{color:'#fff'}} />
              </button>
            </div>
            <div style={{padding:'24px'}}>
              {submitted ? (
                <div style={{textAlign:'center',padding:'32px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
                  <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#ecfdf5',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <CheckCircle className="w-7 h-7" style={{color:'#059669'}} />
                  </div>
                  <p style={{fontWeight:'bold',fontSize:'16px',color:'#0f172a',margin:0}}>Request Submitted!</p>
                  <p style={{color:'#64748b',fontSize:'13px',margin:0}}>Our team will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                  {[
                    {l:'Full Name',    k:'name',    t:'text',  ph:'e.g. Priya Sharma'},
                    {l:'Work Email',   k:'email',   t:'email', ph:'priya@company.com'},
                    {l:'Company Name', k:'company', t:'text',  ph:'e.g. Prestige Group'},
                    {l:'Phone Number', k:'phone',   t:'tel',   ph:'+91 98765 43210'},
                  ].map(f => (
                    <div key={f.k}>
                      <label style={{display:'block',fontSize:'12px',fontWeight:700,color:'#334155',marginBottom:'4px'}}>{f.l}</label>
                      <input required type={f.t} placeholder={f.ph} value={form[f.k]} onChange={e => setForm(p => ({...p,[f.k]:e.target.value}))}
                        style={{width:'100%',padding:'10px 14px',borderRadius:'12px',border:'1.5px solid #e2e8f0',fontSize:'13px',outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}
                        onFocus={e=>{e.target.style.borderColor='#7c3aed';e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,.1)'}}
                        onBlur={e=>{e.target.style.borderColor='#e2e8f0';e.target.style.boxShadow='none'}}
                      />
                    </div>
                  ))}
                  <button type="submit" className="flex items-center justify-center gap-2" style={{width:'100%',padding:'12px',borderRadius:'12px',fontSize:'14px',fontWeight:700,color:'#fff',background:'linear-gradient(to right,#7c3aed,#ec4899)',border:'none',cursor:'pointer',marginTop:'4px'}}>
                    Request Demo <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
