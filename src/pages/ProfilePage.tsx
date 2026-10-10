import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  User,
  MapPin,
  Mail,
  Wallet,
  Calendar,
  Settings,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Camera,
  Upload,
  Phone,
  Heart,
  AlertCircle,
  Plane,
  X,
  Check,
  Loader2,
  Edit3,
} from 'lucide-react';

const AVATAR_PRESETS = [
  {
    id: 'preset_1',
    name: 'Traveler 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset_2',
    name: 'Adventurer 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset_3',
    name: 'Nomad 3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset_4',
    name: 'Explorer 4',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset_5',
    name: 'Backpacker 5',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset_6',
    name: 'Trekker 6',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
  },
];

export const ProfilePage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const { trips, credits } = useTrip();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal / Form UI states
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState(user?.name || 'Vivek Kumar');
  const [bio, setBio] = useState(user?.bio || 'Mountain trekker, road trip enthusiast & passionate travel creator.');
  const [location, setLocation] = useState(user?.location || 'Dehradun, India');
  const [phone, setPhone] = useState(user?.phone || '+91 82794 15800');
  const [dob, setDob] = useState(user?.dob || '1998-08-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(
    user?.gender || 'Male'
  );
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [emergencyContactName, setEmergencyContactName] = useState(
    user?.emergencyContactName || 'Rohan Kumar (Brother)'
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    user?.emergencyContactPhone || '+91 98123 45678'
  );
  const [govtIdType, setGovtIdType] = useState<'Aadhaar' | 'Passport' | 'Driving License' | 'Voter ID'>(
    user?.govtIdType || 'Aadhaar'
  );
  const [govtIdNumber, setGovtIdNumber] = useState(user?.govtIdNumber || '•••• •••• 4892');
  const [homeAirport, setHomeAirport] = useState(user?.homeAirport || 'Dehradun Airport (DED) / DEL');
  const [languages, setLanguages] = useState<string>((user?.languages || ['Hindi', 'English', 'Punjabi']).join(', '));
  const [dietaryPreference, setDietaryPreference] = useState<
    'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain' | 'Halal' | 'Gluten-Free'
  >(user?.dietaryPreference || 'Vegetarian');
  const [instagramHandle, setInstagramHandle] = useState(user?.instagramHandle || '@vivek_travels');

  // Synchronize state when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || 'Mountain trekker, road trip enthusiast & passionate travel creator.');
      setLocation(user.location || 'Dehradun, India');
      setPhone(user.phone || '+91 82794 15800');
      setDob(user.dob || '1998-08-15');
      setGender(user.gender || 'Male');
      setBloodGroup(user.bloodGroup || 'O+');
      setEmergencyContactName(user.emergencyContactName || 'Rohan Kumar (Brother)');
      setEmergencyContactPhone(user.emergencyContactPhone || '+91 98123 45678');
      setGovtIdType(user.govtIdType || 'Aadhaar');
      setGovtIdNumber(user.govtIdNumber || '•••• •••• 4892');
      setHomeAirport(user.homeAirport || 'Dehradun Airport (DED) / DEL');
      setLanguages((user.languages || ['Hindi', 'English', 'Punjabi']).join(', '));
      setDietaryPreference(user.dietaryPreference || 'Vegetarian');
      setInstagramHandle(user.instagramHandle || '@vivek_travels');
    }
  }, [user]);

  const totalSavings = trips.reduce(
    (sum, t) => sum + Math.max(0, t.budget - t.actualSpent),
    0
  );

  // Handle Custom Profile Picture File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select a valid image file (PNG, JPG, WebP).', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File Too Large', 'Please upload an image smaller than 5MB.', 'warning');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        try {
          await updateProfile({ avatarUrl: dataUrl });
          showToast('Profile Photo Updated', 'Your profile picture has been updated across SAFRO.', 'success');
        } catch {
          showToast('Upload Error', 'Could not save profile picture. Please try again.', 'error');
        } finally {
          setIsUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      showToast('Error', 'Failed to read the selected image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Handle Selection of Preset Avatar
  const handleSelectPresetAvatar = async (presetUrl: string) => {
    setShowPresetsModal(false);
    setIsUploadingPhoto(true);
    try {
      await updateProfile({ avatarUrl: presetUrl });
      showToast('Avatar Updated', 'Selected avatar preset applied to your profile.', 'success');
    } catch {
      showToast('Error', 'Could not update avatar preset.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save Full Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedLanguages = languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      await updateProfile({
        name,
        bio,
        location,
        phone,
        dob,
        gender,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        govtIdType,
        govtIdNumber,
        homeAirport,
        languages: parsedLanguages,
        dietaryPreference,
        instagramHandle,
      });

      setIsEditing(false);
      showToast('Profile Updated', 'All personal, travel, and safety details have been saved.', 'success');
    } catch (err: any) {
      showToast('Update Failed', err?.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed Out', 'You have been logged out of SAFRO.', 'info');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* Hidden File Input for PFP Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handlePhotoUpload}
        className="hidden"
        id="profile-pfp-upload-input"
      />

      {/* 1. Main Profile Header Card */}
      <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Camera Overlay & Verification Badge */}
          <div className="relative group shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-[#1267D6]/20 shadow-lg bg-slate-100 dark:bg-slate-800">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={user?.name || 'User Profile'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Uploading Spinner Overlay */}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-[#031D3D]/70 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1267D6]" />
                  <span className="text-[10px] font-bold mt-1">Uploading...</span>
                </div>
              )}

              {/* Interactive Camera Hover Overlay */}
              {!isUploadingPhoto && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                  className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-bold mt-1">Upload Photo</span>
                </button>
              )}
            </div>

            {/* Quick Change PFP Camera Button on Bottom-Right */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload new profile picture"
              className="absolute -bottom-2 -left-2 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#062B5C] dark:text-slate-200 hover:text-[#1267D6] hover:scale-110 shadow-md transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Verified Traveler Shield */}
            <div
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#19A974] text-white ring-3 ring-white dark:ring-slate-900 shadow-sm"
              title="Verified SAFRO Traveler"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User Headline & Actions */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031D3D] dark:text-white tracking-tight">
                    {user?.name || 'Vivek Kumar'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                  Member since {user?.joinedDate || 'March 2026'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPresetsModal(true)}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                  className="text-xs font-bold"
                >
                  Avatar Presets
                </Button>
                <Button
                  size="sm"
                  variant={isEditing ? 'outline' : 'secondary'}
                  onClick={() => setIsEditing(!isEditing)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
              {user?.bio || 'Mountain trekker, road trip enthusiast & passionate travel creator.'}
            </p>

            {/* Key Contact Chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#1267D6]" />
                {user?.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#19A974]" />
                {user?.location || 'Dehradun, India'}
              </span>
              {user?.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    {user?.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 1b. Edit Profile Full Form */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in"
          >
            {/* Section A: Personal Information */}
            <div>
              <h4 className="text-xs font-extrabold text-[#031D3D] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#1267D6]" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Primary Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 82794 15800"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Home Location / City *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Dehradun, India"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Instagram / Social Handle
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Traveler Bio & Interests
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell NIEL and travel companions a little bit about yourself..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                />
              </div>
            </div>

            {/* Section B: Travel Safety & Medical Emergency */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold text-[#031D3D] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                Emergency Safety & Medical Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  >
                    <option value="O+">O+ (Universal Donor)</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Rohan Kumar (Brother)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="+91 98123 45678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Logistics & Identification */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold text-[#031D3D] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-[#1267D6]" />
                Logistics & Government ID
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    ID Type
                  </label>
                  <select
                    value={govtIdType}
                    onChange={(e) => setGovtIdType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    ID Number (Masked)
                  </label>
                  <input
                    type="text"
                    value={govtIdNumber}
                    onChange={(e) => setGovtIdNumber(e.target.value)}
                    placeholder="•••• •••• 4892"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Home Airport / Hub
                  </label>
                  <input
                    type="text"
                    value={homeAirport}
                    onChange={(e) => setHomeAirport(e.target.value)}
                    placeholder="Dehradun Airport (DED)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Dietary Preference
                  </label>
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Jain">Jain</option>
                    <option value="Halal">Halal</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="Hindi, English, Punjabi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-[#031D3D] dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#1267D6]"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                isLoading={isSaving}
                className="font-bold text-xs shadow-md"
              >
                Save All Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* 2. Structured User Profile Details Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card A: Personal & Demographics */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#031D3D] dark:text-white">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1267D6]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold">Personal Profile</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-[#1267D6] hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Full Name</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.name || 'Vivek Kumar'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Gender</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.gender || 'Male'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Date of Birth</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">
                {user?.dob ? new Date(user.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Aug 1998'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Primary City</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.location || 'Dehradun, India'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Email</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5 truncate">{user?.email}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Social Handle</span>
              <p className="font-bold text-[#1267D6] mt-0.5">{user?.instagramHandle || '@vivek_travels'}</p>
            </div>
          </div>
        </Card>

        {/* Card B: Emergency & Medical Safety */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#031D3D] dark:text-white">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold">Emergency & Safety Profile</h3>
            </div>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-extrabold uppercase">
              Road Safe
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Blood Group</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <p className="font-extrabold text-[#031D3D] dark:text-white text-sm">{user?.bloodGroup || 'O+'}</p>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Dietary Choice</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.dietaryPreference || 'Vegetarian'}</p>
            </div>
            <div className="col-span-2 p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 space-y-1">
              <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Emergency Contact (24/7 SOS)
              </span>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs font-bold text-[#031D3D] dark:text-white">
                  {user?.emergencyContactName || 'Rohan Kumar (Brother)'}
                </span>
                <a
                  href={`tel:${user?.emergencyContactPhone || '+919812345678'}`}
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl shadow-xs hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {user?.emergencyContactPhone || '+91 98123 45678'}
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Card C: Travel Logistics & ID Verification */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#031D3D] dark:text-white">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
                <Plane className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold">Travel Logistics</h3>
            </div>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974] dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
              ID Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Identity Document</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">
                {user?.govtIdType || 'Aadhaar'} ({user?.govtIdNumber || '•••• •••• 4892'})
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Home Airport Hub</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.homeAirport || 'Dehradun (DED) / DEL'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Spoken Languages</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(user?.languages || ['Hindi', 'English', 'Punjabi']).map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Card D: AI Travel Companion Preferences */}
        <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[#031D3D] dark:text-white">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold">AI Trip Preferences</h3>
            </div>
            <Link
              to="/preferences"
              className="text-xs font-bold text-[#1267D6] hover:underline flex items-center gap-0.5"
            >
              Tune AI <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Travel Style</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.preferences?.travelStyle || 'Balanced'} Mode</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Primary Transport</span>
              <p className="font-bold text-[#031D3D] dark:text-white mt-0.5">{user?.preferences?.preferredTransport || 'Car'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase">Preferred Themes</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(user?.preferences?.interests || ['Nature', 'Adventure', 'Food']).map((int) => (
                  <span
                    key={int}
                    className="px-2 py-0.5 rounded-lg bg-[#EAF4FF] dark:bg-blue-950/50 text-[#1267D6] dark:text-blue-300 font-bold text-[11px]"
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Lifetime Travel Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1267D6]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Trips</span>
            <h3 className="text-2xl font-extrabold text-[#031D3D] dark:text-white mt-0.5">{trips.length} Journeys</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#19A974]">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">SAFRO Credits</span>
            <h3 className="text-2xl font-extrabold text-[#19A974] mt-0.5">₹{credits.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Saved</span>
            <h3 className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-0.5">₹{totalSavings.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* 4. Quick Account Links */}
      <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        {[
          { label: 'My Trips & Bookings', path: '/trips', icon: Calendar },
          { label: 'SAFRO Credits Wallet', path: '/credits', icon: Wallet },
          { label: 'Available Offers & Coupons', path: '/offers', icon: Sparkles },
          { label: 'Preferences & AI Tuning', path: '/preferences', icon: User },
          { label: 'Application Settings', path: '/settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-[#EAF4FF] dark:group-hover:bg-blue-900/40 text-slate-600 dark:text-slate-300 group-hover:text-[#1267D6] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-[#031D3D] dark:text-white group-hover:text-[#1267D6] transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#1267D6] transition-colors" />
            </Link>
          );
        })}
      </Card>

      {/* Logout Button */}
      <div className="pt-2 flex justify-center">
        <Button
          variant="danger"
          size="md"
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
          className="text-xs font-bold"
        >
          Sign Out of SAFRO
        </Button>
      </div>

      {/* 5. Avatar Presets Selection Modal */}
      {showPresetsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#031D3D]/50 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#031D3D] dark:text-white">Choose Avatar Preset</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a traveler avatar or upload your own photo</p>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPresetAvatar(preset.url)}
                  className="group p-2 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-[#1267D6] hover:shadow-md transition-all flex flex-col items-center gap-2 cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-[#1267D6]"
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#1267D6] dark:group-hover:text-blue-400">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPresetsModal(false);
                  fileInputRef.current?.click();
                }}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Upload from Computer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPresetsModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
