import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Search, MapPin, Briefcase, Plus, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface Job {
  id: string;
  customerId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  budget: string;
  status: string;
  createdAt: number;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Show only open jobs
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'open')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Job[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Job);
      });
      // Order locally to bypass missing index requirements for MVP, or just leave as is.
      data.sort((a, b) => b.createdAt - a.createdAt);
      setJobs(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.requiredSkills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] w-full min-h-screen">
      {/* Sidebar Filters */}
      <aside className="bg-white border-r border-[#e2e8f0] p-8 md:p-10 flex flex-col gap-6">
        {profile?.role === 'customer' && (
          <button 
            onClick={() => navigate('/jobs/new')}
            className="geo-btn bg-primary text-white hover:bg-primary-dark w-full flex items-center justify-center gap-2 shadow-sm mb-2"
          >
            <Plus size={18} />
            Post a Job
          </button>
        )}

        <div className="flex flex-col gap-3">
          <label className="geo-label">Search Jobs</label>
          <input 
            type="text" 
            placeholder="Title or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="geo-label">Location</label>
          <input 
            type="text" 
            placeholder="e.g. Remote, City" 
            className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </aside>

      {/* Content Area */}
      <section className="p-8 md:p-10 flex flex-col gap-8 bg-[#f8fafc]">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">Job Board</h1>
            <p className="text-[#64748b]">Find engineering projects posted by customers.</p>
          </div>
          <div className="hidden sm:block text-sm font-semibold text-[#64748b] bg-white border border-[#e2e8f0] px-3 py-1 rounded-[6px]">
            {filteredJobs.length} Jobs
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="geo-card p-6 animate-pulse h-[180px]"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredJobs.map((job, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={job.id}
                className="geo-card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="text-lg font-bold text-[#0f172a] hover:text-primary transition-colors">{job.title}</h3>
                    </Link>
                    
                    <div className="flex items-center gap-4 mt-2 mb-4 text-[#64748b] text-sm font-medium">
                      {job.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </div>
                      )}
                      {job.budget && (
                        <div className="flex items-center gap-1 text-[#0f172a]">
                          Budget: {job.budget}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-[#64748b] text-sm line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills?.map((skill, i) => (
                        <span key={i} className="geo-tag border border-[#e2e8f0] bg-white">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-end">
                    <Link to={`/jobs/${job.id}`} className="geo-btn bg-white border border-[#e2e8f0] text-[#0f172a] hover:border-primary hover:text-primary shadow-sm inline-flex items-center justify-center min-w-[120px]">
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredJobs.length === 0 && (
              <div className="py-20 text-center geo-card flex flex-col items-center justify-center border-dashed">
                <div className="w-16 h-16 bg-[#eff6ff] rounded-full flex items-center justify-center mb-4 text-primary">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-1">No open jobs found</h3>
                <p className="text-[#64748b]">Check back later for new opportunities.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
