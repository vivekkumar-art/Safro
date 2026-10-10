import { Offer } from '../types';

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off_safro_2026',
    code: 'SAFRO2026',
    title: 'SAFRO Launch Celebration',
    discountAmount: 1200,
    category: 'All',
    minSpend: 15000,
    validUntil: '31 Dec 2026',
    description: 'Flat ₹1,200 discount on your complete AI-planned vacation package.',
    tag: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'off_hotel_1000',
    code: 'STAY1000',
    title: 'Himalayan Luxury Stays',
    discountAmount: 1000,
    category: 'Hotel',
    minSpend: 5000,
    validUntil: '28 Feb 2027',
    description: 'Save ₹1,000 on partner hill resort bookings with complimentary breakfast.',
    tag: 'Resort Special',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'off_dine_20',
    code: 'DINE20',
    title: 'Gourmet Travel Dining',
    discountAmount: 600,
    discountPercent: 20,
    category: 'Restaurant',
    minSpend: 2000,
    validUntil: '15 Jan 2027',
    description: '20% off (up to ₹800) at top-rated local cafes and scenic restaurants.',
    tag: 'Foodie Choice',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'off_act_300',
    code: 'ADVENTURE300',
    title: 'Adventure & Water Sports',
    discountAmount: 300,
    category: 'Activity',
    minSpend: 1500,
    validUntil: '31 Mar 2027',
    description: 'Flat ₹300 off on paragliding, river rafting, and trekking guides.',
    tag: 'Thrills',
    imageUrl: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=600&q=80',
  },
];

export const mockOfferService = {
  getOffers(): Offer[] {
    return INITIAL_OFFERS;
  },

  validateCoupon(code: string, totalAmount: number): { valid: boolean; offer?: Offer; discount: number; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const offer = INITIAL_OFFERS.find((o) => o.code.toUpperCase() === cleanCode);

    if (!offer) {
      return {
        valid: false,
        discount: 0,
        message: 'Invalid promo code. Try SAFRO2026 or STAY1000.',
      };
    }

    if (totalAmount < offer.minSpend) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum spend of ₹${offer.minSpend.toLocaleString('en-IN')} required for coupon ${cleanCode}.`,
      };
    }

    let discount = offer.discountAmount;
    if (offer.discountPercent) {
      discount = Math.min(800, Math.round((totalAmount * offer.discountPercent) / 100));
    }

    return {
      valid: true,
      offer,
      discount,
      message: `Coupon "${cleanCode}" applied! You saved ₹${discount.toLocaleString('en-IN')}.`,
    };
  },
};
