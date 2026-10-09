import { useState } from 'react';
import HomePage from '../frontend/HomePage';
import LoginPage from '../frontend/LoginPage';
import RegisterPage from '../frontend/RegisterPage';
import AdminPage from '../frontend/AdminPage';
import DashboardPage from '../frontend/Dashboard';
import SearchPage from '../frontend/SearchPage';
import HistoryPage from '../frontend/HistoryPage';
import RecommendationPage from '../frontend/RecommendationPage';
import ProfilePage from '../frontend/ProfilePage';
import AdminDashboard from '../frontend/AdminDashboard';
import AdminManagementPage from '../frontend/AdminManagementPage';
import AdminAnalyticsPage from '../frontend/AdminAnalyticsPage';
import AdminQueriesPage from '../frontend/AdminQueriesPage';
import { logout as apiLogout } from './api';

const stored = JSON.parse(localStorage.getItem('mediguide_auth') || 'null');

function App() {
  const [view, setView] = useState(stored ? (stored.isAdmin ? 'adminDashboard' : 'dashboard') : 'home');
  const [userName, setUserName] = useState(stored?.name || '');
  const [userEmail, setUserEmail] = useState(stored?.email || '');
  const [token, setToken] = useState(stored?.token || null);
  const [authenticated, setAuthenticated] = useState(!!stored?.token);
  const [isAdmin, setIsAdmin] = useState(stored?.isAdmin || false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [adminResource, setAdminResource] = useState('diseases');
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      return localStorage.getItem('mediguide_user_lang') || 'en-IN';
    } catch {
      return 'en-IN';
    }
  });

  const handleLanguageChange = (newLang) => {
    setCurrentLanguage(newLang);
    try {
      localStorage.setItem('mediguide_user_lang', newLang);
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
  };

  const persistAuth = (auth, admin = false) => {
    const name = auth.name || auth.email || 'User';
    const email = auth.email || (name.includes('@') ? name : `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`);
    localStorage.setItem('mediguide_auth', JSON.stringify({ token: auth.token, name, email, isAdmin: admin }));
    setToken(auth.token);
    setUserName(name);
    setUserEmail(email);
    setAuthenticated(true);
    setIsAdmin(admin);
    setVoiceMode(false);
  };

  const handleUpdateUserName = (newName) => {
    setUserName(newName);
    const curr = JSON.parse(localStorage.getItem('mediguide_auth') || '{}');
    localStorage.setItem('mediguide_auth', JSON.stringify({ ...curr, name: newName }));
  };

  const handleLoginSuccess = (auth) => {
    persistAuth(auth, auth.role === 'ADMIN');
    if (pendingSearchQuery) {
      setView('search');
      return;
    }
    setView('dashboard');
  };

  const handleRegisterSuccess = (auth) => {
    persistAuth(auth, false);
    setView('dashboard');
  };

  const handleAdminLoginSuccess = (auth) => {
    persistAuth(auth, true);
    setView('adminDashboard');
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await apiLogout(token);
      } catch (error) {
        console.warn('Logout failed:', error);
      }
    }
    localStorage.removeItem('mediguide_auth');
    setToken(null);
    setAuthenticated(false);
    setIsAdmin(false);
    setVoiceMode(false);
    setView('login');
  };

  const handleOpenSearch = () => {
    setVoiceMode(false);
    setView('search');
  };

  const handleVoiceSearch = () => {
    setVoiceMode(true);
    setView('search');
  };

  const handleHistory = () => {
    setVoiceMode(false);
    setView('history');
  };

  const handleRecommendations = () => {
    setVoiceMode(false);
    setView('recommendations');
  };

  const handleAdminManagement = (resource) => {
    setAdminResource(resource);
    setView('adminManagement');
  };

  const handleAdminAnalytics = () => {
    setVoiceMode(false);
    setView('adminAnalytics');
  };

  const handleAdminQueries = () => {
    setVoiceMode(false);
    setView('adminQueries');
  };

  const handleHomeSearch = (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    setPendingSearchQuery(trimmedQuery);
    setVoiceMode(false);
    setView('search');
  };

  return (
    <>
      {view === 'login' && (
        <LoginPage
          onLogin={handleLoginSuccess}
          onRegisterClick={() => setView('register')}
          onAdminLoginClick={() => setView('admin')}
        />
      )}
      {view === 'register' && (
        <RegisterPage
          onCreateAccount={handleRegisterSuccess}
          onLoginClick={() => setView('login')}
        />
      )}
      {view === 'admin' && (
        <AdminPage
          onAdminLogin={handleAdminLoginSuccess}
          onBackToLogin={() => setView('login')}
        />
      )}
      {view === 'home' && (
        <HomePage
          onSearch={handleHomeSearch}
          onVoiceSearch={() => {
            setVoiceMode(true);
            setView('search');
          }}
          onLogin={() => setView('login')}
          onRegister={() => setView('register')}
          onAdminClick={() => setView('admin')}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {view === 'dashboard' && (
        <DashboardPage
          userName={userName}
          userEmail={userEmail}
          token={token}
          onLogout={handleLogout}
          onSearchClick={handleOpenSearch}
          onVoiceSearchClick={handleVoiceSearch}
          onHistoryClick={handleHistory}
          onRecommendationsClick={handleRecommendations}
          onProfileClick={() => setView('profile')}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {view === 'search' && (
        <SearchPage
          userName={userName}
          token={token}
          initialQuery={pendingSearchQuery}
          onLogout={handleLogout}
          onBack={() => {
            setView(authenticated ? 'dashboard' : 'home');
            setVoiceMode(false);
          }}
          onLogin={() => setView('login')}
          onRegister={() => setView('register')}
          startVoice={voiceMode}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {view === 'history' && (
        <HistoryPage
          userName={userName}
          token={token}
          onLogout={handleLogout}
          onBack={() => {
            setView(authenticated ? 'dashboard' : 'home');
            setVoiceMode(false);
          }}
          onLogin={() => setView('login')}
          onRegister={() => setView('register')}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {view === 'recommendations' && (
        <RecommendationPage
          userName={userName}
          token={token}
          onLogout={handleLogout}
          onBack={() => {
            setView(authenticated ? 'dashboard' : 'home');
            setVoiceMode(false);
          }}
          onLogin={() => setView('login')}
          onRegister={() => setView('register')}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {view === 'profile' && (
        <ProfilePage
          userName={userName}
          token={token}
          onLogout={handleLogout}
          onBack={() => setView('dashboard')}
          onUpdateUserName={handleUpdateUserName}
          onSearchClick={handleOpenSearch}
          onHistoryClick={handleHistory}
          onRecommendationsClick={handleRecommendations}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
      )}
      {view === 'adminDashboard' && (
        <AdminDashboard
          userName={userName}
          token={token}
          onLogout={handleLogout}
          onSectionSelect={handleAdminManagement}
          onQueries={handleAdminQueries}
          onAnalytics={handleAdminAnalytics}
        />
      )}
      {view === 'adminManagement' && (
        <AdminManagementPage
          token={token}
          resource={adminResource}
          onBack={() => setView('adminDashboard')}
          onLogout={handleLogout}
        />
      )}
      {view === 'adminQueries' && (
        <AdminQueriesPage
          token={token}
          onBack={() => setView('adminDashboard')}
          onLogout={handleLogout}
        />
      )}
      {view === 'adminAnalytics' && (
        <AdminAnalyticsPage
          token={token}
          onBack={() => setView('adminDashboard')}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
