import { Trip, TripDay, TravelStyle, TransportType } from '../types';
import { safeLocalStorage } from './storageHelper';
import { destinationDatabase } from './destinationDatabase';

const TRIPS_STORAGE_KEY = 'safro_trips_data';

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip_manali_01',
    title: 'Manali Adventure & Solang Escape',
    destination: 'Manali',
    stateOrCountry: 'Himachal Pradesh, India',
    pickupPoint: 'Delhi Kashmere Gate ISBT / IGI Airport T3',
    dropPoint: 'Sterling Himalayan Resort, Old Manali',
    description: 'Snow-capped peaks, Solang Valley thrilling adventure sports, tranquil riverside cafes, and cedar forest walks.',
    imageUrl: '/assets/images/manali-resort.jpg',
    startDate: '12 Dec 2026',
    endDate: '15 Dec 2026',
    durationDays: 4,
    travelers: 2,
    travelStyle: 'Balanced',
    transportation: 'Car',
    interests: ['Nature', 'Adventure', 'Food'],
    budget: 25000,
    estimatedCost: 22800,
    actualSpent: 18400,
    appliedOfferId: 'off_safro_2026',
    appliedOfferDiscount: 1200,
    creditsUsed: 1000,
    status: 'active',
    isPaid: true,
    liveStatus: {
      currentLocationName: 'En route to Solang Valley (NH3)',
      destinationName: 'Solang Valley Adventure Point',
      etaNormal: '1h 20m',
      etaCurrent: '1h 46m',
      delayMinutes: 26,
      currentSpeedKmH: 38,
      weatherAlert: {
        icon: 'CloudRain',
        temp: '14°C',
        condition: 'Scattered Light Showers',
        alertMessage: 'Rain expected near upper Solang around 3:00 PM. Indoor snow sports center available 2.4 km ahead.',
      },
      trafficAlert: {
        level: 'heavy',
        message: 'Congestion on NH3 before Palchan bridge. Faster scenic bypass available.',
        alternativeAvailable: true,
        savedMinutes: 18,
      },
      vehicleCoords: [32.2798, 77.1685],
      destinationCoords: [32.3168, 77.1578],
      waypoints: [
        [32.2396, 77.1887], // Manali Town
        [32.2612, 77.1820], // Bahang
        [32.2798, 77.1685], // Current vehicle pos
        [32.3021, 77.1610], // Palchan bypass
        [32.3168, 77.1578], // Solang Valley
      ],
    },
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival & Old Manali Heritage Stroll',
        date: '12 Dec 2026',
        activities: [
          {
            id: 'act_1_1',
            time: '11:30 AM',
            title: 'Check-in at Sterling Himalayan Resort',
            location: 'Prini, Manali',
            duration: '1.5 hrs',
            estimatedCost: 4500,
            category: 'Stay',
            notes: 'Mountain valley view room with fireplace',
            isCompleted: true,
          },
          {
            id: 'act_1_2',
            time: '01:30 PM',
            title: 'Lunch at Cafe 1947',
            location: 'Old Manali Bridge',
            duration: '1 hr',
            estimatedCost: 850,
            category: 'Food',
            notes: 'Try wood-fired pizza and hot apple cider by the river',
            isCompleted: true,
          },
          {
            id: 'act_1_3',
            time: '03:30 PM',
            title: 'Visit Historic Hadimba Temple & Cedar Grove',
            location: 'Dhungri Forest',
            duration: '2 hrs',
            estimatedCost: 200,
            category: 'Activities',
            notes: 'Ancient pagoda-style wooden temple built in 1553',
            isCompleted: true,
          },
          {
            id: 'act_1_4',
            time: '07:30 PM',
            title: 'Mall Road Evening Walk & Himachali Dinner',
            location: 'The Mall, Manali',
            duration: '2.5 hrs',
            estimatedCost: 1200,
            category: 'Food',
            notes: 'Trout fish delicacy and local woolen handicraft market',
            isCompleted: true,
          },
        ],
      },
      {
        dayNumber: 2,
        title: 'Solang Valley Adventure & Cable Car',
        date: '13 Dec 2026',
        activities: [
          {
            id: 'act_2_1',
            time: '09:00 AM',
            title: 'Drive from Manali to Solang Valley',
            location: 'NH3 Highway',
            duration: '1 hr',
            estimatedCost: 1200,
            category: 'Transport',
            notes: 'Scenic pine road; vehicle currently en route',
            isCompleted: false,
          },
          {
            id: 'act_2_2',
            time: '10:30 AM',
            title: 'Solang Valley Paragliding & Ropeway Gondola',
            location: 'Solang Valley Adventure Park',
            duration: '3 hrs',
            estimatedCost: 3500,
            category: 'Activities',
            notes: 'Tandem paragliding with certified pilot and aerial footage',
            isCompleted: false,
          },
          {
            id: 'act_2_3',
            time: '02:00 PM',
            title: 'Lunch at Alpine Valley Bistro',
            location: 'Solang Meadow',
            duration: '1 hr',
            estimatedCost: 900,
            category: 'Food',
            notes: 'Hot Maggi, momos, and traditional siddu bread',
            isCompleted: false,
          },
          {
            id: 'act_2_4',
            time: '04:00 PM',
            title: 'Atal Tunnel South Portal Exploration',
            location: 'Dhundi',
            duration: '2 hrs',
            estimatedCost: 500,
            category: 'Activities',
            notes: 'World longest highway tunnel above 10,000 feet',
            isCompleted: false,
          },
        ],
      },
      {
        dayNumber: 3,
        title: 'Jogini Waterfall Trek & Vashisht Hot Springs',
        date: '14 Dec 2026',
        activities: [
          {
            id: 'act_3_1',
            time: '08:30 AM',
            title: 'Morning Yoga & Scenic Trek to Jogini Falls',
            location: 'Vashisht Village',
            duration: '3.5 hrs',
            estimatedCost: 400,
            category: 'Activities',
            notes: 'Breathtaking 160-foot cascading stream and apple orchards',
            isCompleted: false,
          },
          {
            id: 'act_3_2',
            time: '01:00 PM',
            title: 'Therapeutic Bath in Natural Sulphur Springs',
            location: 'Vashisht Temple Baths',
            duration: '1.5 hrs',
            estimatedCost: 150,
            category: 'Activities',
            notes: 'Centuries-old hot natural spring water with mineral healing properties',
            isCompleted: false,
          },
          {
            id: 'act_3_3',
            time: '03:30 PM',
            title: 'Artisan Cafe Experience at Lazy Dog',
            location: 'Manu Temple Road',
            duration: '2 hrs',
            estimatedCost: 1100,
            category: 'Food',
            notes: 'Live acoustic music and riverside seating',
            isCompleted: false,
          },
        ],
      },
      {
        dayNumber: 4,
        title: 'Naggar Castle & Souvenir Shopping & Departure',
        date: '15 Dec 2026',
        activities: [
          {
            id: 'act_4_1',
            time: '10:00 AM',
            title: 'Explore 500-Year-Old Naggar Castle & Art Gallery',
            location: 'Naggar Heritage Town',
            duration: '2 hrs',
            estimatedCost: 600,
            category: 'Activities',
            notes: 'Nicholas Roerich art collection and Beas River panoramic terrace',
            isCompleted: false,
          },
          {
            id: 'act_4_2',
            time: '01:30 PM',
            title: 'Farewell Organic Feast & Orchard Honey Tasting',
            location: 'Nightingale Italian & Woodfire',
            duration: '1.5 hrs',
            estimatedCost: 1300,
            category: 'Food',
            notes: 'Artisanal cheese platters and fresh Kullu apple preserves',
            isCompleted: false,
          },
          {
            id: 'act_4_3',
            time: '04:00 PM',
            title: 'Check-out & Return Journey Departure',
            location: 'Bhuntar / Volvo Bus Stand',
            duration: '1 hr',
            estimatedCost: 1800,
            category: 'Transport',
            notes: 'SAFRO private return cab to terminal',
            isCompleted: false,
          },
        ],
      },
    ],
  },
  {
    id: 'trip_goa_02',
    title: 'Goa Coastal Serenity & Heritage Trails',
    destination: 'Goa',
    stateOrCountry: 'Goa, India',
    pickupPoint: 'Dabolim International Airport (GOI) / Madgaon Jn',
    dropPoint: 'Candolim Beach Resort & Heritage Quarter, North Goa',
    description: 'Golden beaches, Portuguese heritage architecture in Fontainhas, sunset river cruises, and vibrant coastal cuisine.',
    imageUrl: '/assets/images/goa.jpg',
    startDate: '20 Jan 2027',
    endDate: '24 Jan 2027',
    durationDays: 5,
    travelers: 2,
    travelStyle: 'Balanced',
    transportation: 'Public',
    interests: ['Food', 'Culture', 'Relaxation'],
    budget: 35000,
    estimatedCost: 32000,
    actualSpent: 0,
    appliedOfferId: 'off_safro_2026',
    appliedOfferDiscount: 1200,
    creditsUsed: 500,
    status: 'planned',
    isPaid: true,
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival in North Goa & Anjuna Sunset',
        date: '20 Jan 2027',
        activities: [
          {
            id: 'act_g1',
            time: '01:00 PM',
            title: 'Resort Check-in at Candolim Beach Resort',
            location: 'Candolim',
            duration: '2 hrs',
            estimatedCost: 6500,
            category: 'Stay',
          },
          {
            id: 'act_g2',
            time: '05:30 PM',
            title: 'Sunset Drinks & Seafood at Curlies',
            location: 'Anjuna Beach',
            duration: '2.5 hrs',
            estimatedCost: 1600,
            category: 'Food',
          },
        ],
      },
    ],
  },
  {
    id: 'trip_rishikesh_03',
    title: 'Rishikesh Spiritual Haven & River Rafting',
    destination: 'Rishikesh',
    stateOrCountry: 'Uttarakhand, India',
    pickupPoint: 'Jolly Grant Airport (DED) / Haridwar Railway Junction',
    dropPoint: 'Tapovan Riverside Camp & Yoga Sanctuary, Rishikesh',
    description: 'Holy Ganges Ganga Aarti at Triveni Ghat, Grade 4 white water rapids, cliff jumping, and serene cliffside ashrams.',
    imageUrl: '/assets/images/rishikesh.jpg',
    startDate: '10 Nov 2026',
    endDate: '13 Nov 2026',
    durationDays: 3,
    travelers: 2,
    travelStyle: 'Budget',
    transportation: 'Car',
    interests: ['Adventure', 'Culture', 'Nature'],
    budget: 20000,
    estimatedCost: 18500,
    actualSpent: 16800,
    appliedOfferDiscount: 500,
    creditsUsed: 0,
    status: 'completed',
    isPaid: true,
    itinerary: [],
  },
];

