'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Edit2, Save, X, Youtube, Link as LinkIcon, 
  Users, TrendingUp, DollarSign, Video, CheckCircle, AlertCircle 
} from 'lucide-react';

export default function CreatorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    niche: [] as string[],
  });

  const availableNiches = [
    'Technology', 'Gaming', 'Lifestyle', 'Education', 'Entertainment',
    'Fitness', 'Travel', 'Finance', 'Food', 'Music', 'Art', 'Sports'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/creator/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          name: data.user.name || '',
          bio: data.creator.bio || '',
          niche: data.creator.niche || [],
        });
      } else if (response.status === 401) {
        router.push('/auth/signin');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/creator/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectYouTube = () => {
    // Redirect to YouTube OAuth
    window.location.href = '/api/auth/youtube/connect';
  };

  const handleDisconnectYouTube = async () => {
    if (!confirm('Are you sure you want to disconnect your YouTube account?')) {
      return;
    }

    try {
      const response = await fetch('/api/auth/youtube/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setSuccess('YouTube account disconnected');
        fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to disconnect YouTube account');
    }
  };

  const toggleNiche = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      niche: prev.niche.includes(niche)
        ? prev.niche.filter(n => n !== niche)
        : [...prev.niche, niche]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-xl font-bold text-white">AdStream</span>
            </div>
            <div className="flex gap-4">
              <a href="/creator/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</a>
              <a href="/creator/profile" className="text-white font-medium">Profile</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {profile?.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-300">Manage your account and connected platforms</p>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: profile.user.name || '',
                    bio: profile.creator.bio || '',
                    niche: profile.creator.niche || [],
                  });
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5 text-gray-400" />
                      {profile?.user.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-5 h-5" />
                    {profile?.user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-slate-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      rows={4}
                      placeholder="Tell brands about yourself and your content..."
                    />
                  ) : (
                    <p className="text-gray-300">
                      {profile?.creator.bio || 'No bio added yet'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Niches
                  </label>
                  {editMode ? (
                    <div className="flex flex-wrap gap-2">
                      {availableNiches.map((niche) => (
                        <button
                          key={niche}
                          onClick={() => toggleNiche(niche)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            formData.niche.includes(niche)
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          {niche}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.creator.niche.length > 0 ? (
                        profile.creator.niche.map((niche: string) => (
                          <span
                            key={niche}
                            className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium"
                          >
                            {niche}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">No niches selected</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold text-white mb-6">Connected Accounts</h2>
              
              {/* YouTube */}
              <div className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <Youtube className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">YouTube</h3>
                      {profile?.creator.youtubeChannelId ? (
                        <>
                          <p className="text-gray-300 mb-2">{profile.creator.channelName || 'Connected'}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {profile.creator.subscriberCount?.toLocaleString() || '0'} subscribers
                            </span>
                            {profile.creator.channelUrl && (
                              <a
                                href={profile.creator.channelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                              >
                                <LinkIcon className="w-4 h-4" />
                                View Channel
                              </a>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Connected
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-400 mb-3">
                            Connect your YouTube channel to show your stats and verify your reach
                          </p>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            Not connected
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    {profile?.creator.youtubeChannelId ? (
                      <button
                        onClick={handleDisconnectYouTube}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectYouTube}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-6">Account Stats</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Total Listings</span>
                  </div>
                  <div className="text-2xl font-bold text-white">0</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Active Bids</span>
                  </div>
                  <div className="text-2xl font-bold text-white">0</div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Total Earnings</span>
                  </div>
                  <div className="text-2xl font-bold text-white">$0</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-xl font-bold text-white mb-4">Profile Completion</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Basic Info</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Bio Added</span>
                  <span className={profile?.creator.bio ? 'text-green-400' : 'text-gray-500'}>
                    {profile?.creator.bio ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Niches Selected</span>
                  <span className={profile?.creator.niche.length > 0 ? 'text-green-400' : 'text-gray-500'}>
                    {profile?.creator.niche.length > 0 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">YouTube Connected</span>
                  <span className={profile?.creator.youtubeChannelId ? 'text-green-400' : 'text-gray-500'}>
                    {profile?.creator.youtubeChannelId ? '✓' : '○'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Overall</span>
                  <span className="text-sm text-white font-semibold">
                    {Math.round(
                      (1 + 
                      (profile?.creator.bio ? 1 : 0) + 
                      (profile?.creator.niche.length > 0 ? 1 : 0) + 
                      (profile?.creator.youtubeChannelId ? 1 : 0)) / 4 * 100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.round(
                        (1 + 
                        (profile?.creator.bio ? 1 : 0) + 
                        (profile?.creator.niche.length > 0 ? 1 : 0) + 
                        (profile?.creator.youtubeChannelId ? 1 : 0)) / 4 * 100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

