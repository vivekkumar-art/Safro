import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTrip } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import { mockOfferService } from '../services/mockOfferService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  CreditCard,
  QrCode,
  Building,
  Wallet,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Lock,
  Navigation,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { trips, credits, redeemCredits, updateTrip, setActiveTrip } = useTrip();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const trip = trips.find((t) => t.id === id) || trips[0];

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [couponCode, setCouponCode] = useState('SAFRO2026');
  const [couponDiscount, setCouponDiscount] = useState(trip?.appliedOfferDiscount || 1200);
  const [useCredits, setUseCredits] = useState(true);
  const creditsToApply = Math.min(credits, 1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!trip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Trip not found</h2>
        <Button onClick={() => navigate('/trips')} className="mt-4">
          Go to Trips
        </Button>
      </div>
    );
  }

  // Live calculations
  const baseCost = trip.estimatedCost;
  const totalDeductions = couponDiscount + (useCredits ? creditsToApply : 0);
  const payableAmount = Math.max(0, baseCost - totalDeductions);

  const handleApplyCoupon = () => {
    const res = mockOfferService.validateCoupon(couponCode, baseCost);
    if (res.valid) {
      setCouponDiscount(res.discount);
      showToast('Coupon Applied', res.message, 'success');
    } else {
      showToast('Coupon Invalid', res.message, 'error');
    }
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);

    // Simulate payment gateway delay (Razorpay/UPI flow)
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Deduct credits if used
    if (useCredits && creditsToApply > 0) {
      redeemCredits(creditsToApply, trip.id);
    }

    // Update trip status to active & paid
    updateTrip(trip.id, {
      isPaid: true,
      status: 'active',
      appliedOfferDiscount: couponDiscount,
      creditsUsed: useCredits ? creditsToApply : 0,
    });
    setActiveTrip(trip.id);

    setIsProcessing(false);
    setPaymentSuccess(true);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1267D6', '#19A974', '#F5A623', '#062B5C'],
      });
    } catch {
      // Confetti fallback
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          SAFRO SECURE CHECKOUT
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] tracking-tight">
          Complete Your Payment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lock in your reservations for {trip.destination} ({trip.durationDays} Days • {trip.travelers} Travelers)
        </p>
      </div>

      {paymentSuccess ? (
        /* Confirmation Screen */
        <Card className="p-8 sm:p-12 text-center bg-white border border-slate-100 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-[#19A974] flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white">
              Your Trip is Confirmed!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Get ready for an amazing journey with SAFRO. All bookings, transfers, and activities have been locked.
            </p>
          </div>

          {/* Confirmed Booking Details including Pickup & Drop */}
          <div className="p-5 rounded-3xl bg-[#F0F7FF] dark:bg-slate-800/90 border border-[#D8E9FF] dark:border-slate-700 max-w-md mx-auto text-xs text-left space-y-3.5 shadow-sm">
            {/* Boarding & Arrival Route Points */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Confirmed Route & Transit Points
              </span>

              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1 ring-2 ring-emerald-100 dark:ring-emerald-950" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    Pickup Point (Boarding)
                  </p>
                  <p className="font-bold text-[#031D3D] dark:text-white text-xs leading-snug">
                    {trip.pickupPoint || 'Delhi Kashmere Gate ISBT / IGI Airport T3'}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-200 dark:border-slate-700 ml-1 pl-4 py-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Transit: {trip.transportation}</span>
                <span>•</span>
                <span>{trip.travelStyle} Mode</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1 ring-2 ring-rose-100 dark:ring-rose-950" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                    Drop Point (Arrival Stay)
                  </p>
                  <p className="font-bold text-[#031D3D] dark:text-white text-xs leading-snug">
                    {trip.dropPoint || `${trip.destination} Resort & Activity Hub`}
                  </p>
                </div>
              </div>
            </div>

            {/* Trip logistics & Payment summary */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-bold text-[#031D3D] dark:text-white">
                <span>Destination:</span>
                <span>{trip.destination}, {trip.stateOrCountry}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Travel Dates:</span>
                <span>{trip.startDate} - {trip.endDate} ({trip.durationDays} Days)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Travelers:</span>
                <span>{trip.travelers} Persons</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 border-t border-[#D8E9FF] dark:border-slate-700 pt-1.5">
                <span>Amount Paid:</span>
                <span className="font-extrabold text-[#19A974] dark:text-emerald-400">
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
              </div>
              {useCredits && (
                <div className="flex justify-between text-[#1267D6] dark:text-blue-400 font-bold">
                  <span>Credits Redeemed:</span>
                  <span>₹{creditsToApply.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(`/trips/${trip.id}/live`)}
              rightIcon={<Navigation className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-lg shadow-[#1267D6]/25 font-bold"
            >
              Start Live Trip Monitoring
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="w-full sm:w-auto font-semibold"
            >
              View Full Itinerary
            </Button>
          </div>
        </Card>
      ) : (
        /* Payment Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Payment Methods & Discounts (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Offers & SAFRO Credits Card */}
            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#1267D6]" />
                Apply Offers & Wallet Credits
              </h3>

              {/* Coupon Code Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. SAFRO2026)"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    className="text-xs font-bold shrink-0"
                  >
                    Apply
                  </Button>
                </div>
                {couponDiscount > 0 && (
                  <p className="text-[11px] font-bold text-[#19A974] dark:text-emerald-400 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Coupon applied! You save ₹{couponDiscount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              {/* SAFRO Credits Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#EAF4FF]/60 dark:bg-blue-950/40 border border-[#D8E9FF] dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    id="use-credits"
                    type="checkbox"
                    checked={useCredits && credits > 0}
                    disabled={credits === 0}
                    onChange={(e) => setUseCredits(e.target.checked)}
                    className="w-4 h-4 text-[#1267D6] rounded border-slate-300 focus:ring-[#1267D6] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="use-credits"
                    className={`select-none ${credits > 0 ? 'cursor-pointer' : 'cursor-default opacity-80'}`}
                  >
                    <p className="text-xs font-bold text-[#062B5C] dark:text-white">
                      Use SAFRO Credits (₹{credits.toLocaleString('en-IN')} Available)
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {credits > 0
                        ? `Redeem ₹${creditsToApply.toLocaleString('en-IN')} on this trip`
                        : 'No credits available yet — earn on your first completed trip!'}
                    </p>
                  </label>
                </div>
                <span className="text-xs font-extrabold text-[#1267D6] dark:text-blue-400">
                  {credits > 0 ? `-₹${creditsToApply.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>
            </Card>

            {/* 2. Payment Method Selector */}
            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                Select Payment Method
              </h3>

              <div className="space-y-2.5">
                {[
                  { id: 'upi' as const, label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)', icon: QrCode },
                  { id: 'card' as const, label: 'Credit / Debit Card (Visa, Mastercard, RuPay)', icon: CreditCard },
                  { id: 'netbanking' as const, label: 'Net Banking (All Major Indian Banks)', icon: Building },
                  { id: 'wallet' as const, label: 'Other Wallets & PayLater', icon: Wallet },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1267D6] bg-[#EAF4FF]/40 dark:bg-blue-950/40'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#1267D6]' : 'text-slate-400 dark:text-slate-400'}`} />
                        <span className="text-xs sm:text-sm font-bold text-[#031D3D] dark:text-white">{m.label}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#1267D6] bg-[#1267D6]' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* UPI ID input simulation if UPI selected */}
              {paymentMethod === 'upi' && (
                <div className="pt-2 animate-in fade-in">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Virtual Payment Address (VPA) / UPI ID
                  </label>
                  <input
                    type="text"
                    defaultValue="aarav@okhdfcbank"
                    placeholder="username@upi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Right: Summary & Pay Button (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-gradient-to-br from-[#062B5C] to-[#031D3D] text-white shadow-xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Payment Summary
                </span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                  {trip.destination}
                </span>
              </div>

              {/* Transit Route Points in Payment Summary */}
              <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-emerald-300 uppercase font-bold">Pickup Point</p>
                    <p className="font-semibold text-white truncate text-xs" title={trip.pickupPoint || 'Pickup Point'}>
                      {trip.pickupPoint || 'Delhi Kashmere Gate / IGI Airport T3'}
                    </p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-white/20 ml-1 pl-3 py-0.5">
                  <span className="text-[10px] text-slate-300">
                    Transit: {trip.transportation} • {trip.travelStyle} Mode
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-rose-300 uppercase font-bold">Drop Point</p>
                    <p className="font-semibold text-white truncate text-xs" title={trip.dropPoint || trip.destination}>
                      {trip.dropPoint || `${trip.destination} Resort & Activity Hub`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Estimated Total:</span>
                  <span className="font-semibold text-white">
                    ₹{baseCost.toLocaleString('en-IN')}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Coupon ({couponCode}):</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {useCredits && creditsToApply > 0 && (
                  <div className="flex justify-between text-sky-300">
                    <span>SAFRO Credits:</span>
                    <span>-₹{creditsToApply.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] text-slate-300">Total Payable</span>
                  <h4 className="text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
                    ₹{payableAmount.toLocaleString('en-IN')}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">Total Saved</span>
                  <p className="text-xs font-bold text-emerald-400">
                    ₹{totalDeductions.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  size="lg"
                  variant="secondary"
                  isLoading={isProcessing}
                  onClick={handleProcessPayment}
                  className="w-full bg-[#1267D6] hover:bg-[#0E52AD] text-white font-bold text-sm shadow-xl shadow-black/20"
                >
                  {isProcessing ? 'Verifying with Bank...' : `Pay ₹${payableAmount.toLocaleString('en-IN')}`}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit SSL Encrypted & Bank Guaranteed</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
