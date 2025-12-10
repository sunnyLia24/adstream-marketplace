'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Users,
  Eye,
  Video,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface ContentListing {
  id: string;
  title: string;
  topic: string;
  plannedPublishDate: string;
  status: string;
  adSlots: Array<{
    id: string;
    slotType: string;
    reservePrice: string;
    status: string;
  }>;
  bids: Array<{
    id: string;
    bidAmount: string;
    status: string;
  }>;
}

interface Deal {
  id: string;
  dealAmount: string;
  creatorPayout: string;
  verificationStatus: string;
  paymentStatus: string;
  createdAt: string;
  adSlot: {
    slotType: string;
  };
}

interface Profile {
  stats: {
    totalEarnings: number;
    activeBids: number;
    upcomingContent: number;
  };
}

export default function CreatorAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ContentListing[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, dealsRes, profileRes] = await Promise.all([
        fetch('/api/creators/content-listings'),
        fetch('/api/deals'),
        fetch('/api/creators/profile'),
      ]);

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData);
      }
      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        setDeals(dealsData);
      }
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSlotType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Calculate metrics
  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.status === 'ACTIVE').length;
  const totalBids = listings.reduce((sum, l) => sum + (l.bids?.length || 0), 0);
  const pendingBids = listings.reduce(
    (sum, l) => sum + (l.bids?.filter((b) => b.status === 'PENDING').length || 0),
    0
  );
  const acceptedBids = listings.reduce(
    (sum, l) => sum + (l.bids?.filter((b) => b.status === 'ACCEPTED').length || 0),
    0
  );

  const totalDeals = deals.length;
  const completedDeals = deals.filter((d) => d.verificationStatus === 'APPROVED').length;
  const totalEarnings = deals
    .filter((d) => d.verificationStatus === 'APPROVED')
    .reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);

  // Calculate bid acceptance rate
  const bidAcceptanceRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0;

  // Calculate conversion rate (listings that got at least one deal)
  const listingsWithDeals = new Set(deals.map((d) => d.id)).size;
  const conversionRate = totalListings > 0 ? (listingsWithDeals / totalListings) * 100 : 0;

  // Calculate avg bid amount
  const allBids = listings.flatMap((l) => l.bids || []);
  const avgBidAmount = allBids.length > 0
    ? allBids.reduce((sum, b) => sum + parseFloat(b.bidAmount), 0) / allBids.length
    : 0;

  // Calculate avg deal value
  const avgDealValue = completedDeals > 0 ? totalEarnings / completedDeals : 0;

  // Ad slot performance
  const slotPerformance = listings
    .flatMap((l) => l.adSlots || [])
    .reduce((acc, slot) => {
      if (!acc[slot.slotType]) {
        acc[slot.slotType] = { count: 0, sold: 0 };
      }
      acc[slot.slotType].count++;
      if (slot.status === 'SOLD' || slot.status === 'COMPLETED') {
        acc[slot.slotType].sold++;
      }
      return acc;
    }, {} as Record<string, { count: number; sold: number }>);

  // Topic distribution
  const topicDistribution = listings.reduce((acc, listing) => {
    const topic = listing.topic;
    if (!acc[topic]) {
      acc[topic] = { count: 0, bids: 0 };
    }
    acc[topic].count++;
    acc[topic].bids += listing.bids?.length || 0;
    return acc;
  }, {} as Record<string, { count: number; bids: number }>);

  // Monthly earnings trend (last 6 months)
  const monthlyEarnings: { month: string; earnings: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const monthEarnings = deals
      .filter((d) => {
        const dealDate = new Date(d.createdAt);
        return (
          dealDate.getMonth() === date.getMonth() &&
          dealDate.getFullYear() === date.getFullYear() &&
          d.verificationStatus === 'APPROVED'
        );
      })
      .reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);
    monthlyEarnings.push({ month: monthName, earnings: monthEarnings });
  }

  const maxMonthlyEarnings = Math.max(...monthlyEarnings.map((m) => m.earnings), 1);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
              <a href="/creator/bids" className="text-gray-400 hover:text-white transition">Bids</a>
              <a href="/creator/deals" className="text-gray-400 hover:text-white transition">Deals</a>
              <a href="/creator/earnings" className="text-gray-400 hover:text-white transition">Earnings</a>
              <a href="/creator/analytics" className="text-white font-medium">Analytics</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/creator/profile" className="text-gray-400 hover:text-white transition">Profile</a>
            <span className="text-gray-300">{session?.user?.name}</span>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-300">Track your performance and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Bid Acceptance Rate</span>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{bidAcceptanceRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400 mt-1">{acceptedBids} of {totalBids} bids</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Avg. Bid Amount</span>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">${avgBidAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">From {allBids.length} total bids</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Avg. Deal Value</span>
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">${avgDealValue.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">Your avg. payout</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Deal Completion</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {totalDeals > 0 ? ((completedDeals / totalDeals) * 100).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-400 mt-1">{completedDeals} of {totalDeals} deals</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Earnings Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Earnings Trend</h2>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>

            <div className="flex items-end justify-between h-48 gap-4">
              {monthlyEarnings.map((month, index) => (
                <div key={month.month} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-2">${month.earnings.toFixed(0)}</span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${Math.max((month.earnings / maxMonthlyEarnings) * 150, 4)}px`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 mt-2">{month.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-6">Overview</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Total Listings</span>
                </div>
                <span className="text-white font-semibold">{totalListings}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Active Listings</span>
                </div>
                <span className="text-white font-semibold">{activeListings}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Pending Bids</span>
                </div>
                <span className="text-white font-semibold">{pendingBids}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Total Earned</span>
                </div>
                <span className="text-white font-semibold">${totalEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Slot Performance */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Ad Slot Performance</h2>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>

            {Object.keys(slotPerformance).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No ad slots created yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(slotPerformance).map(([slotType, data]) => {
                  const sellRate = data.count > 0 ? (data.sold / data.count) * 100 : 0;
                  return (
                    <div key={slotType}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">{formatSlotType(slotType)}</span>
                        <span className="text-white text-sm">
                          {data.sold}/{data.count} sold ({sellRate.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                          style={{ width: `${sellRate}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content Topics */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Content Topics</h2>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>

            {Object.keys(topicDistribution).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No content listings yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(topicDistribution)
                  .sort((a, b) => b[1].bids - a[1].bids)
                  .slice(0, 6)
                  .map(([topic, data]) => (
                    <div
                      key={topic}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{topic}</p>
                        <p className="text-sm text-gray-400">{data.count} listings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-semibold">{data.bids} bids</p>
                        <p className="text-xs text-gray-400">
                          {data.count > 0 ? (data.bids / data.count).toFixed(1) : 0} avg
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-bold text-white mb-4">Performance Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bidAcceptanceRate < 50 && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="font-medium">Improve Acceptance Rate</span>
                </div>
                <p className="text-sm text-gray-400">
                  Your bid acceptance rate is below 50%. Consider reviewing more bids or adjusting your reserve prices.
                </p>
              </div>
            )}
            {activeListings === 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                  <Video className="w-5 h-5" />
                  <span className="font-medium">Create More Listings</span>
                </div>
                <p className="text-sm text-gray-400">
                  You don&apos;t have any active listings. Create new content listings to attract brand sponsorships.
                </p>
              </div>
            )}
            {pendingBids > 5 && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Review Pending Bids</span>
                </div>
                <p className="text-sm text-gray-400">
                  You have {pendingBids} pending bids waiting for review. Respond quickly to maintain good relationships with brands.
                </p>
              </div>
            )}
            {totalListings > 0 && totalBids === 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-pink-400 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Optimize Your Listings</span>
                </div>
                <p className="text-sm text-gray-400">
                  Your listings haven&apos;t received bids yet. Try improving your descriptions or adjusting reserve prices.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
