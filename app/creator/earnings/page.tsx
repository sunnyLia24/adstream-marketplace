'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Wallet,
  PiggyBank,
  Building2,
} from 'lucide-react';

interface Deal {
  id: string;
  dealAmount: string;
  platformFee: string;
  creatorPayout: string;
  paymentTiming: 'UPFRONT' | 'AFTER_DELIVERY';
  paymentStatus: 'PENDING' | 'PAID' | 'PROCESSING' | 'FAILED' | 'REFUNDED';
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  createdAt: string;
  completedAt: string | null;
  brand: {
    companyName: string;
    logo: string | null;
    user: {
      name: string;
    };
  };
  bid: {
    contentListing: {
      title: string;
      topic: string;
    };
  };
  adSlot: {
    slotType: string;
  };
}

export default function CreatorEarnings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'year'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDeals();
    }
  }, [status]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDealsByPeriod = (deals: Deal[]) => {
    const now = new Date();
    return deals.filter((deal) => {
      const dealDate = new Date(deal.createdAt);
      if (selectedPeriod === 'month') {
        return dealDate.getMonth() === now.getMonth() && dealDate.getFullYear() === now.getFullYear();
      }
      if (selectedPeriod === 'year') {
        return dealDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const formatSlotType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pending' },
      PAID: { color: 'bg-green-500/20 text-green-400', text: 'Paid' },
      PROCESSING: { color: 'bg-blue-500/20 text-blue-400', text: 'Processing' },
      FAILED: { color: 'bg-red-500/20 text-red-400', text: 'Failed' },
      REFUNDED: { color: 'bg-gray-500/20 text-gray-400', text: 'Refunded' },
    };
    return badges[status] || badges.PENDING;
  };

  const filteredDeals = filterDealsByPeriod(deals);
  const completedDeals = filteredDeals.filter((d) => d.verificationStatus === 'APPROVED');
  const pendingDeals = filteredDeals.filter(
    (d) => d.verificationStatus === 'PENDING' || d.paymentStatus === 'PENDING'
  );

  // Calculate totals
  const totalEarned = completedDeals
    .filter((d) => d.paymentStatus === 'PAID')
    .reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);

  const pendingPayments = pendingDeals.reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);

  const totalPlatformFees = filteredDeals
    .filter((d) => d.verificationStatus === 'APPROVED')
    .reduce((sum, d) => sum + parseFloat(d.platformFee), 0);

  const totalGrossRevenue = filteredDeals
    .filter((d) => d.verificationStatus === 'APPROVED')
    .reduce((sum, d) => sum + parseFloat(d.dealAmount), 0);

  // Calculate month over month growth
  const now = new Date();
  const thisMonthDeals = deals.filter((d) => {
    const dealDate = new Date(d.createdAt);
    return dealDate.getMonth() === now.getMonth() && dealDate.getFullYear() === now.getFullYear();
  });
  const lastMonthDeals = deals.filter((d) => {
    const dealDate = new Date(d.createdAt);
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return dealDate.getMonth() === lastMonth && dealDate.getFullYear() === lastMonthYear;
  });

  const thisMonthEarnings = thisMonthDeals
    .filter((d) => d.verificationStatus === 'APPROVED')
    .reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);
  const lastMonthEarnings = lastMonthDeals
    .filter((d) => d.verificationStatus === 'APPROVED')
    .reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0);

  const growthPercentage = lastMonthEarnings > 0
    ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
    : thisMonthEarnings > 0 ? 100 : 0;

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
              <a href="/creator/earnings" className="text-white font-medium">Earnings</a>
              <a href="/creator/analytics" className="text-gray-400 hover:text-white transition">Analytics</a>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Earnings</h1>
            <p className="text-gray-300">Track your revenue and payment history</p>
          </div>
          <div className="flex gap-2">
            {(['all', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedPeriod === period
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {period === 'all' ? 'All Time' : period === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Earned</span>
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">${totalEarned.toFixed(2)}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {growthPercentage >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+{growthPercentage.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">{growthPercentage.toFixed(1)}%</span>
                </>
              )}
              <span className="text-gray-500">vs last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Pending Payments</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white">${pendingPayments.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">{pendingDeals.length} pending deals</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Gross Revenue</span>
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">${totalGrossRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">Before platform fees</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Platform Fees</span>
              <PiggyBank className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-3xl font-bold text-white">${totalPlatformFees.toFixed(2)}</div>
            <div className="text-sm text-gray-400 mt-1">20% of gross revenue</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Breakdown */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-6">Payment History</h2>

            {filteredDeals.filter((d) => d.verificationStatus === 'APPROVED' || d.paymentStatus !== 'PENDING').length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No payment history yet</p>
                <p className="text-gray-500 text-sm">
                  Completed deals will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDeals
                  .filter((d) => d.verificationStatus === 'APPROVED' || d.paymentStatus === 'PAID')
                  .map((deal) => {
                    const paymentBadge = getPaymentStatusBadge(deal.paymentStatus);
                    return (
                      <div
                        key={deal.id}
                        className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/10 hover:border-purple-500/30 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                              {deal.brand.companyName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{deal.brand.companyName}</p>
                              <p className="text-sm text-gray-400">
                                {formatSlotType(deal.adSlot.slotType)} • {deal.bid.contentListing.title}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">
                              +${parseFloat(deal.creatorPayout).toFixed(2)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${paymentBadge.color}`}>
                              {paymentBadge.text}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-500/10">
                          <span className="text-sm text-gray-500">
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Gross: ${parseFloat(deal.dealAmount).toFixed(2)}</span>
                            <span>Fee: -${parseFloat(deal.platformFee).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            {/* Average Deal Value */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg. Deal Value</span>
                  <span className="text-white font-semibold">
                    ${completedDeals.length > 0
                      ? (completedDeals.reduce((sum, d) => sum + parseFloat(d.creatorPayout), 0) / completedDeals.length).toFixed(2)
                      : '0.00'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Deals</span>
                  <span className="text-white font-semibold">{completedDeals.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-white font-semibold">${thisMonthEarnings.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Month</span>
                  <span className="text-white font-semibold">${lastMonthEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Top Brands */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Top Brands</h3>

              {completedDeals.length === 0 ? (
                <p className="text-gray-400 text-sm">No completed deals yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(
                    completedDeals.reduce((acc, deal) => {
                      const brandName = deal.brand.companyName;
                      if (!acc[brandName]) {
                        acc[brandName] = { count: 0, total: 0 };
                      }
                      acc[brandName].count++;
                      acc[brandName].total += parseFloat(deal.creatorPayout);
                      return acc;
                    }, {} as Record<string, { count: number; total: number }>)
                  )
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, 5)
                    .map(([brandName, data]) => (
                      <div key={brandName} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-semibold">
                            {brandName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{brandName}</p>
                            <p className="text-gray-500 text-xs">{data.count} deals</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-semibold">
                          ${data.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Payout Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-4">Payout Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300 text-sm">Stripe Connected</span>
                  </div>
                  <span className="text-yellow-400 text-sm">Not Set Up</span>
                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition">
                  Connect Stripe Account
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Connect your Stripe account to receive payouts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
