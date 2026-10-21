import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, User, LogOut, Settings, ShieldCheck, ChevronDown, CheckCircle, 
  AlertTriangle, Menu, Search, Plus, Calendar, Clock, UserPlus, MapPin, 
  Sparkles, CheckCircle2, Shield
} from 'lucide-react';
import apiClient from '../api/client';
import AuraLogo from './AuraLogo';

export default function Navbar({ onNavigate, activeTab, toggleSidebar, onQuickAdd }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [notifications, setNotifications] = useState({ unread_count: 0, items: [] });
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const quickAddRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (quickAddRef.current && !quickAddRef.current.contains(e.target)) setShowQuickAdd(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await apiClient.post(`/notifications/${id}/mark-read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const currentDateStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Left Section: Mobile Toggle & Brand Logo */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          className="flex items-center space-x-2.5 cursor-pointer group" 
          onClick={() => onNavigate('dashboard')}
          title="AuraForcz Overview"
        >
          <AuraLogo className="w-8 h-8" textClassName="text-xl font-extrabold" theme="light" />
          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full border border-indigo-200/60 leading-none">
            Enterprise
          </span>
        </div>
      </div>

      {/* Center Section: Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workers, clients, shifts, locations..."
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-teal-500 rounded-full outline-none transition-all placeholder:text-slate-400 text-slate-800"
          />
          <div className="absolute right-2.5 top-2 text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            Ctrl+K
          </div>
        </div>
      </div>

      {/* Right Section: Status Indicator, Quick Add, Notifications, User Menu */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Live Roster Status Chip */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 bg-teal-50 border border-teal-200/70 rounded-full text-teal-800 text-[11px] font-semibold">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span>Roster Live</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-normal">{currentDateStr}</span>
        </div>

        {/* Quick Add Button & Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
            <ChevronDown className="w-3 h-3 text-teal-200" />
          </button>

          {showQuickAdd && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Create New
              </div>
              <button
                onClick={() => { onNavigate('schedule-tasks'); setShowQuickAdd(false); }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>New Schedule</span>
              </button>
              <button
                onClick={() => { onNavigate('shifts'); setShowQuickAdd(false); }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2 transition-colors"
              >
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Create Shift</span>
              </button>
              <button
                onClick={() => { onNavigate('professionals'); setShowQuickAdd(false); }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Add Professional</span>
              </button>
              <button
                onClick={() => { onNavigate('locations'); setShowQuickAdd(false); }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-800 flex items-center space-x-2 transition-colors"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Add Location</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            aria-label="View notifications"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.unread_count > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-xs">Notifications</span>
                  {notifications.unread_count > 0 && (
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                      {notifications.unread_count} new
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => fetchNotifications()} 
                  className="text-[11px] text-teal-600 hover:underline font-medium"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p>All caught up! No notifications.</p>
                  </div>
                ) : (
                  notifications.items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start space-x-3 transition-colors ${!n.is_read ? 'bg-teal-50/40' : ''}`}
                    >
                      {n.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 inline-block">Just now</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center space-x-2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center font-bold text-xs border border-slate-700">
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                {user?.company_name || user?.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account & Profile</span>
                </button>

                <button
                  onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Company Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
