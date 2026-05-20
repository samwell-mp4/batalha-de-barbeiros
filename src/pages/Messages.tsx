import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Search, MessageSquare, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Messages() {
   const navigate = useNavigate();

   const loggedUser = useMemo(() => {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
   }, []);

   const [conversations, setConversations] = useState<any[]>([]);
   const [searchUserText, setSearchUserText] = useState('');
   const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
   const [chatMessages, setChatMessages] = useState<any[]>([]);
   const [chatMessageText, setChatMessageText] = useState('');
   const [allUsers, setAllUsers] = useState<any[]>([]);

   useEffect(() => {
      if (!loggedUser) return;
      api.getConversations(loggedUser.id).then((res: any) => {
         if (!res.error) setConversations(res);
      });
      // Fetch barbers to search (for now we use getBarbers to simulate searching users)
      api.getBarbers().then((res: any) => {
         if (!res.error) setAllUsers(res);
      });
   }, [loggedUser]);

   useEffect(() => {
      if (activeChatUser && loggedUser) {
         api.getMessages(loggedUser.id, activeChatUser.id).then((res: any) => {
            if (!res.error) setChatMessages(res);
         });
      }
   }, [activeChatUser, loggedUser]);

   const filteredSearchResults = useMemo(() => {
      if (!searchUserText.trim()) return [];
      return allUsers.filter(u => 
         u.name.toLowerCase().includes(searchUserText.toLowerCase()) || 
         (u.email && u.email.toLowerCase().includes(searchUserText.toLowerCase()))
      ).map(u => ({ id: u.userId || u.id, name: u.name, avatar: u.avatar }));
   }, [searchUserText, allUsers]);

   const handleSendMessage = async () => {
      if (!chatMessageText.trim() || !activeChatUser || !loggedUser) return;
      const content = chatMessageText.trim();
      setChatMessageText('');
      
      const newMsg = {
         id: Date.now().toString(),
         senderId: loggedUser.id,
         receiverId: activeChatUser.id,
         content,
         createdAt: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, newMsg]);
      
      try {
         await api.sendMessage(loggedUser.id, activeChatUser.id, content);
      } catch (e) {
         console.error('Failed to send message:', e);
      }
   };

   return (
      <div className="w-full h-screen bg-gray-50 flex flex-col font-inter relative pb-20">
         {!activeChatUser ? (
            /* CONVERSATIONS LIST */
            <div className="flex-1 flex flex-col overflow-hidden h-full">
               <div className="px-6 py-8 bg-white border-b border-gray-150 flex items-center justify-between shadow-sm">
                  <h3 className="text-3xl font-black text-blue-950 uppercase italic tracking-tighter">Mensagens</h3>
                  <div className="w-10 h-10 bg-blue-50 rounded-[14px] flex items-center justify-center border border-blue-100 text-blue-600 shadow-sm relative">
                     <MessageSquare size={18} />
                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  </div>
               </div>

               {/* Search Box */}
               <div className="p-6 bg-gray-50/50">
                  <div className="relative">
                     <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Buscar contatos..."
                        value={searchUserText}
                        onChange={e => setSearchUserText(e.target.value)}
                        className="w-full bg-white border border-gray-150 rounded-[22px] py-4 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950 shadow-sm transition-all"
                     />
                  </div>
               </div>

               {/* List Container */}
               <div className="flex-1 overflow-y-auto px-6 space-y-3 no-scrollbar pb-10">
                  {searchUserText.trim() ? (
                     /* SEARCH RESULTS */
                     <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">Resultados da busca ({filteredSearchResults.length})</p>
                        {filteredSearchResults.map((usr: any) => (
                           <button
                              key={usr.id}
                              onClick={() => {
                                 setActiveChatUser(usr);
                                 setSearchUserText('');
                              }}
                              className="w-full bg-white p-4 rounded-[26px] border border-gray-100 flex items-center space-x-4 hover:bg-blue-50/30 transition-colors mb-3 shadow-sm"
                           >
                              <img src={usr.avatar || `https://i.pravatar.cc/100?u=${usr.id}`} className="w-12 h-12 rounded-[18px] object-cover" />
                              <div className="text-left flex-1">
                                 <h4 className="text-sm font-black text-blue-950 uppercase italic leading-none">{usr.name}</h4>
                                 <span className="text-[10px] font-bold text-gray-400 mt-1 block">Tocar para iniciar conversa</span>
                              </div>
                           </button>
                        ))}
                        {filteredSearchResults.length === 0 && (
                           <p className="text-center py-10 text-xs font-bold text-gray-300 uppercase tracking-widest">Nenhum usuário encontrado</p>
                        )}
                     </div>
                  ) : (
                     /* ACTIVE CONVERSATIONS LIST */
                     <div>
                        {conversations.map((conv: any) => (
                           <button
                              key={conv.otherUser.id}
                              onClick={() => setActiveChatUser(conv.otherUser)}
                              className="w-full bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between hover:bg-blue-50/20 transition-all duration-300 shadow-sm mb-3 group"
                           >
                              <div className="flex items-center space-x-4 text-left">
                                 <div className="relative">
                                    <img src={conv.otherUser.avatar || `https://i.pravatar.cc/100?u=${conv.otherUser.id}`} className="w-14 h-14 rounded-[20px] object-cover" />
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-blue-950 uppercase italic leading-none">{conv.otherUser.name}</h4>
                                    <p className="text-[11px] text-gray-400 font-bold truncate max-w-[200px] mt-1.5">
                                       {conv.lastMessage.senderId === loggedUser?.id ? 'Você: ' : ''}
                                       {conv.lastMessage.content}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col justify-between items-end h-12">
                                 <span className="text-[9px] font-black text-gray-300 uppercase">
                                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronLeft size={12} className="rotate-180" />
                                 </div>
                              </div>
                           </button>
                        ))}
                        {conversations.length === 0 && (
                           <div className="py-32 text-center opacity-30 flex flex-col items-center">
                              <MessageSquare size={48} className="mb-4 text-blue-950" />
                              <p className="text-xs font-black uppercase tracking-widest text-blue-950">Nenhuma conversa ativa</p>
                              <p className="text-[10px] font-bold text-gray-500 mt-2 max-w-[200px]">Busque por um barbeiro ou cliente acima para começar o chat.</p>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
         ) : (
            /* ACTIVE CHAT SCREEN */
            <div className="flex-1 flex flex-col overflow-hidden h-full z-10 bg-white">
               {/* Chat Header */}
               <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between bg-white shadow-sm z-20">
                  <div className="flex items-center space-x-4 text-left">
                     <button 
                        onClick={() => {
                           setActiveChatUser(null);
                           setChatMessages([]);
                        }} 
                        className="p-3 bg-gray-50 rounded-[18px] text-gray-500 hover:bg-gray-100 transition-colors"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <img src={activeChatUser.avatar || `https://i.pravatar.cc/100?u=${activeChatUser.id}`} className="w-12 h-12 rounded-[18px] object-cover" />
                     <div>
                        <h4 className="text-sm font-black text-blue-950 uppercase italic leading-none">{activeChatUser.name}</h4>
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest block mt-1">Online agora</span>
                     </div>
                  </div>
               </div>

               {/* Messages List */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gray-50/50">
                  {chatMessages.map((msg: any) => {
                     const isMe = msg.senderId === loggedUser?.id;
                     return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[75%] p-4 rounded-[24px] text-[13px] leading-relaxed text-left font-medium ${isMe ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-100' : 'bg-white border border-gray-150 text-blue-950 rounded-tl-sm shadow-sm'}`}>
                              <p>{msg.content}</p>
                              <span className={`block text-[8px] font-black uppercase mt-2 ${isMe ? 'text-blue-100 text-right' : 'text-gray-300'}`}>
                                 {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        </div>
                     );
                  })}
                  {chatMessages.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                        <MessageSquare size={48} className="mb-4 text-blue-950" />
                        <p className="text-xs font-black uppercase tracking-widest text-blue-950 text-center">Início da Conversa<br/>com {activeChatUser.name}</p>
                     </div>
                  )}
               </div>

               {/* Chat Input */}
               <div className="p-4 border-t border-gray-150 bg-white flex items-center space-x-3 pb-24">
                  <input
                     type="text"
                     placeholder="Escreva algo incrível..."
                     value={chatMessageText}
                     onChange={e => setChatMessageText(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                     className="flex-1 bg-gray-50 border border-gray-100 rounded-[24px] py-4 px-6 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-blue-950 transition-all"
                  />
                  <button onClick={handleSendMessage} className="p-4 bg-blue-600 text-white rounded-[20px] shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                     <Send size={16} />
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}
