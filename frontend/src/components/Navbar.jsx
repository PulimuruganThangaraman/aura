import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, User, LogOut, Settings, ShieldCheck, ChevronDown, CheckCircle, AlertTriangle, Menu } from 'lucide-react';
import apiClient from '../api/client';

export default function Navbar({ onNavigate, activeTab, toggleSidebar }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState({ unread_count: 0, items: [] });

  useEffect(() => {
    fetchNotifications();
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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 text-white font-black text-lg px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm">
            <span className="bg-white text-blue-600 rounded-md w-5 h-5 flex items-center justify-center text-xs font-black">A</span>
            auraLinks
          </div>
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-200">Enterprise</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.unread_count > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {notifications.unread_count}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                  {notifications.unread_count} unread
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.items.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-slate-500 text-center">No notifications</p>
                ) : (
                  notifications.items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start space-x-3 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      {n.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-none">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.first_name} {user?.last_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {user?.company_name || user?.role}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => { onNavigate('profile'); setShowUserMenu(false); }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
