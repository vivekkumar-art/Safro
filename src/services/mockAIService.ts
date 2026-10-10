import { NielMessage } from '../types';
import { NielDestinationRagService } from './nielDestinationRagService';

export const INITIAL_NIEL_MESSAGES: NielMessage[] = [
  {
    id: 'msg_01',
    sender: 'niel',
    timestamp: '10:14 AM',
    content: "Hi Aarav! I'm NIEL, your Pan-India AI Travel Intelligence companion. I'm connected to the authoritative destination database covering all 28 states & 8 UTs. Ask me about Kedarnath, Jaipur, Meghalaya waterfalls, trip circuits, permits, or travel budgets!",
    actions: [
      { label: 'Tell me about Kedarnath', actionType: 'view_itinerary' },
      { label: 'Waterfalls in Meghalaya', actionType: 'view_itinerary' },
      { label: 'Historical places in MP', actionType: 'view_itinerary' },
      { label: 'Compare HP vs Uttarakhand', actionType: 'view_itinerary' },
    ],
  },
];

export const mockAIService = {
  async processUserMessage(prompt: string, context?: { budget?: number; spent?: number; destination?: string }): Promise<NielMessage> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // First attempt Retrieval-Augmented Generation (RAG) across Pan-India Destination Database
    const ragResult = NielDestinationRagService.query(prompt, context);
    if (ragResult) {
      return ragResult.message;
    }

    const lower = prompt.toLowerCase();
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Weather query
    if (lower.includes('rain') || lower.includes('weather') || lower.includes('climate')) {
      return {
        id: `niel_${Date.now()}`,
        sender: 'niel',
        timestamp,
        content: 'Light rain is forecasted at 3:00 PM near Solang Valley. Your outdoor paragliding might experience a 45-minute pause. I recommend visiting the heated indoor Snow World Lounge located just 2.4 km ahead.',
        card: {
          type: 'weather',
          title: 'Weather Advisory — Solang Area',
          subtitle: 'Light rain & fog from 3:00 PM to 4:15 PM (14°C)',
          price: 'Free Shelter',
          savings: 'Avoid rain delay',
          imageUrl: '/assets/images/hero-mountains.jpg',
        },
        actions: [
          { label: 'Accept Indoor Alternative', actionType: 'accept_alt' },
          { label: 'Keep Original Schedule', actionType: 'view_itinerary' },
        ],
      };
    }

    // Traffic / Route query
    if (lower.includes('traffic') || lower.includes('route') || lower.includes('delay') || lower.includes('eta')) {
      return {
        id: `niel_${Date.now()}`,
        sender: 'niel',
        timestamp,
        content: 'I detected heavy vehicular buildup before Palchan Bridge on NH3 (+26 min delay). I discovered a scenic bypass route through Old Burua Road that saves 18 minutes and offers better pine valley views.',
        card: {
          type: 'activity',
          title: 'Palchan Bypass Route Available',
          subtitle: 'Save 18 mins • 4.2 km pine valley path',
          price: 'ETA: 1h 28m',
          savings: '+18 min saved',
        },
        actions: [
          { label: 'Switch to Bypass Route', actionType: 'accept_alt' },
          { label: 'Stay on Highway NH3', actionType: 'view_itinerary' },
        ],
      };
    }

    // Cheaper hotel / Stay query
    if (lower.includes('hotel') || lower.includes('cheaper') || lower.includes('stay') || lower.includes('resort')) {
      return {
        id: `niel_${Date.now()}`,
        sender: 'niel',
        timestamp,
        content: 'I found 3 verified boutique stays near your destination that match your Balanced travel style and save up to ₹1,400 per night while maintaining a 4.8★ guest rating.',
        card: {
          type: 'hotel',
          title: 'Pine Wood Riverside Retreat',
          subtitle: 'Old Manali • Mountain View & Breakfast included',
          price: '₹3,100 / night',
          savings: 'Save ₹1,400',
          imageUrl: '/assets/images/manali-resort.jpg',
        },
        actions: [
          { label: 'View Deal & Reserve', actionType: 'book_hotel' },
          { label: 'Compare Stays', actionType: 'view_itinerary' },
        ],
      };
    }

    // Budget / Expense query
    if (lower.includes('budget') || lower.includes('spent') || lower.includes('cost') || lower.includes('money')) {
      const budget = context?.budget || 25000;
      const spent = context?.spent || 18400;
      const remaining = Math.max(0, budget - spent);
      const percent = Math.round((spent / budget) * 100);

      return {
        id: `niel_${Date.now()}`,
        sender: 'niel',
        timestamp,
        content: `You have spent ₹${spent.toLocaleString('en-IN')} (${percent}%) of your total ₹${budget.toLocaleString('en-IN')} budget. You have ₹${remaining.toLocaleString('en-IN')} remaining. If you keep your daily spending under ₹3,300, you will earn ₹${remaining.toLocaleString('en-IN')} in SAFRO Credits when completing this trip!`,
        card: {
          type: 'budget',
          title: 'Budget Health Check',
          subtitle: `${100 - percent}% funds safe for upcoming activities`,
          price: `₹${remaining.toLocaleString('en-IN')} remaining`,
          savings: `Eligible for ₹${remaining.toLocaleString('en-IN')} credits`,
        },
        actions: [
          { label: 'Add New Expense', actionType: 'add_expense' },
          { label: 'View Category Breakdown', actionType: 'view_itinerary' },
        ],
      };
    }

    // Plan trip query
    if (lower.includes('plan') || lower.includes('trip') || lower.includes('goa') || lower.includes('kashmir')) {
      return {
        id: `niel_${Date.now()}`,
        sender: 'niel',
        timestamp,
        content: "I'd love to craft an itinerary for you! I will optimize travel times, match your interests, apply applicable discount coupons, and keep your budget in check.",
        actions: [
          { label: 'Launch New Trip Wizard', actionType: 'plan_trip' },
          { label: 'Explore Kashmir Escapes', actionType: 'plan_trip' },
        ],
      };
    }

    // Default intelligent response
    return {
      id: `niel_${Date.now()}`,
      sender: 'niel',
      timestamp,
      content: `I've analyzed your travel context: your current destination is ${context?.destination || 'Manali'}. Weather is optimal, your route is monitored with live GPS, and all reservations are synchronized. What else would you like me to fine-tune?`,
      actions: [
        { label: 'Show What to Visit Next', actionType: 'view_itinerary' },
        { label: 'Check Discount Coupons', actionType: 'apply_coupon' },
      ],
    };
  },
};
