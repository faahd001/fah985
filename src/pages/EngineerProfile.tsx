import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Mail, Star, Wrench, ShieldCheck, MessageCircle } from 'lucide-react';

export default function EngineerProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchEngineer = async () => {
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === 'engineer') {
          setEngineer(docSnap.data());
        } else {
          setEngineer(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEngineer();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      alert("Please log in to book an engineer");
      return;
    }
    const description = prompt("Briefly describe the job:");
    if (!description) return;

    try {
      await addDoc(collection(db, 'bookings'), {
        customerId: user.uid,
        engineerId: id,
        status: 'pending',
        description,
        createdAt: Date.now()
      });
      alert('Booking request sent successfully!');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Failed to book');
    }
  };

  const handleMessage = async () => {
    if (!user) {
      alert("Please log in to message this engineer");
      return;
    }
    navigate(`/dashboard/chat/${id}`);
  };

  if (loading) return <div className="p-20 text-center">Loading profile...</div>;
  if (!engineer) return <div className="p-20 text-center text-red-500">Engineer not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Cover */}
        <div className="h-48 bg-gradient-to-r from-blue-600 to-primary-dark"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <img 
            src={engineer.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${engineer.displayName}`} 
            alt={engineer.displayName} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg absolute -top-16"
          />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-20 mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                {engineer.displayName}
                {engineer.isApproved !== false && <ShieldCheck className="text-green-500" size={20} title="Verified" />}
              </h1>
              <p className="text-lg text-primary font-medium">{engineer.title || 'Professional Engineer'}</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={handleMessage}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <MessageCircle size={18} />
                Message
              </button>
              <button 
                onClick={handleBook}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">About Me</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {engineer.bio || "No biography provided yet. This professional is ready to tackle your tasks."}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {engineer.skills ? engineer.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  )) : <p className="text-gray-500 text-sm">No specific skills listed.</p>}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 tracking-tight">Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin className="text-gray-400 mt-0.5" size={18} />
                    <span>{engineer.location || 'Remote / Unspecified'}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-600">
                    <Briefcase className="text-gray-400 mt-0.5" size={18} />
                    <span>Experience: {engineer.experience || 'Not specified'}</span>
                  </li>
                  {engineer.hourlyRate && (
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="font-semibold text-gray-900">${engineer.hourlyRate}/hr</div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
