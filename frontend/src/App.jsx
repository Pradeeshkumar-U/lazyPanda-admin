import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LoginScreen from './components/LoginScreen';
import ChannelList from './components/ChannelList';
import ReportsList from './components/ReportsList';
import ChannelModal from './components/ChannelModal';
import VersionModal from './components/VersionModal';
import AdminsModal from './components/AdminsModal';
import { api, setAuthToken } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // App Navigation & Filters
  const [activeStation, setActiveStation] = useState('tamil');
  const [activeTab, setActiveTab] = useState('channels'); // 'channels' | 'reports' | 'version' | 'admins'
  
  // Channels Data
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingChannels, setLoadingChannels] = useState(false);

  // Reports Data
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Modals
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);

  // 1. Check existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.getMe();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        // Not authenticated yet
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    checkSession();
  }, []);

  // 2. Fetch channels & categories when station or user changes
  const loadStationData = useCallback(async () => {
    if (!user) return;
    setLoadingChannels(true);
    try {
      const [channelsData, categoriesData] = await Promise.all([
        api.getChannels(activeStation),
        api.getCategories(activeStation),
      ]);
      setChannels(channelsData || []);
      setCategories(categoriesData || []);
      setActiveCategory('ALL');
    } catch (err) {
      console.error('Failed to load station data:', err);
    } finally {
      setLoadingChannels(false);
    }
  }, [user, activeStation]);

  // 3. Fetch reports data
  const loadReportsData = useCallback(async () => {
    if (!user) return;
    setLoadingReports(true);
    try {
      const reportsData = await api.getReports(activeStation);
      setReports(reportsData || []);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [user, activeStation]);

  // Trigger loads based on activeTab
  useEffect(() => {
    if (user && activeTab === 'channels') {
      loadStationData();
    }
  }, [user, activeStation, activeTab, loadStationData]);

  useEffect(() => {
    if (user && (activeTab === 'reports' || activeTab === 'channels')) {
      loadReportsData();
    }
  }, [user, activeStation, activeTab, loadReportsData]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setAuthToken(null);
    setUser(null);
  };

  // Add / Edit Modal openers
  const handleOpenAddChannel = () => {
    setEditingChannel(null);
    setIsChannelModalOpen(true);
  };

  const handleOpenEditChannel = (channel) => {
    setEditingChannel(channel);
    setIsChannelModalOpen(true);
  };

  const handleDeleteChannel = async (channel) => {
    const confirmMsg = `Are you sure you want to delete "${channel.channel_name}" from ${activeStation.toUpperCase()} FM?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteChannel(activeStation, channel.uuid);
      // Also resolve any associated report
      await api.resolveReport(activeStation, channel.uuid).catch(() => {});
      await loadStationData();
      if (activeTab === 'reports') {
        await loadReportsData();
      }
    } catch (err) {
      alert('Failed to delete channel: ' + err.message);
    }
  };

  const handleResolveReport = async (reportItem) => {
    try {
      await api.resolveReport(activeStation, reportItem.uuid);
      await loadReportsData();
    } catch (err) {
      alert('Failed to resolve report: ' + err.message);
    }
  };

  const handleSaveModalSuccess = async () => {
    await loadStationData();
    if (activeTab === 'reports') {
      await loadReportsData();
    }
  };

  // Filter channels by activeCategory and searchQuery
  const filteredChannels = channels.filter((ch) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      (ch.category || '').toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      (ch.channel_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Loading splash while checking auth session
  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spin" style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontWeight: 600 }}>Securing FM Admin Portal...</div>
        </div>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '16px 24px' }}>
      {/* Top Sticky Navigation */}
      <Navbar
        activeStation={activeStation}
        onSelectStation={(st) => setActiveStation(st)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        reportCount={reports.length}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main>
        {activeTab === 'channels' && (
          <ChannelList
            channels={filteredChannels}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            onAddChannel={handleOpenAddChannel}
            onEditChannel={handleOpenEditChannel}
            onDeleteChannel={handleDeleteChannel}
            station={activeStation}
            loading={loadingChannels}
            onRefresh={loadStationData}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsList
            reports={reports}
            station={activeStation}
            loading={loadingReports}
            onRefresh={loadReportsData}
            onEditChannel={handleOpenEditChannel}
            onDeleteChannel={handleDeleteChannel}
            onResolveReport={handleResolveReport}
          />
        )}

        {activeTab === 'version' && <VersionModal />}

        {activeTab === 'admins' && <AdminsModal />}
      </main>

      {/* Add / Edit Channel Modal */}
      <ChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        channel={editingChannel}
        station={activeStation}
        categories={categories}
        onSaveSuccess={handleSaveModalSuccess}
      />
    </div>
  );
}
