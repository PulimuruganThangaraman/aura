import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Building2, UserCheck, Briefcase, MapPin, Grid, 
  Clock, ListTodo, CalendarDays, FileText, ChevronDown, ChevronRight, 
  UserCog, Settings, Calendar, Layers, Shield, Sparkles, CheckSquare, Crown,
  BriefcaseBusiness, CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activeTab, onNavigate, isMobileOpen, closeMobile }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const isProfessional = user?.role === 'Professional' || user?.role === 'professional';
  const isCompanyAdmin = !isSuperAdmin && !isProfessional;

  const [openSubmenu, setOpenSubmenu] = useState({
    adminTenants: true,
    adminRoster: true,
    adminWorkforce: true,
    adminFacilities: false,
    rosterMgmt: true,
    workforceMgmt: true,
    facilityMgmt: true,
  });

  const toggleGroup = (group) => {
    setOpenSubmenu(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navClass = (tab) => 
    `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
      activeTab === tab 
        ? 'bg-teal-600 text-white font-semibold shadow-sm shadow-teal-900/30' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const subNavClass = (tab) => 
    `w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
      activeTab === tab 
        ? 'bg-teal-500/20 text-teal-400 font-semibold border-l-2 border-teal-400 pl-2.5' 
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-slate-100 flex flex-col justify-between
        border-r border-slate-800
        transform transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-3.5 overflow-y-auto space-y-4">
          
          {/* Active Role Portal Card */}
          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Workspace</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="flex items-center space-x-2 mt-1.5">
              <div className="w-7 h-7 rounded-lg bg-teal-600/30 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                {isSuperAdmin ? <Crown className="w-4 h-4 text-amber-400" /> : (isCompanyAdmin ? <Building2 className="w-4 h-4 text-teal-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {isSuperAdmin ? 'Super Admin Portal' : (isCompanyAdmin ? 'Company Admin' : `${user?.first_name || 'Care'} Professional`)}
                </p>
                <p className="text-[10px] text-teal-300 truncate">
                  {isSuperAdmin ? 'Platform Executive' : (user?.company_name || (isProfessional ? 'Assigned Field Staff' : 'Operations Manager'))}
                </p>
              </div>
            </div>
          </div>

          {/* Core Overview */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
              Core Overview
            </div>

            {/* Dashboard */}
            <button
              onClick={() => { onNavigate('dashboard'); closeMobile(); }}
              className={navClass('dashboard')}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>{isSuperAdmin ? 'Platform Analytics' : (isProfessional ? 'My Dashboard' : 'Dashboard')}</span>
              </div>
              {activeTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          </div>

          {/* ======================================================== */}
          {/* SUPER ADMIN SPECIFIC SHIFTCARE NAVIGATION */}
          {/* ======================================================== */}
          {isSuperAdmin && (
            <>
              {/* Tenant & Client Management */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('adminTenants')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Client Tenants</span>
                  {openSubmenu.adminTenants ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.adminTenants && (
                  <div className="space-y-0.5 pt-0.5">
                    <button
                      onClick={() => { onNavigate('companies'); closeMobile(); }}
                      className={subNavClass('companies')}
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Companies & Admins</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('system-accounts'); closeMobile(); }}
                      className={subNavClass('system-accounts')}
                    >
                      <UserCog className="w-3.5 h-3.5 shrink-0" />
                      <span>Company Admins & Users</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Cross-Tenant Rosters & Jobs Oversight */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('adminRoster')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Jobs & Rosters Oversight</span>
                  {openSubmenu.adminRoster ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.adminRoster && (
                  <div className="space-y-0.5 pt-0.5">
                    <button
                      onClick={() => { onNavigate('schedule-tasks'); closeMobile(); }}
                      className={subNavClass('schedule-tasks')}
                    >
                      <BriefcaseBusiness className="w-3.5 h-3.5 shrink-0" />
                      <span>All Jobs & Tasks Roster</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('task-templates'); closeMobile(); }}
                      className={subNavClass('task-templates')}
                    >
                      <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>Job Templates Library</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('shifts'); closeMobile(); }}
                      className={subNavClass('shifts')}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Shifts & Time Slots</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Enterprise Workforce */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('adminWorkforce')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Enterprise Workforce</span>
                  {openSubmenu.adminWorkforce ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.adminWorkforce && (
                  <div className="space-y-0.5 pt-0.5">
                    <button
                      onClick={() => { onNavigate('professionals'); closeMobile(); }}
                      className={subNavClass('professionals')}
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Care Professionals</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Facilities & Sites Network */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('adminFacilities')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Facilities & Sites</span>
                  {openSubmenu.adminFacilities ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.adminFacilities && (
                  <div className="space-y-0.5 pt-0.5">
                    <button
                      onClick={() => { onNavigate('locations'); closeMobile(); }}
                      className={subNavClass('locations')}
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Care Locations</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('work-locations'); closeMobile(); }}
                      className={subNavClass('work-locations')}
                    >
                      <Grid className="w-3.5 h-3.5 shrink-0" />
                      <span>Work Locations (QR)</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('departments'); closeMobile(); }}
                      className={subNavClass('departments')}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span>Departments</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Compliance & Audits */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                  Governance
                </div>
                <button
                  onClick={() => { onNavigate('reports'); closeMobile(); }}
                  className={navClass('reports')}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Cross-Tenant Reports</span>
                  </div>
                  {activeTab === 'reports' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>

                <button
                  onClick={() => { onNavigate('profile'); closeMobile(); }}
                  className={navClass('profile')}
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Platform Settings</span>
                  </div>
                  {activeTab === 'profile' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* COMPANY ADMIN SPECIFIC NAVIGATION */}
          {/* ======================================================== */}
          {isCompanyAdmin && (
            <>
              {/* Jobs & Scheduling Group */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('rosterMgmt')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Jobs & Rosters</span>
                  {openSubmenu.rosterMgmt ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.rosterMgmt && (
                  <div className="space-y-0.5 pt-0.5">
                    {/* Jobs & Tasks (Roster) */}
                    <button
                      onClick={() => { onNavigate('schedule-tasks'); closeMobile(); }}
                      className={subNavClass('schedule-tasks')}
                    >
                      <BriefcaseBusiness className="w-3.5 h-3.5 shrink-0" />
                      <span>Jobs & Tasks Roster</span>
                    </button>

                    {/* Job Templates */}
                    <button
                      onClick={() => { onNavigate('task-templates'); closeMobile(); }}
                      className={subNavClass('task-templates')}
                    >
                      <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>Job Templates</span>
                    </button>

                    {/* Shifts & Time Slots */}
                    <button
                      onClick={() => { onNavigate('shifts'); closeMobile(); }}
                      className={subNavClass('shifts')}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Shifts & Slots</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Workforce & Staff Group */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('workforceMgmt')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Company Workforce</span>
                  {openSubmenu.workforceMgmt ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.workforceMgmt && (
                  <div className="space-y-0.5 pt-0.5">
                    <button
                      onClick={() => { onNavigate('professionals'); closeMobile(); }}
                      className={subNavClass('professionals')}
                    >
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Professionals</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('system-accounts'); closeMobile(); }}
                      className={subNavClass('system-accounts')}
                    >
                      <UserCog className="w-3.5 h-3.5 shrink-0" />
                      <span>System Users</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Facilities & Operations */}
              <div className="space-y-1">
                <button
                  onClick={() => toggleGroup('facilityMgmt')}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Facilities & Zones</span>
                  {openSubmenu.facilityMgmt ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {openSubmenu.facilityMgmt && (
                  <div className="space-y-0.5 pt-0.5">
                    <button
                      onClick={() => { onNavigate('locations'); closeMobile(); }}
                      className={subNavClass('locations')}
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>Facility Locations</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('work-locations'); closeMobile(); }}
                      className={subNavClass('work-locations')}
                    >
                      <Grid className="w-3.5 h-3.5 shrink-0" />
                      <span>Work Locations (QR)</span>
                    </button>

                    <button
                      onClick={() => { onNavigate('departments'); closeMobile(); }}
                      className={subNavClass('departments')}
                    >
                      <Layers className="w-3.5 h-3.5 shrink-0" />
                      <span>Departments</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reports */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                  Compliance
                </div>
                <button
                  onClick={() => { onNavigate('reports'); closeMobile(); }}
                  className={navClass('reports')}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>Reports & Audits</span>
                  </div>
                  {activeTab === 'reports' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* CARE PROFESSIONAL SPECIFIC NAVIGATION */}
          {/* ======================================================== */}
          {isProfessional && (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 py-1">
                My Care Schedule
              </div>

              {/* My Assigned Jobs & Tasks */}
              <button
                onClick={() => { onNavigate('schedule-tasks'); closeMobile(); }}
                className={navClass('schedule-tasks')}
              >
                <div className="flex items-center space-x-2.5">
                  <CalendarDays className="w-4 h-4 shrink-0" />
                  <span>My Assigned Jobs & Tasks</span>
                </div>
                {activeTab === 'schedule-tasks' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 py-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              AuraLinks v4.0
            </span>
            <button 
              onClick={() => onNavigate('profile')} 
              className="text-slate-400 hover:text-teal-400 text-[10px] underline cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
