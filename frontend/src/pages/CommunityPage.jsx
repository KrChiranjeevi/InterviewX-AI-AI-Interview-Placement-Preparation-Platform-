import React, { useState, useEffect } from 'react';


import { getCommunityPosts, createCommunityPost, replyToPost, likePost, getLeaderboard } from '../services/api';
import toast from 'react-hot-toast';
import { FaHeart, FaComment, FaPaperPlane } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { Users2, Trophy, Sparkles, Send, MessageSquare, Heart, ChevronDown, ChevronUp, Flame, Zap, Star, Plus } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const Blob = ({ cx, cy, color, r, delay = 0 }) => (
  <div
    className="pointer-events-none absolute rounded-full animate-blob opacity-60"
    style={{
      left: `${cx}%`, top: `${cy}%`, width: r, height: r,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      animationDelay: `${delay}s`
    }}
  />
);

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const TOPICS = ['System Design', 'Behavioral', 'DSA', 'Frontend', 'Backend', 'AI/ML', 'Resume Tips', 'Offer Negotiation'];

const CommunityPage = () => {
  const [posts, setPosts]       = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newPostTitle, setNewPostTitle]     = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [activeReply, setActiveReply]       = useState(null);
  const [replyContent, setReplyContent]     = useState('');
  const [showComposer, setShowComposer]     = useState(false);
  const [activeTopic, setActiveTopic]       = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [postsRes, leaderboardRes] = await Promise.all([getCommunityPosts(), getLeaderboard()]);
      setPosts(postsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch { toast.error('Failed to load community data'); }
    setLoading(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    try {
      const { data } = await createCommunityPost({ title: newPostTitle, content: newPostContent });
      setPosts([data, ...posts]);
      setNewPostTitle(''); setNewPostContent('');
      setShowComposer(false);
      toast.success('Post created!');
    } catch { toast.error('Failed to create post'); }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await likePost(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
    } catch { toast.error('Failed to like post'); }
  };

  const handleReply = async (e, postId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      const { data } = await replyToPost(postId, replyContent);
      setPosts(posts.map(p => p._id === postId ? data : p));
      setReplyContent(''); setActiveReply(null);
      toast.success('Reply posted!');
    } catch { toast.error('Failed to reply'); }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#09090b] items-center justify-center">
        <div className="relative h-14 w-14">
          <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-pink-500 border-r-fuchsia-500" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
          <Users2 className="absolute inset-0 m-auto h-5 w-5 text-pink-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Blob cx={10} cy={15}  color="rgba(236,72,153,0.55)"  r={480} delay={0} />
        <Blob cx={88} cy={10}  color="rgba(168,85,247,0.45)"  r={360} delay={3} />
        <Blob cx={55} cy={82}  color="rgba(245,158,11,0.25)"  r={320} delay={6} />
        <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: 'linear-gradient(rgba(236,72,153,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(236,72,153,0.6) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Peer Interview & Feedback" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        <main className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 pb-16 pt-5">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ── Main Feed ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Hero / Peer Interview Banner */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-900/20 to-fuchsia-900/10 p-5">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent pointer-events-none" />
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-pink-500/15 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/30">
                      <Users2 className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">Peer Mock Interviews</h3>
                      <p className="text-muted-foreground text-xs mt-0.5">Find a partner and practice together to sharpen your skills</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 px-4 py-2 text-sm font-bold text-foreground shadow-lg flex-shrink-0">
                    <Sparkles className="h-4 w-4" /> Find Partner
                  </motion.button>
                </div>
              </motion.div>

              {/* Topic filters */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button onClick={() => setActiveTopic('')} className={`flex-shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${activeTopic === '' ? 'border-pink-500/50 bg-pink-500/15 text-pink-300' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>All Topics</button>
                {TOPICS.map(t => (
                  <button key={t} onClick={() => setActiveTopic(t === activeTopic ? '' : t)} className={`flex-shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${activeTopic === t ? 'border-pink-500/50 bg-pink-500/15 text-pink-300' : 'border-border bg-secondary text-muted-foreground hover:text-foreground'}`}>{t}</button>
                ))}
              </div>

              {/* Create Post */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {!showComposer ? (
                  <button onClick={() => setShowComposer(true)} className="w-full flex items-center gap-3 rounded-2xl border border-border bg-secondary px-5 py-3.5 text-muted-foreground hover:text-foreground hover:bg-secondary hover:border-border transition-all text-sm text-left">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500/20 to-fuchsia-500/20 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">+</div>
                    Share your interview experience, ask a question, or post a tip…
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-pink-500/20 bg-secondary p-5 backdrop-blur-sm">
                    <form onSubmit={handleCreatePost} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Discussion title…"
                        value={newPostTitle}
                        onChange={e => setNewPostTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground placeholder-zinc-600 focus:outline-none focus:border-pink-500/40 transition-colors"
                      />
                      <textarea
                        placeholder="Share your experience, question, or tip…"
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-pink-500/40 transition-colors resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setShowComposer(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-2 text-sm font-bold text-foreground shadow-lg">
                          <Send className="h-4 w-4" /> Publish Post
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </motion.div>

              {/* Posts Feed */}
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                {posts.length === 0 ? (
                  <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-border bg-secondary">
                    <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity }}><MessageSquare className="h-12 w-12 text-zinc-700 mb-3" /></motion.div>
                    <p className="text-muted-foreground text-sm font-medium">No discussions yet.</p>
                    <p className="text-zinc-600 text-xs mt-1">Be the first to start one!</p>
                    <button onClick={() => setShowComposer(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-pink-600/20 border border-pink-500/20 px-4 py-2 text-xs font-medium text-pink-400 hover:bg-pink-600/30 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Create First Post
                    </button>
                  </motion.div>
                ) : (
                  posts.map((post, pi) => (
                    <motion.div
                      key={post._id}
                      variants={fadeUp}
                      whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      className="group relative overflow-hidden rounded-2xl border border-border bg-secondary backdrop-blur-sm hover:border-border transition-all"
                    >
                      {/* Hover glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(236,72,153,0.05) 0%, transparent 60%)' }} />

                      <div className="relative z-10 p-5">
                        {/* Post header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {post.user?.profileImage ? (
                              <img src={post.user.profileImage} alt="" className="h-9 w-9 rounded-full border border-border object-cover" />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/30 to-fuchsia-500/20 border border-pink-500/20 text-sm font-bold text-pink-400">
                                {post.user?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-foreground">{post.user?.name || 'Anonymous'}</p>
                              <p className="text-[11px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          {post.user?.badges?.length > 0 && (
                            <div className="flex gap-1 flex-shrink-0">
                              {post.user.badges.slice(0, 2).map((b, i) => <span key={i} className="text-base" title={b}>{b.includes('Fast') ? '⚡' : '🏆'}</span>)}
                            </div>
                          )}
                        </div>

                        <h3 className="font-bold text-foreground text-base mb-2 leading-tight">{post.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4 whitespace-pre-wrap line-clamp-4">{post.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 border-t border-border pt-3">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleLike(post._id)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-pink-400 transition-colors">
                            <Heart className="h-4 w-4" /> <span>{post.likes?.length || 0}</span>
                          </motion.button>
                          <button onClick={() => setActiveReply(activeReply === post._id ? null : post._id)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-indigo-400 transition-colors">
                            <MessageSquare className="h-4 w-4" /> <span>{post.comments?.length || 0} {activeReply === post._id ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />}</span>
                          </button>
                        </div>

                        {/* Reply section */}
                        <AnimatePresence>
                          {activeReply === post._id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-3 overflow-hidden">
                              <form onSubmit={e => handleReply(e, post._id)} className="flex gap-2">
                                <input type="text" placeholder="Write a reply…" value={replyContent} onChange={e => setReplyContent(e.target.value)}
                                  className="flex-1 rounded-xl border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder-zinc-600 focus:outline-none focus:border-indigo-500/40 transition-colors" />
                                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} type="submit" className="flex-shrink-0 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors">
                                  <Send className="h-3.5 w-3.5" />
                                </motion.button>
                              </form>
                              <div className="space-y-2">
                                {post.comments?.map((comment, cidx) => (
                                  <motion.div key={cidx} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: cidx * 0.06 }} className="flex gap-3 rounded-xl border border-border bg-secondary p-3">
                                    {comment.user?.profileImage ? (
                                      <img src={comment.user.profileImage} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold text-muted-foreground">{comment.user?.name?.charAt(0) || 'U'}</div>
                                    )}
                                    <div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-semibold text-foreground">{comment.user?.name || 'Anonymous'}</span>
                                        <span className="text-[10px] text-zinc-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{comment.content}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>

            {/* ── Sidebar: Leaderboard ── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Leaderboard Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="sticky top-4 rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600">
                      <Trophy className="h-3.5 w-3.5 text-foreground" />
                    </div>
                    <h2 className="font-bold text-foreground text-sm">Leaderboard</h2>
                  </div>
                  <span className="text-[10px] font-bold rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 px-2 py-0.5">Top 20</span>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((user, i) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${user.rank <= 3 ? 'border border-yellow-500/10 bg-gradient-to-r from-yellow-900/20 to-transparent' : 'hover:bg-secondary'}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 text-center text-xs font-bold flex-shrink-0 ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-zinc-300' : user.rank === 3 ? 'text-amber-600' : 'text-zinc-600'}`}>
                          {RANK_MEDAL[user.rank] || `#${user.rank}`}
                        </div>
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="h-7 w-7 rounded-full object-cover border border-border flex-shrink-0" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-xs font-bold text-muted-foreground flex-shrink-0">{user.name.charAt(0)}</div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.interviewsCompleted} interviews</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-indigo-400">{user.averageScore}</p>
                        <p className="text-[10px] text-zinc-600">avg</p>
                      </div>
                    </motion.div>
                  ))}
                  {leaderboard.length === 0 && <p className="text-center text-zinc-600 text-xs py-6">No data yet. Take an interview to get ranked!</p>}
                </div>
              </motion.div>

              {/* Trending Topics */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <h3 className="font-bold text-foreground text-sm">Trending Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t, i) => (
                    <motion.button key={t} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}
                      onClick={() => setActiveTopic(t === activeTopic ? '' : t)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${activeTopic === t ? 'border-pink-500/40 bg-pink-500/15 text-pink-300' : 'border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-border'}`}>
                      #{t.replace(/ /g, '')}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityPage;
