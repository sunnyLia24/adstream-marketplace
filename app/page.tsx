import { ArrowRight, TrendingUp, DollarSign, Calendar, BarChart3, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            <span className="text-2xl font-bold text-white">AdStream</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition px-4 py-2">
              How It Works
            </button>
            <button className="text-gray-300 hover:text-white transition px-4 py-2">
              Pricing
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <span className="text-purple-300 text-sm font-medium">Programmatic Creator Advertising</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Connect Brands with<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              YouTube Creators
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            The first marketplace where creators schedule content and brands bid on ad placements. 
            Transparent, efficient, and built for the creator economy.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center gap-2 transition shadow-lg shadow-purple-500/50">
              I am a Creator
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border border-purple-500/30 transition">
              I am a Brand
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-800/50 backdrop-blur-sm border-y border-purple-500/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              $2.5M+
            </div>
            <div className="text-gray-300">Total Deal Volume</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              1,200+
            </div>
            <div className="text-gray-300">Active Creators</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
              450+
            </div>
            <div className="text-gray-300">Brand Partners</div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Creators
            </h2>
            <p className="text-xl text-gray-300">
              Monetize your content calendar like never before
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Schedule Content</h3>
              <p className="text-gray-300">
                List your upcoming videos with topics, expected reach, and available ad slots
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Receive Bids</h3>
              <p className="text-gray-300">
                Brands bid on your ad slots. Review offers and accept the ones that fit your brand
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Get Paid</h3>
              <p className="text-gray-300">
                Create the content, verify delivery, and receive payment directly to your account
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              For Brands
            </h2>
            <p className="text-xl text-gray-300">
              Find the perfect creators and place winning bids
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Discover Creators</h3>
              <p className="text-gray-300">
                Search by niche, audience size, demographics, and engagement metrics
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Place Bids</h3>
              <p className="text-gray-300">
                Bid on ad slots that match your campaign goals and budget
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition">
              <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Results</h3>
              <p className="text-gray-300">
                Monitor content delivery and campaign performance in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators and brands building better partnerships
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg transition">
              Create Account
            </button>
            <button className="bg-purple-800 hover:bg-purple-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition border border-white/20">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-xl font-bold text-white">AdStream</span>
            </div>
            <p className="text-gray-400">
              The future of creator advertising
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-purple-500/20 text-center text-gray-400">
          <p>&copy; 2024 AdStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
