import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import SystemAccountsPage from './pages/SystemAccountsPage';
import ProfessionalsPage from './pages/ProfessionalsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import LocationsPage from './pages/LocationsPage';
import WorkLocationsPage from './pages/WorkLocationsPage';
import ShiftsPage from './pages/ShiftsPage';
import TaskTemplatesPage from './pages/TaskTemplatesPage';
import ScheduleTasksPage from './pages/ScheduleTasksPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

function MainContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!user) {
    if (showLogin) {
      return <LoginPage onBackToLanding={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'companies':
        return <CompaniesPage />;
      case 'system-accounts':
        return <SystemAccountsPage />;
      case 'professionals':
        return <ProfessionalsPage />;
      case 'departments':
        return <DepartmentsPage />;
      case 'locations':
        return <LocationsPage />;
      case 'work-locations':
        return <WorkLocationsPage />;
      case 'shifts':
        return <ShiftsPage />;
      case 'task-templates':
        return <TaskTemplatesPage />;
      case 'schedule-tasks':
        return <ScheduleTasksPage />;
      case 'reports':
        return <ReportsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar
        onNavigate={setActiveTab}
        activeTab={activeTab}
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          closeMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
