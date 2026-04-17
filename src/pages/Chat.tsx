import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { Send } from 'lucide-react';

export default function Chat({ currentUserId }: { currentUserId: string }) {
  const { partnerId } = useParams<{ partnerId?: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [partners, setPartners] = useState<string[]>([]); // simplified: just unique IDs for MVP
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find all users this user has messaged
    const q1 = query(collection(db, 'messages'), where('senderId', '==', currentUserId));
    const q2 = query(collection(db, 'messages'), where('receiverId', '==', currentUserId));
    
    let allPartners = new Set<string>();
    
    const u1 = onSnapshot(q1, snap => {
      snap.forEach(d => allPartners.add(d.data().receiverId));
      setPartners(Array.from(allPartners));
    });
    
    const u2 = onSnapshot(q2, snap => {
      snap.forEach(d => allPartners.add(d.data().senderId));
      setPartners(Array.from(allPartners));
    });

    return () => { u1(); u2(); };
  }, [currentUserId]);

  useEffect(() => {
    if (!partnerId) return;
    
    // We cannot use OR queries easily with both fields, so we do client side merge or two listeners
    const q1 = query(collection(db, 'messages'), where('senderId', '==', currentUserId), where('receiverId', '==', partnerId));
    const q2 = query(collection(db, 'messages'), where('senderId', '==', partnerId), where('receiverId', '==', currentUserId));
    
    const msgsMap = new Map();
    const updateMsgs = () => {
      const arr = Array.from(msgsMap.values()).sort((a, b) => a.createdAt - b.createdAt);
      setMessages(arr);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const unsub1 = onSnapshot(q1, snap => {
      snap.forEach(doc => msgsMap.set(doc.id, { id: doc.id, ...doc.data() }));
      updateMsgs();
    });
    const unsub2 = onSnapshot(q2, snap => {
      snap.forEach(doc => msgsMap.set(doc.id, { id: doc.id, ...doc.data() }));
      updateMsgs();
    });

    return () => { unsub1(); unsub2(); };
  }, [currentUserId, partnerId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !partnerId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUserId,
        receiverId: partnerId,
        text,
        createdAt: Date.now()
      });
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row h-[700px] overflow-hidden">
      {/* Contact List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-900">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {partners.length === 0 ? (
            <p className="text-sm text-gray-500 text-center mt-4">No recent chats. Start by messaging an engineer.</p>
          ) : (
            partners.map(pId => (
              <button
                key={pId}
                onClick={() => navigate(`/dashboard/chat/${pId}`)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${partnerId === pId ? 'bg-primary-light text-primary font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                Chat with ID: {pId.substring(0, 8)}...
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {!partnerId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start messaging
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 text-sm font-medium text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Now chatting with {partnerId.substring(0, 8)}...
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors"
              />
              <button type="submit" disabled={!text.trim()} className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
