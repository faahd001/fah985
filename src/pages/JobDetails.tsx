import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Job } from './JobBoard';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const jobData = { id: docSnap.id, ...docSnap.data() } as Job;
          setJob(jobData);
          
          // Fetch customer details
          const custRef = doc(db, 'users', jobData.customerId);
          const custSnap = await getDoc(custRef);
          if (custSnap.exists()) setCustomer(custSnap.data());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  useEffect(() => {
    if (!jobId || !user) return;
    
    // Only fetch proposals if user is the customer who posted it, OR if user is an engineer we just fetch all to see if they applied
    // MVP rule limitation: engineers can only read proposals they made. Customers can read all proposals for their job.
    // Client side filtering for UI.
    let q;
    if (profile?.role === 'customer') {
      // For now, in MVP anyone authenticated can read proposes, so we query simply:
      q = query(collection(db, 'proposals'), where('jobId', '==', jobId));
    } else {
      q = query(collection(db, 'proposals'), where('jobId', '==', jobId), where('engineerId', '==', user.uid));
    }

    const unSub = onSnapshot(q, (snap) => {
      const p: any[] = [];
      snap.forEach(d => p.push({ id: d.id, ...d.data() }));
      setProposals(p);
    });

    return () => unSub();
  }, [jobId, user, profile]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== 'engineer') return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'proposals'), {
        jobId,
        engineerId: user.uid,
        coverLetter,
        proposedRate,
        status: 'pending',
        createdAt: Date.now()
      });
      alert("Application sent successfully!");
      setShowApplyModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const hasApplied = proposals.some(p => p.engineerId === user?.uid);

  const startChatWithCustomer = () => {
    if (job?.customerId) {
      navigate(`/dashboard/chat/${job.customerId}`);
    }
  };

  const startChatWithEngineer = (engId: string) => {
    navigate(`/dashboard/chat/${engId}`);
  };

  const handleUpdateJobStatus = async (newStatus: string) => {
    if (!jobId) return;
    try {
      await updateDoc(doc(db, 'jobs', jobId), { status: newStatus });
      setJob(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (e) {
      console.error(e);
      alert("Failed to update job status");
    }
  };

  const handleUpdateProposalStatus = async (proposalId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'proposals', proposalId), { status: newStatus });
    } catch (e) {
      console.error(e);
      alert("Failed to update proposal status");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading job...</div>;
  if (!job) return <div className="p-20 text-center text-red-500">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="geo-card overflow-hidden">
        <div className="border-b border-[#e2e8f0] p-8 lg:p-10 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-[#0f172a] tracking-tight">{job.title}</h1>
            {profile?.role === 'customer' && job.customerId === user?.uid ? (
              <select 
                value={job.status} 
                onChange={(e) => handleUpdateJobStatus(e.target.value)}
                className={`px-3 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer ${job.status === 'open' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
              >
                <option value="open">OPEN</option>
                <option value="closed">CLOSED</option>
              </select>
            ) : (
              <span className={`px-3 py-1 rounded-[6px] text-xs font-bold uppercase tracking-wider ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {job.status}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-[#64748b] mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[#0f172a]">Posted By:</span> {customer?.displayName || 'Loading...'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0f172a]">Location:</span> {job.location || 'Remote'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0f172a]">Budget:</span> {job.budget || 'Open'}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {job.requiredSkills?.map((skill, i) => (
              <span key={i} className="geo-tag bg-[#f8fafc] border border-[#e2e8f0]">{skill}</span>
            ))}
          </div>

          {profile?.role === 'engineer' && job.status === 'open' && !hasApplied && (
            <button onClick={() => setShowApplyModal(true)} className="geo-btn bg-primary text-white hover:bg-primary-dark shadow-sm">
              Apply for Job
            </button>
          )}

          {profile?.role === 'engineer' && hasApplied && (
            <div className="mt-6 border-t border-[#e2e8f0] pt-6">
              <h4 className="font-bold text-[#0f172a] mb-3">Your Proposal</h4>
              {proposals.map(p => (
                 <div key={p.id} className="geo-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f8fafc]">
                   <div className="flex flex-col gap-1 w-full">
                     <div className="text-sm"><strong>Proposed Rate:</strong> {p.proposedRate || 'N/A'}</div>
                     <div className="text-sm">
                       <strong>Status:</strong> <span className={`uppercase font-semibold ${p.status === 'accepted' ? 'text-green-600' : p.status === 'rejected' ? 'text-red-500' : 'text-[#64748b]'}`}>{p.status}</span>
                     </div>
                   </div>
                   <select 
                     value={p.status} 
                     onChange={(e) => handleUpdateProposalStatus(p.id, e.target.value)}
                     className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary w-full sm:w-auto"
                   >
                     <option value="pending">Pending</option>
                     <option value="accepted">Accepted</option>
                     <option value="rejected">Rejected</option>
                   </select>
                 </div>
              ))}
            </div>
          )}

          {profile?.role === 'customer' && job.customerId !== user?.uid && (
             <button onClick={startChatWithCustomer} className="geo-btn bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-gray-50 shadow-sm">
              Message Poster
            </button>
          )}
        </div>

        <div className="p-8 lg:p-10 bg-[#f8fafc]">
          <h3 className="text-lg font-bold text-[#0f172a] mb-4">Job Description</h3>
          <div className="text-[#0f172a] text-sm leading-relaxed whitespace-pre-wrap">
            {job.description}
          </div>
        </div>
      </div>

      {/* Customer view only: Show Proposals */}
      {profile?.role === 'customer' && job.customerId === user?.uid && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#0f172a] mb-4 tracking-tight">Proposals ({proposals.length})</h2>
          
          {proposals.length === 0 ? (
            <div className="geo-card p-10 text-center text-[#64748b]">
              No proposals yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {proposals.map(p => (
                <div key={p.id} className="geo-card p-6 flex flex-col md:flex-row justify-between gap-6">
                  <div>
                    <h4 className="font-bold text-[#0f172a] mb-2">Proposal by Engineer: {p.engineerId.substring(0, 8)}...</h4>
                    <p className="text-sm text-[#0f172a] mb-2 whitespace-pre-wrap">{p.coverLetter}</p>
                    <div className="text-sm font-semibold text-primary">Proposed Rate: {p.proposedRate || 'N/A'}</div>
                  </div>
                  <div className="shrink-0 flex gap-2 items-start">
                    <button 
                      onClick={() => startChatWithEngineer(p.engineerId)} 
                      className="geo-btn bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-primary"
                    >
                      Message
                    </button>
                    <select 
                      value={p.status} 
                      onChange={(e) => handleUpdateProposalStatus(p.id, e.target.value)}
                      className="px-3 py-2 bg-white border border-[#e2e8f0] rounded-[6px] text-sm font-medium focus:outline-none focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-[#e2e8f0]">
              <h2 className="text-xl font-bold text-[#0f172a]">Submit Proposal</h2>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">Cover Letter</label>
                <textarea 
                  required rows={5} placeholder="Why are you a great fit?"
                  value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                  className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">Proposed Rate</label>
                <input 
                  type="text" placeholder="e.g. $60/hr or $2000 total"
                  value={proposedRate} onChange={e => setProposedRate(e.target.value)}
                  className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#e2e8f0]">
                <button type="button" onClick={() => setShowApplyModal(false)} className="geo-btn border border-[#e2e8f0] bg-white">Cancel</button>
                <button type="submit" disabled={submitting} className="geo-btn bg-primary text-white disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
