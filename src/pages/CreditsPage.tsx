import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Wallet,
  Coins,
  ArrowRight,
  Clock,
  Repeat,
} from 'lucide-react';

export const CreditsPage: React.FC = () => {
  const { credits, transactions } = useTrip();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          SAFRO REWARD WALLET
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
          SAFRO Credits
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
          Real rupee savings earned by traveling smart. Redeem 1:1 on any upcoming trip booking.
        </p>
      </div>

      {/* Main Balance Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#062B5C] via-[#031D3D] to-[#0A3D7C] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                    <Wallet className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Active Wallet
                    </span>
                    <span className="text-[10px] text-emerald-300 font-semibold">1 Credit = ₹1 INR</span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-[#19A974]/20 border border-[#19A974]/40 text-emerald-300 px-3 py-1 rounded-full">
                  Fully Verified
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-300 font-medium">Available Balance</p>
                <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mt-1">
                  ₹{credits.toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-blue-200 mt-1">
                  Ready to be automatically deducted on your next checkout
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
              <Button
                variant="white"
                size="md"
                onClick={() => navigate('/trips/new')}
                rightIcon={<ArrowRight className="w-4 h-4 text-[#1267D6]" />}
                className="text-black font-bold text-xs shadow-md"
              >
                Plan Trip with Credits
              </Button>
            </div>
          </Card>
        </div>

        {/* The SAFRO Loop Card (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="w-5 h-5 text-[#1267D6]" />
                <h3 className="text-sm font-extrabold text-[#031D3D] dark:text-white uppercase tracking-wider">
                  The SAFRO Loop
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                How our AI-powered travel cycle saves you money on every adventure:
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { step: '1. Plan & Budget', desc: 'NIEL AI designs your journey with precise spending caps' },
                { step: '2. Live Monitoring', desc: 'Get rerouted around delays and expensive traps' },
                { step: '3. Save & Earn', desc: 'Any money saved below budget converts into credits' },
                { step: '4. Reinvest & Travel', desc: 'Redeem credits directly to discount future trips' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1267D6] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-[#031D3D] dark:text-white">{item.step}</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-extrabold text-[#031D3D] dark:text-white">Credits History & Transactions</h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {transactions.length} Total Events
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#031D3D] dark:text-white">
                No Transactions Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Your wallet starts with ₹0. When you plan and complete trips under budget with NIEL AI, your savings will be automatically credited here!
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/trips/new')}
              className="text-xs font-bold mt-2"
            >
              Plan Your First Trip
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isEarned = tx.type === 'earned';
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isEarned
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">
                        {tx.description}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {tx.date}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm sm:text-base font-extrabold shrink-0 ${
                      isEarned ? 'text-[#19A974] dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {isEarned ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