export const POPULAR_DESTINATIONS = [
  {
    id: 'dest_manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    tagline: 'Snow peaks & mountain pine adventures',
    imageUrl: '/assets/images/manali-resort.jpg',
    avgBudget: 22000,
    rating: 4.9,
    bestSeason: 'Oct - Mar',
    tags: ['Mountains', 'Adventure', 'Snow'],
    defaultPickup: 'Delhi Kashmere Gate ISBT / IGI Airport T3',
    defaultDrop: 'Sterling Himalayan Resort, Old Manali',
  },
  {
    id: 'dest_goa',
    name: 'Goa',
    state: 'Goa',
    country: 'India',
    tagline: 'Sun-drenched beaches & colonial heritage',
    imageUrl: '/assets/images/goa.jpg',
    avgBudget: 28000,
    rating: 4.8,
    bestSeason: 'Nov - Feb',
    tags: ['Beach', 'Nightlife', 'Food'],
    defaultPickup: 'Goa Dabolim Airport / Madgaon Station',
    defaultDrop: 'Taj Fort Aguada Resort, Candolim, North Goa',
  },
  {
    id: 'dest_rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    tagline: 'Yoga capital & thrilling white water rafting',
    imageUrl: '/assets/images/rishikesh.jpg',
    avgBudget: 18000,
    rating: 4.9,
    bestSeason: 'Sep - Apr',
    tags: ['Spiritual', 'Rafting', 'Nature'],
    defaultPickup: 'Dehradun Airport / Haridwar Railway Station',
    defaultDrop: 'Aloha On The Ganges, Tapovan, Rishikesh',
  },
  {
    id: 'dest_kashmir',
    name: 'Kashmir',
    state: 'Jammu & Kashmir',
    country: 'India',
    tagline: 'Paradise on earth with Dal Lake Shikara rides',
    imageUrl: '/assets/images/kashmir.jpg',
    avgBudget: 35000,
    rating: 5.0,
    bestSeason: 'All Year',
    tags: ['Luxury', 'Romance', 'Valley'],
    defaultPickup: 'Sheikh ul-Alam International Airport, Srinagar',
    defaultDrop: 'Mascot Luxury Houseboats, Nigeen Lake, Srinagar',
  },
  {
    id: 'dest_meghalaya',
    name: 'Meghalaya',
    state: 'Meghalaya',
    country: 'India',
    tagline: 'Living root bridges & cleanest waterfalls',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    avgBudget: 30000,
    rating: 4.8,
    bestSeason: 'Oct - Apr',
    tags: ['Waterfalls', 'Hiking', 'Caves'],
    defaultPickup: 'Guwahati Airport / Railway Station',
    defaultDrop: 'Polo Orchid Resort, Cherrapunjee, Meghalaya',
  },
  {
    id: 'dest_sikkim',
    name: 'Sikkim',
    state: 'Sikkim',
    country: 'India',
    tagline: 'Majestic Kanchenjunga & Buddhist monasteries',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    avgBudget: 27000,
    rating: 4.7,
    bestSeason: 'Mar - May',
    tags: ['Himalayas', 'Culture', 'Scenic'],
    defaultPickup: 'Bagdogra Airport / NJP Railway Station',
    defaultDrop: 'Mayfair Spa Resort & Casino, Gangtok, Sikkim',
  },
  {
    id: 'dest_darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    tagline: 'Emerald tea plantations & toy train heritage',
    imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    avgBudget: 20000,
    rating: 4.7,
    bestSeason: 'Sep - Nov',
    tags: ['Tea Gardens', 'Toy Train', 'Peace'],
    defaultPickup: 'Bagdogra Airport / Siliguri Junction',
    defaultDrop: 'The Elgin Heritage Resort, Darjeeling',
  },
];

