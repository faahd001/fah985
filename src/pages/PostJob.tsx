import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function PostJob() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    location: '',
    budget: '',
  });
  const [saving, setSaving] = useState(false);

  // If not customer, probably shouldn't be posting, but let's just guard if not logged in
  if (!user || profile?.role !== 'customer') {
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Access Denied</h2>
        <p className="text-[#64748b]">Only customers can post jobs.</p>
        <button onClick={() => navigate(-1)} className="mt-4 geo-btn bg-white border border-[#e2e8f0]">Go Back</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await addDoc(collection(db, 'jobs'), {
        customerId: user.uid,
        title: formData.title,
        description: formData.description,
        requiredSkills: skillsArray,
        location: formData.location,
        budget: formData.budget,
        status: 'open',
        createdAt: Date.now()
      });
      alert('Job posted successfully!');
      navigate('/jobs');
    } catch (err) {
      console.error(err);
      alert('Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 w-full">
      <div className="geo-card p-8 lg:p-10">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Post a New Job</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Job Title</label>
            <input 
              required type="text" placeholder="e.g. Need an AWS Solutions Architect"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Job Description</label>
            <textarea 
              required rows={6} placeholder="Describe the project, scope, and deliverables..."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">Required Skills (comma separated)</label>
              <input 
                type="text" placeholder="e.g. AWS, Node.js, Terraform"
                value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})}
                className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">Budget</label>
              <input 
                type="text" placeholder="e.g. $50/hr or $1500 fixed"
                value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Location Requirements</label>
            <input 
              type="text" placeholder="e.g. Remote, or specific city"
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
              className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] flex justify-end gap-3">
            <button 
              type="button" onClick={() => navigate('/jobs')}
              className="geo-btn bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={saving}
              className="geo-btn bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
