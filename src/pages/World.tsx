import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Send, ChevronUp, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { api } from '../services/api';

export default function World() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Current active tab: 'feed' | 'duels'
  const [activeTab, setActiveTab] = useState<'feed' | 'duels'>(() => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'duels' || tabParam === 'duels') ? 'duels' : 'feed';
  });

  // Comments Drawer Drag Control
  const commentsDragControls = useDragControls();
  const [isCommentsMinimized, setIsCommentsMinimized] = useState(false);

  const [currentUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    if (!saved || saved === 'undefined' || saved === 'null') return null;
    try { return JSON.parse(saved); } catch (e) { return null; }
  });

  // State Lists
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [ongoingMatches, setOngoingMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reels view index
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Social interactions overlays
  const [selectedPostForComments, setSelectedPostForComments] = useState<any>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [doubleTapHeartPostId, setDoubleTapHeartPostId] = useState<string | null>(null);

  // Auto-vote execution from deep redirect
  useEffect(() => {
    const autoVoteMatchId = searchParams.get('autoVoteMatchId');
    const autoVoteChoiceId = searchParams.get('autoVoteChoiceId');
    const targetChampId = searchParams.get('championshipId');
    
    if (autoVoteMatchId && autoVoteChoiceId && targetChampId && currentUser?.id) {
      handleVoteSubmit(autoVoteChoiceId, autoVoteMatchId, targetChampId);
      // Clean query params
      window.history.replaceState({}, '', '/');
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Social Feed Posts
      const posts = await api.getPosts();
      setFeedPosts(posts || []);

      // 2. Fetch Championships and extract active matches
      const championships = await api.getChampionships();
      if (championships && Array.isArray(championships)) {
        const matchesList: any[] = [];
        championships
          .filter((c: any) => c.status === 'ONGOING' && c.matches && c.matches.length > 0)
          .forEach((c: any) => {
            c.matches.forEach((m: any) => {
              const p1 = c.participants?.find((p: any) => p.id === m.player1Id);
              const p2 = c.participants?.find((p: any) => p.id === m.player2Id);
              matchesList.push({
                ...m,
                championship: c,
                p1,
                p2
              });
            });
          });
        setOngoingMatches(matchesList);
      }
    } catch (e) {
      console.error('Error fetching World data:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Like Toggle Function
  const handleLikePost = async (postId: string) => {
    if (!currentUser?.id) {
      showToast('Faça login para curtir esta publicação!');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      await api.likePost(postId, currentUser.id);
      
      setFeedPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        
        const likes = p.likes || [];
        const alreadyLiked = likes.some((l: any) => l.userId === currentUser.id);
        
        let newLikes = [];
        if (alreadyLiked) {
          newLikes = likes.filter((l: any) => l.userId !== currentUser.id);
        } else {
          newLikes = [...likes, { id: 'temp-like', postId, userId: currentUser.id }];
        }
        
        return {
          ...p,
          likes: newLikes
        };
      }));
    } catch (e) {
      console.error(e);
      showToast('Erro ao atualizar curtida.');
    }
  };

  // Double tap to like animation trigger
  const handleDoubleTap = (postId: string) => {
    setDoubleTapHeartPostId(postId);
    setTimeout(() => setDoubleTapHeartPostId(null), 800);
    
    // Check if not liked already, toggle like
    const post = feedPosts.find(p => p.id === postId);
    const alreadyLiked = post?.likes?.some((l: any) => l.userId === currentUser?.id);
    if (!alreadyLiked) {
      handleLikePost(postId);
    }
  };

  // Share Post Copy Link
  const handleSharePost = (post: any) => {
    const postUrl = `${window.location.origin}/profile/${post.barberId}`;
    navigator.clipboard.writeText(postUrl);
    showToast('Link do portfólio copiado para a área de transferência!');
  };

  // Submit Comments
  const handleCommentSubmit = async (postId: string, text: string) => {
    if (!currentUser?.id) {
      showToast('Faça login para comentar!');
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }
    if (!text.trim()) return;

    try {
      const newComment = await api.commentPost(postId, currentUser.id, text);
      
      setFeedPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...(p.comments || []), {
            ...newComment,
            user: currentUser
          }]
        };
      }));
      setNewCommentText('');
      
      // Update drawer if opened
      if (selectedPostForComments && selectedPostForComments.id === postId) {
        setSelectedPostForComments((prev: any) => ({
          ...prev,
          comments: [...(prev.comments || []), {
            ...newComment,
            user: currentUser
          }]
        }));
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao postar comentário.');
    }
  };

  // Submit Match Vote
  const handleVoteSubmit = async (choiceId: string, matchId: string, champId: string) => {
    if (!currentUser?.id) {
      showToast('Faça login para votar! Redirecionando...');
      sessionStorage.setItem('redirectAfterAuth', `/?tab=duels&autoVoteMatchId=${matchId}&autoVoteChoiceId=${choiceId}&championshipId=${champId}`);
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    try {
      const res = await api.voteMatch(champId, {
        userId: currentUser.id,
        matchId: matchId,
        choiceId: choiceId
      });

      if (res.error) {
        showToast(res.error);
      } else {
        showToast('Voto computado com sucesso!');
        fetchData(); // Reload stats
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao computar voto.');
    }
  };

  // Share Duel Copy Link
  const handleShareDuel = (match: any) => {
    const shareUrl = `${window.location.origin}/league?championshipId=${match.championshipId}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Link do Duelo copiado! Envie para seus amigos.');
  };

  return (
    <div className="flex flex-col bg-[#f8fafc] min-h-screen text-blue-950 relative">
      
      {/* HUD HEADER & TABS */}
      <div className="sticky top-0 bg-[#f8fafc]/90 backdrop-blur-xl border-b border-gray-100 z-50 px-6 py-4 flex flex-col space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-100/50">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-3 text-center rounded-xl font-orbitron text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'feed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Explorar
          </button>
          <button
            onClick={() => setActiveTab('duels')}
            className={`flex-1 py-3 text-center rounded-xl font-orbitron text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'duels' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:text-blue-600'}`}
          >
            Duelos
          </button>
        </div>
      </div>

      {/* VIEWPORT CONTROLLER */}
      <div className="flex-1 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-blue-600 border-gray-200 animate-spin" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carregando World...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'feed' ? (
              
              /* TAB 1: INSTAGRAM STYLE SOCIAL FEED */
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 px-4 py-4"
              >
                {feedPosts.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 uppercase text-[10px] font-black">
                    Nenhum post publicado no World ainda.
                  </div>
                ) : (
                  feedPosts.map((post) => {
                    const likes = post.likes || [];
                    const comments = post.comments || [];
                    const isLiked = currentUser?.id && likes.some((l: any) => l.userId === currentUser.id);
                    
                    return (
                      <div key={post.id} className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
                        
                        {/* Feed Card Header */}
                        <div className="p-4 flex items-center justify-between">
                          <div 
                            onClick={() => navigate(`/app/profile/${post.barberId}`)}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <img 
                              src={post.barber?.user?.avatar || `https://i.pravatar.cc/100?u=${post.barberId}`} 
                              className="w-9 h-9 rounded-full object-cover border border-gray-100" 
                            />
                            <div className="text-left">
                              <div className="flex items-center space-x-1">
                                <h3 className="text-xs font-black uppercase tracking-tight text-blue-950">{post.barber?.user?.name || 'Barbeiro'}</h3>
                                <CheckCircle2 size={12} className="text-blue-500 fill-blue-500" />
                              </div>
                              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">{post.barber?.barberShop || 'Elite Barber'}</p>
                            </div>
                          </div>
                          <span className="text-[7px] font-black text-gray-400 uppercase tracking-wider">
                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {/* Feed Card Media */}
                        <div 
                          className="relative aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer select-none"
                          onDoubleClick={() => handleDoubleTap(post.id)}
                        >
                          <img src={post.imageUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                          {/* Zooming heart overlay on double-tap */}
                          <AnimatePresence>
                            {doubleTapHeartPostId === post.id && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.9] }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute pointer-events-none z-10"
                              >
                                <Heart size={80} className="text-blue-500 fill-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Actions Row */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button 
                                onClick={() => handleLikePost(post.id)}
                                className={`transition-transform active:scale-75 ${isLiked ? 'text-blue-500' : 'text-gray-400 hover:text-blue-600'}`}
                              >
                                <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
                              </button>
                              <button 
                                onClick={() => setSelectedPostForComments(post)}
                                className="text-gray-400 hover:text-blue-600 transition-transform active:scale-95"
                              >
                                <MessageCircle size={22} />
                              </button>
                              <button 
                                onClick={() => handleSharePost(post)}
                                className="text-gray-400 hover:text-blue-600 transition-transform active:scale-95"
                              >
                                <Share2 size={22} />
                              </button>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">{likes.length} Likes</span>
                          </div>

                          {/* Description */}
                          {post.content && (
                            <div className="text-left text-xs text-gray-600">
                              <span className="font-black uppercase tracking-tight text-blue-950 mr-1.5">{post.barber?.user?.name}</span>
                              {post.content}
                            </div>
                          )}

                          {/* Preview Comments List */}
                          {comments.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-gray-100">
                              {comments.slice(-2).map((cmt: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start text-[10px] text-gray-500 text-left">
                                  <p>
                                    <span className="font-bold text-blue-950 uppercase mr-1.5">{cmt.user?.name || 'Cliente'}</span>
                                    {cmt.content}
                                  </p>
                                </div>
                              ))}
                              {comments.length > 2 && (
                                <button 
                                  onClick={() => setSelectedPostForComments(post)}
                                  className="text-[8px] font-bold text-blue-500 uppercase tracking-widest block text-left"
                                >
                                  Ver todos os {comments.length} comentários
                                </button>
                              )}
                            </div>
                          )}

                          {/* Inline Fast Comment Form */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const input = e.currentTarget.elements.namedItem('commentInput') as HTMLInputElement;
                              handleCommentSubmit(post.id, input.value);
                              input.value = '';
                            }}
                            className="flex items-center space-x-2 pt-2"
                          >
                            <input 
                              name="commentInput"
                              type="text" 
                              placeholder="Adicione um comentário..." 
                              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-[10px] text-blue-950 focus:outline-none focus:border-blue-200 placeholder-gray-400"
                            />
                            <button type="submit" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-95">
                              <Send size={12} />
                            </button>
                          </form>

                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              
              /* TAB 2: REELS DUELS VERTICAL VIEWER */
              <motion.div
                key="duels"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col items-center justify-center p-4 relative"
              >
                {ongoingMatches.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 uppercase text-[10px] font-black">
                    Nenhuma batalha ativa acontecendo agora.
                  </div>
                ) : (
                  (() => {
                    const match = ongoingMatches[activeReelIndex];
                    const p1 = match.p1;
                    const p2 = match.p2;

                    const votes1 = match.votes?.filter((v: any) => v.choiceId === p1?.id)?.length || match.score1 || 0;
                    const votes2 = match.votes?.filter((v: any) => v.choiceId === p2?.id)?.length || match.score2 || 0;
                    const totalVotes = votes1 + votes2;
                    const pct1 = totalVotes > 0 ? Math.round((votes1 / totalVotes) * 100) : 50;
                    const pct2 = totalVotes > 0 ? Math.round((votes2 / totalVotes) * 100) : 50;
                    
                    const hasVoted = currentUser?.id && match.votes?.some((v: any) => v.userId === currentUser.id);
                    const votedFor = currentUser?.id && match.votes?.find((v: any) => v.userId === currentUser.id)?.choiceId;

                    return (
                      <div className="w-full max-w-sm aspect-[9/16] bg-zinc-950 rounded-[40px] border border-white/10 overflow-hidden relative flex flex-col justify-between shadow-2xl">
                        
                        {/* Duel Reels Header */}
                        <div className="p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent absolute top-0 inset-x-0 z-30 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-blue-500 text-[8px] uppercase font-black tracking-[0.25em] font-orbitron">Duelo em Andamento</span>
                            <h2 className="text-white text-xs font-black uppercase tracking-tight">{match.championship?.name || 'Campeonato'}</h2>
                          </div>
                          
                          <div className="bg-red-600 px-3 py-1 rounded-full flex items-center space-x-1.5 animate-pulse shadow-lg shadow-red-600/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span className="text-[7px] font-black font-orbitron uppercase tracking-wider">LIVE</span>
                          </div>
                        </div>

                        {/* Duel Image Comparator Split */}
                        <div className="flex-1 w-full bg-black relative flex flex-col md:flex-row overflow-hidden">
                          
                          {/* Player 1 Top/Left Side */}
                          <div className="flex-1 relative overflow-hidden group">
                            {match.photo1 ? (
                              <img src={match.photo1} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-gray-600 font-orbitron text-[8px] font-black uppercase">Falta Foto do Corte</div>
                            )}
                            
                            {/* Player Info Overlay */}
                            <div className="absolute bottom-6 left-6 z-20 text-left">
                              <span className="text-[7px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Corte #1</span>
                              <h3 className="text-sm font-black text-white uppercase mt-1 tracking-tight">{p1?.user?.name || 'Jogador 1'}</h3>
                              <p className="text-[7px] font-bold text-gray-300 uppercase">{p1?.barberShop || 'Barbearia'}</p>
                            </div>

                            {/* Direct vote action top overlay */}
                            {!hasVoted && (
                              <button 
                                onClick={() => handleVoteSubmit(p1.id, match.id, match.championshipId)}
                                className="absolute top-1/2 left-6 -translate-y-1/2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-orbitron text-[8px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all z-20"
                              >
                                Votar #1
                              </button>
                            )}
                          </div>

                          {/* Center Divider/VS Badge */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-lg">
                              <span className="text-white font-black italic text-xs font-orbitron">VS</span>
                            </div>
                          </div>

                          {/* Player 2 Bottom/Right Side */}
                          <div className="flex-1 relative overflow-hidden group">
                            {match.photo2 ? (
                              <img src={match.photo2} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-gray-600 font-orbitron text-[8px] font-black uppercase">Falta Foto do Corte</div>
                            )}

                            {/* Player Info Overlay */}
                            <div className="absolute bottom-6 right-6 z-20 text-right">
                              <span className="text-[7px] font-bold bg-white text-black px-2 py-0.5 rounded uppercase tracking-wider">Corte #2</span>
                              <h3 className="text-sm font-black text-white uppercase mt-1 tracking-tight">{p2 ? p2.user?.name : 'Vaga Aberta'}</h3>
                              <p className="text-[7px] font-bold text-gray-300 uppercase">{p2?.barberShop || ''}</p>
                            </div>

                            {/* Direct vote action bottom overlay */}
                            {p2 && !hasVoted && (
                              <button 
                                onClick={() => handleVoteSubmit(p2.id, match.id, match.championshipId)}
                                className="absolute top-1/2 right-6 -translate-y-1/2 bg-white text-black px-5 py-2.5 rounded-full font-orbitron text-[8px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all z-20"
                              >
                                Votar #2
                              </button>
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />
                        </div>

                        {/* Interactive HUD Actions Overlay (Instagram Reels Sidebar style) */}
                        <div className="absolute right-4 bottom-24 z-30 flex flex-col space-y-4 items-center">
                          
                          {/* Share button */}
                          <div className="flex flex-col items-center">
                            <button 
                              onClick={() => handleShareDuel(match)}
                              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 border border-white/5"
                            >
                              <Share2 size={16} />
                            </button>
                            <span className="text-[7px] font-bold uppercase tracking-wider text-gray-400 mt-1 shadow-sm">Compartilhar</span>
                          </div>

                          {/* Navigation Buttons to swipe through duels */}
                          <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
                            <button 
                              disabled={activeReelIndex === 0}
                              onClick={() => setActiveReelIndex(prev => prev - 1)}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-20 transition-all active:scale-75"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button 
                              disabled={activeReelIndex === ongoingMatches.length - 1}
                              onClick={() => setActiveReelIndex(prev => prev + 1)}
                              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-20 transition-all active:scale-75"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Duel Reels Footer (Real-Time stats and metrics) */}
                        <div className="p-6 bg-black/90 border-t border-white/5 relative z-20 flex flex-col space-y-4">
                          
                          {/* Real-time stats visualization */}
                          {hasVoted ? (
                            <div className="space-y-3 text-left">
                              <p className="text-[8px] font-black text-green-400 uppercase tracking-widest text-center">
                                ✓ Seu Voto foi Computado!
                              </p>
                              <div className="grid grid-cols-2 gap-3 text-center">
                                <div className={`p-3 rounded-2xl border ${votedFor === p1?.id ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-wider truncate">{p1?.user?.name}</p>
                                  <p className="text-base font-black font-orbitron text-white mt-1">{pct1}%</p>
                                </div>
                                <div className={`p-3 rounded-2xl border ${votedFor === p2?.id ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5'}`}>
                                  <p className="text-[7px] font-black text-gray-400 uppercase tracking-wider truncate">{p2?.user?.name || 'Desafiante'}</p>
                                  <p className="text-base font-black font-orbitron text-white mt-1">{pct2}%</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 bg-white/5 rounded-2xl border border-white/5">
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Selecione "Votar" na foto correspondente</span>
                            </div>
                          )}

                          {/* Reels counter indicator */}
                          <div className="flex justify-between items-center text-[7px] font-bold text-gray-500 uppercase tracking-widest pt-2 border-t border-white/5">
                            <span>Arena Oficial</span>
                            <span>{activeReelIndex + 1} de {ongoingMatches.length} Duelos</span>
                          </div>

                        </div>

                      </div>
                    );
                  })()
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* TOAST / ALERTS FLOATING SNACKBAR */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[8000] bg-blue-600 text-white font-orbitron font-black text-[9px] uppercase tracking-widest px-6 py-4 rounded-full shadow-2xl border border-blue-500/20 flex items-center space-x-2 whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SLIDING COMMENT PANEL DRAWER */}
      <AnimatePresence>
        {selectedPostForComments && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 z-[9000]"
              onClick={() => setSelectedPostForComments(null)}
            />
            {/* Drawer */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: isCommentsMinimized ? "calc(100% - 130px)" : 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              drag="y"
              dragControls={commentsDragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                 if (info.offset.y > 50) setIsCommentsMinimized(true);
                 else if (info.offset.y < -50) setIsCommentsMinimized(false);
              }}
              className="fixed inset-x-0 bottom-0 max-w-md mx-auto h-[65%] bg-white rounded-t-[45px] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] z-[9500] flex flex-col overflow-hidden text-blue-950 relative"
            >
              <button 
                 onPointerDown={(e) => commentsDragControls.start(e)}
                 onClick={() => setIsCommentsMinimized(!isCommentsMinimized)}
                 className="w-full py-4 mb-2 flex justify-center group pointer-events-auto touch-none absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md rounded-t-[45px]"
              >
                 <div className={`w-12 h-1.5 rounded-full transition-all ${isCommentsMinimized ? 'bg-blue-600 w-16' : 'bg-gray-100 group-hover:bg-gray-200'}`} />
              </button>
              <div className="mt-8" />
              {/* Drawer Header */}
              <div className="px-6 pb-4 pt-2 flex items-center justify-between border-b border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Comentários ({selectedPostForComments.comments?.length || 0})
                </span>
                <button 
                  onClick={() => setSelectedPostForComments(null)}
                  className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {selectedPostForComments.comments && selectedPostForComments.comments.length > 0 ? (
                  selectedPostForComments.comments.map((cmt: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 text-left">
                      <img 
                        src={cmt.user?.avatar || `https://i.pravatar.cc/100?u=${cmt.userId}`} 
                        className="w-7 h-7 rounded-full object-cover border border-gray-100 mt-0.5" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-black text-blue-950 uppercase tracking-tight">
                            {cmt.user?.name || 'Cliente'}
                          </span>
                          <span className="text-[7px] text-gray-500 uppercase">
                            {new Date(cmt.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 font-medium">{cmt.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-600 text-[9px] font-bold uppercase tracking-wider">
                    Sem comentários. Seja o primeiro a comentar!
                  </div>
                )}
              </div>

              {/* Drawer Footer input */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 pb-8">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommentSubmit(selectedPostForComments.id, newCommentText);
                  }}
                  className="flex items-center space-x-2"
                >
                  <input 
                    type="text" 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Adicione um comentário público..." 
                    className="flex-1 bg-white border border-gray-100 rounded-2xl px-4 py-3 text-xs text-blue-950 focus:outline-none focus:border-blue-200 placeholder-gray-400"
                  />
                  <button 
                    type="submit" 
                    className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