export const mockTripService = {
  getTrips(): Trip[] {
    const raw = safeLocalStorage.getItem(TRIPS_STORAGE_KEY);
    if (!raw) {
      safeLocalStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(INITIAL_TRIPS));
      return INITIAL_TRIPS;
    }
    try {
      const parsed: Trip[] = JSON.parse(raw);
      // Ensure all loaded trips have pickup and drop points
      return parsed.map((t) => ({
        ...t,
        pickupPoint: t.pickupPoint || (t.destination === 'Manali' ? 'Delhi Kashmere Gate ISBT / IGI Airport T3' : t.destination === 'Goa' ? 'Dabolim Airport / Madgaon Jn' : t.destination === 'Rishikesh' ? 'Jolly Grant Airport / Haridwar' : 'New Delhi Central Terminal / Airport'),
        dropPoint: t.dropPoint || `${t.destination} City Center & Hotel Hub`,
      }));
    } catch {
      return INITIAL_TRIPS;
    }
  },

  getTripById(id: string): Trip | undefined {
    return this.getTrips().find((t) => t.id === id);
  },

  getActiveTrip(): Trip | undefined {
    return this.getTrips().find((t) => t.status === 'active') || this.getTrips()[0];
  },

  saveTrips(trips: Trip[]): void {
    safeLocalStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  },

  createTrip(tripData: Partial<Trip>): Trip {
    const trips = this.getTrips();
    const id = `trip_${Date.now()}`;
    const destination = tripData.destination || 'Manali';
    const pickupPoint = tripData.pickupPoint || 'Delhi Kashmere Gate ISBT / IGI Airport';
    const dropPoint = tripData.dropPoint || `${destination} Resort & Activity Hub`;

    const newTrip: Trip = {
      id,
      title: tripData.title || `${destination} Getaway`,
      destination,
      stateOrCountry: tripData.stateOrCountry || 'India',
      pickupPoint,
      dropPoint,
      pickupCoords: tripData.pickupCoords,
      dropCoords: tripData.dropCoords,
      description: tripData.description || `AI optimized ${tripData.travelStyle || 'Balanced'} trip from ${pickupPoint} to ${dropPoint} planned with NIEL AI.`,
      imageUrl: tripData.imageUrl || '/assets/images/manali-resort.jpg',
      startDate: tripData.startDate || '15 Jan 2027',
      endDate: tripData.endDate || '18 Jan 2027',
      durationDays: tripData.durationDays || 4,
      travelers: tripData.travelers || 2,
      travelStyle: tripData.travelStyle || 'Balanced',
      transportation: tripData.transportation || 'Car',
      interests: tripData.interests || ['Nature', 'Food'],
      budget: tripData.budget || 25000,
      estimatedCost: tripData.estimatedCost || 22800,
      actualSpent: 0,
      appliedOfferDiscount: tripData.appliedOfferDiscount || 0,
      creditsUsed: tripData.creditsUsed || 0,
      status: 'planned',
      isPaid: false,
      itinerary: tripData.itinerary || this.generateDefaultItinerary(destination, tripData.durationDays || 4),
    };

    trips.unshift(newTrip);
    this.saveTrips(trips);
    return newTrip;
  },

  updateTrip(id: string, updates: Partial<Trip>): Trip | undefined {
    const trips = this.getTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    const updated = { ...trips[index], ...updates };
    trips[index] = updated;
    this.saveTrips(trips);
    return updated;
  },

  completeTrip(id: string): { trip: Trip; savings: number; creditsEarned: number } | undefined {
    const trips = this.getTrips();
    const index = trips.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    const trip = trips[index];
    const savings = Math.max(0, trip.budget - trip.actualSpent);
    const creditsEarned = savings;

    trip.status = 'completed';
    trips[index] = trip;
    this.saveTrips(trips);

    return { trip, savings, creditsEarned };
  },

  generateDefaultItinerary(destination: string, days: number): TripDay[] {
    const matched = destinationDatabase.searchDestinations(destination);
    const dest = matched[0];

    const itinerary: TripDay[] = [];
    const attractions = dest?.attractions || [`${destination} Central Exploration`];
    const activities = dest?.thingsToDo || [`Scenic viewpoint walk in ${destination}`];
    const foodHighlights = dest?.foodAndCulinaryHighlights || ['Authentic Regional Cuisine'];
    const stayHub = dest?.transport?.defaultDropTransit || `${destination} Boutique Stay`;
    const transitHub = dest?.transport?.defaultPickupTransit || `${destination} Transit Hub`;

    for (let i = 1; i <= days; i++) {
      const isArrival = i === 1;
      const isDeparture = i === days;

      const morningAttraction = attractions[(i - 1) % attractions.length] || `${destination} Heritage Site`;
      const afternoonActivity = activities[(i - 1) % activities.length] || `Guided discovery tour`;
      const foodItem = foodHighlights[(i - 1) % foodHighlights.length] || `Regional thali dining`;

      itinerary.push({
        dayNumber: i,
        title: isArrival
          ? `Arrival at ${transitHub} & ${destination} Orientation`
          : isDeparture
          ? `Farewell Artisan Trails & Return Departure`
          : `Day ${i}: Signature Experiences & ${morningAttraction}`,
        date: `Day ${i}`,
        activities: [
          {
            id: `gen_act_${i}_1`,
            time: '09:30 AM',
            title: isArrival
              ? `Check-in at ${stayHub}`
              : `Morning Exploration: ${morningAttraction}`,
            location: isArrival ? stayHub : `${destination} Key Zone`,
            duration: '2.5 hrs',
            estimatedCost: isArrival ? (dest?.costEstimate?.hotelEstimateAvg || 2500) : 600,
            category: isArrival ? 'Stay' : 'Activities',
            notes: isArrival
              ? `Verified check-in curated by NIEL AI (${dest?.category || 'General'})`
              : `Explore authentic architectural & cultural marvels`,
          },
          {
            id: `gen_act_${i}_2`,
            time: '01:00 PM',
            title: `Authentic Regional Lunch: ${foodItem}`,
            location: `${destination} Culinary Quarter`,
            duration: '1.5 hrs',
            estimatedCost: dest?.costEstimate?.foodEstimateAvg || 800,
            category: 'Food',
            notes: `Traditional flavors recommended by SAFRO locals`,
          },
          {
            id: `gen_act_${i}_3`,
            time: '04:00 PM',
            title: isDeparture
              ? `Local Handicraft & Spice Market Shopping`
              : `Evening Experience: ${afternoonActivity}`,
            location: `${destination} Promenade / Vista`,
            duration: '2 hrs',
            estimatedCost: isDeparture ? 1200 : 700,
            category: isDeparture ? 'Transport' : 'Activities',
            notes: isDeparture
              ? `Transfer to ${dest?.transport?.nearestAirport || 'Terminal'} for departure`
              : `Unmissable photography & sunset panorama recommended by NIEL`,
          },
        ],
      });
    }
    return itinerary;
  },
};

