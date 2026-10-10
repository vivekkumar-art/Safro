import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const { offers, activeTrip, updateTrip } = useTrip();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleApplyOffer = (offerId: string, code: string, discount: number) => {
    if (!activeTrip) {
      showToast('No Active Trip', 'Please plan or select a trip to apply offers.', 'info');
      navigate('/trips/new');
      return;
    }

    updateTrip(activeTrip.id, {
      appliedOfferId: offerId,
      appliedOfferDiscount: discount,
    });

    showToast(
      'Offer Applied!',
      `Coupon ${code} applied to ${activeTrip.destination}. You saved ₹${discount.toLocaleString('en-IN')}!`,
      'success'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          EXCLUSIVE TRAVEL DISCOUNTS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
          Offers & Coupons
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
          Curated partner deals automatically applied to your AI-optimized trip packages
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => {
          const isApplied = activeTrip?.appliedOfferId === offer.id;

          return (
            <Card
              key={offer.id}
              className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Image */}
                <div className="relative aspect-[16/8] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={offer.imageUrl || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80'}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold bg-[#062B5C] text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {offer.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold shadow-md">
                    {offer.discountPercent
                      ? `${offer.discountPercent}% OFF`
                      : `₹${offer.discountAmount.toLocaleString('en-IN')} OFF`}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1267D6] tracking-wide">
                        CODE: {offer.code}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Valid till {offer.validUntil}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#031D3D] dark:text-white mt-1">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">Minimum Trip Spend:</span>
                    <span className="font-bold text-[#031D3D] dark:text-white">
                      ₹{offer.minSpend.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                {isApplied ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 pointer-events-none"
                    leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  >
                    Applied on {activeTrip?.destination}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleApplyOffer(offer.id, offer.code, offer.discountAmount)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full text-xs font-bold shadow-sm"
                  >
                    Apply to {activeTrip?.destination || 'Active Trip'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
