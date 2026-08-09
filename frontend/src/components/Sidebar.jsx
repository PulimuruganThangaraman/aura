import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Building2, UserCheck, Briefcase, MapPin, Grid, 
  Clock, ListTodo, CalendarDays, FileText, ChevronDown, ChevronRight, UserCog, Settings
} from 'lucide-react';

export default function Sidebar({ activeTab, onNavigate, isMobileOpen, closeMobile }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [openSubmenu, setOpenSubmenu] = useState({
    userMgmt: true,
    admin: true,
    taskMgmt: true
  });

  const toggleGroup = (group) => {
    setOpenSubmenu(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navClass = (tab) => 
    `flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      activeTab === tab 
        ? 'bg-blue-600 text-white font-semibold shadow-xs' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const subNavClass = (tab) => 
    `flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
      activeTab === tab 
        ? 'bg-blue-600/90 text-white font-semibold shadow-xs' 
        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 text-slate-100 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold px-3">
            Main Navigation
          </div>

          <nav className="space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => { onNavigate('dashboard'); closeMobile(); }}
              className={`w-full ${navClass('dashboard')}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* User Management Menu Group */}
            <div>
              <button
                onClick={() => toggleGroup('userMgmt')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Users className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>User Management</span>
                </div>
                {openSubmenu.userMgmt ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSubmenu.userMgmt && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-800 pl-2">
                  {isSuperAdmin && (
                    <button
                      onClick={() => { onNavigate('companies'); closeMobile(); }}
                      className={`w-full ${subNavClass('companies')}`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Companies</span>
                    </button>
                  )}

                  {!isSuperAdmin && (
                    <button
                      onClick={() => { onNavigate('system-accounts'); closeMobile(); }}
                      className={`w-full ${subNavClass('system-accounts')}`}
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>System Accounts</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onNavigate('professionals'); closeMobile(); }}
                    className={`w-full ${subNavClass('professionals')}`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Professionals</span>
                  </button>
                </div>
              )}
            </div>

            {/* Administration Menu Group */}
            <div>
              <button
                onClick={() => toggleGroup('admin')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Administration</span>
                </div>
                {openSubmenu.admin ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSubmenu.admin && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-800 pl-2">
                  <button
                    onClick={() => { onNavigate('departments'); closeMobile(); }}
                    className={`w-full ${subNavClass('departments')}`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Departments (Skills)</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('locations'); closeMobile(); }}
                    className={`w-full ${subNavClass('locations')}`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Locations</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('work-locations'); closeMobile(); }}
                    className={`w-full ${subNavClass('work-locations')}`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Work Locations (Sections)</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('shifts'); closeMobile(); }}
                    className={`w-full ${subNavClass('shifts')}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Shifts</span>
                  </button>
                </div>
              )}
            </div>

            {/* Task Management Menu Group */}
            <div>
              <button
                onClick={() => toggleGroup('taskMgmt')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ListTodo className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>Task Management</span>
                </div>
                {openSubmenu.taskMgmt ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {openSubmenu.taskMgmt && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-800 pl-2">
                  <button
                    onClick={() => { onNavigate('task-templates'); closeMobile(); }}
                    className={`w-full ${subNavClass('task-templates')}`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>Task Templates</span>
                  </button>

                  <button
                    onClick={() => { onNavigate('schedule-tasks'); closeMobile(); }}
                    className={`w-full ${subNavClass('schedule-tasks')}`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Schedule Tasks</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reports */}
            <button
              onClick={() => { onNavigate('reports'); closeMobile(); }}
              className={`w-full ${navClass('reports')}`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Reports</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
          <p>© 2026 Powered by <span className="text-white font-semibold">AuraLinks</span></p>
        </div>
      </aside>
    </>
  );
}
