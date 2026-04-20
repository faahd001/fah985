import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { User, Settings, Calendar, MessageSquare, Edit } from 'lucide-react';
import Chat from './Chat';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-20 text-center">Loading dashboard...</div>;
  if (!user || !profile) return <div className="p-20 text-center">Please log in to view dashboard.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.displayName}`} 
              alt={profile.displayName || ''} 
              className="w-12 h-12 rounded-full border border-gray-200"
            />
            <div>
              <h2 className="font-semibold text-gray-900 leading-tight">{profile.displayName || 'User'}</h2>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Calendar size={18} />
              Bookings
            </Link>
            <Link 
              to="/dashboard/chat" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/chat') ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <MessageSquare size={18} />
              Messages
            </Link>
            <Link 
              to="/dashboard/profile" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/dashboard/profile' ? 'bg-primary-light text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Settings size={18} />
              Settings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={<Overview role={profile.role} uid={user.uid} />} />
          <Route path="/profile" element={<ProfileSettings profile={profile} />} />
          <Route path="/chat/:partnerId?" element={<Chat currentUserId={user.uid} />} />
        </Routes>
      </div>
    </div>
  );
}

function Overview({ role, uid }: { role: string, uid: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviewingBooking, setReviewingBooking] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const field = role === 'engineer' ? 'engineerId' : 'customerId';
    const q = query(collection(db, 'bookings'), where(field, '==', uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setBookings(data);
    });
    return () => unsubscribe();
  }, [role, uid]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
    } catch (e) {
      console.error(e);
      alert("Failed to update");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingBooking) return;
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        bookingId: reviewingBooking.id,
        engineerId: reviewingBooking.engineerId,
        customerId: reviewingBooking.customerId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: Date.now()
      });
      await updateDoc(doc(db, 'bookings', reviewingBooking.id), { reviewed: true });
      setReviewingBooking(null);
      setReviewForm({ rating: 5, comment: '' });
      alert("Review submitted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Your Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No bookings found.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-semibold uppercase rounded-full tracking-wide ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : b.status === 'accepted' ? 'bg-green-100 text-green-800' : b.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {b.status}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="font-medium text-gray-900">{b.description}</p>
                <p className="text-sm text-primary mt-1">
                  {role === 'customer' ? 'To Engineer' : 'From Customer'} - ID: {role === 'customer' ? b.engineerId : b.customerId}
                </p>
              </div>
              
              {role === 'engineer' && b.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => updateStatus(b.id, 'accepted')} className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-colors">Accept</button>
                  <button onClick={() => updateStatus(b.id, 'rejected')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors">Reject</button>
                </div>
              )}
              {role === 'engineer' && b.status === 'accepted' && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => updateStatus(b.id, 'completed')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">Mark Completed</button>
                </div>
              )}
              {role === 'customer' && b.status === 'completed' && !b.reviewed && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setReviewingBooking(b)} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors">Leave Review</button>
                </div>
              )}
              {role === 'customer' && b.status === 'completed' && b.reviewed && (
                <div className="flex gap-2 shrink-0">
                  <span className="text-sm text-green-600 font-medium whitespace-nowrap">Reviewed ✓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leave a Review</h3>
            <p className="text-gray-600 text-sm mb-4">How was your experience with this engineer?</p>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select 
                  value={reviewForm.rating} 
                  onChange={e => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Share details of your experience..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setReviewingBooking(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSettings({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    role: profile.role || 'customer',
    bio: profile.bio || '',
    location: profile.location || '',
    title: profile.title || '',
    skills: profile.skills ? profile.skills.join(', ') : '',
    experience: profile.experience || '',
    hourlyRate: profile.hourlyRate || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      await updateDoc(doc(db, 'users', profile.uid), {
        ...formData,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : null,
        skills: skillsArray
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input required type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
              <option value="customer">Customer</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>
        </div>

        {formData.role === 'engineer' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                <input type="text" placeholder="e.g. Senior Electrician" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input type="number" placeholder="50" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" placeholder="City, Country" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
              <input type="text" placeholder="Electrical, Wiring, Circuit Design" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input type="text" placeholder="e.g. 5+ Years" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea rows={4} placeholder="Tell us about yourself..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"></textarea>
        </div>

        <button type="submit" disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
