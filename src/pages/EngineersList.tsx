import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Search, MapPin, Star, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Engineer {
  uid: string;
  displayName: string;
  title?: string;
  photoURL?: string;
  location?: string;
  skills?: string[];
  hourlyRate?: number;
}

export default function EngineersList() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'engineer'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Engineer[] = [];
      snapshot.forEach((doc) => {
        data.push(doc.data() as Engineer);
      });
      setEngineers(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredEngineers = engineers.filter(eng => 
    eng.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-grow grid grid-cols-1 md:grid-cols-[320px_1fr] w-full min-h-screen">
      {/* Sidebar Filters */}
      <aside className="bg-white border-r border-[#e2e8f0] p-8 md:p-10 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label className="geo-label">Search</label>
          <input 
            type="text" 
            placeholder="Engineer or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="geo-label">Location</label>
          <input 
            type="text" 
            placeholder="e.g. San Francisco" 
            className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] text-sm focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="geo-label">Categories</label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm p-3 rounded-[6px] text-primary font-semibold bg-[#f8fafc]">
              All Specialties <span>{filteredEngineers.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 rounded-[6px] text-[#64748b] hover:bg-[#f8fafc] cursor-pointer">
              Electrical Engineering <span>0</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 rounded-[6px] text-[#64748b] hover:bg-[#f8fafc] cursor-pointer">
              Software Systems <span>0</span>
            </div>
            <div className="flex justify-between items-center text-sm p-3 rounded-[6px] text-[#64748b] hover:bg-[#f8fafc] cursor-pointer">
              Mechanical Engineering <span>0</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="geo-card !bg-[#f8fafc] !border-none p-5">
            <p className="text-[12px] text-[#64748b] leading-relaxed">
              <strong>ProFinder</strong> is the leading workspace for engineering solutions. Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <section className="p-8 md:p-10 flex flex-col gap-8 bg-[#f8fafc]">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="geo-card p-6 animate-pulse h-[250px]"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEngineers.map((engineer, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={engineer.uid}
                className="geo-card p-6 flex flex-col gap-4"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-[#e2e8f0] text-primary font-bold rounded-full flex items-center justify-center shrink-0">
                    {engineer.photoURL ? (
                      <img src={engineer.photoURL} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : engineer.displayName?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold m-0 mb-0.5 text-[#0f172a]">{engineer.displayName}</h4>
                    <p className="text-[13px] text-[#64748b] m-0">{engineer.title || 'Professional Engineer'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-[6px]">
                  {engineer.skills?.slice(0, 3).map((skill, i) => (
                    <span key={i} className="geo-tag">
                      {skill}
                    </span>
                  ))}
                  {(engineer.skills?.length || 0) > 3 && (
                    <span className="geo-tag">
                      +{(engineer.skills?.length || 0) - 3}
                    </span>
                  )}
                  {(!engineer.skills || engineer.skills.length === 0) && (
                     <span className="geo-tag">General</span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-[#e2e8f0] flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[14px] font-bold text-[#0f172a]">
                    <span className="text-[#f59e0b]">★</span> New
                  </div>
                  <div className="text-[14px] font-bold text-[#0f172a]">
                    {engineer.hourlyRate ? `$${engineer.hourlyRate}` : 'Contact'}
                    <span className="font-normal text-[#64748b] ml-1">{engineer.hourlyRate ? '/hr' : ''}</span>
                  </div>
                </div>
                
                <Link to={`/engineers/${engineer.uid}`} className="mt-2 text-center text-[13px] font-semibold text-primary hover:underline">
                  View Profile &rarr;
                </Link>
              </motion.div>
            ))}
            
            {filteredEngineers.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-[#e2e8f0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#64748b]">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-1">No engineers found</h3>
                <p className="text-[#64748b]">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
