import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { getCommunityPosts, createCommunityPost, replyToPost, likePost, getLeaderboard } from '../services/api';
import toast from 'react-hot-toast';
import { FaHeart, FaComment, FaPaperPlane } from 'react-icons/fa';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  const [activeReply, setActiveReply] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, leaderboardRes] = await Promise.all([
        getCommunityPosts(),
        getLeaderboard()
      ]);
      setPosts(postsRes.data);
      setLeaderboard(leaderboardRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load community data');
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    try {
      const { data } = await createCommunityPost({ title: newPostTitle, content: newPostContent });
      setPosts([data, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      toast.success('Post created!');
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await likePost(postId);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, likes: data.likes };
        }
        return post;
      }));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleReply = async (e, postId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    try {
      const { data } = await replyToPost(postId, replyContent);
      setPosts(posts.map(post => post._id === postId ? data : post));
      setReplyContent('');
      setActiveReply(null);
      toast.success('Reply posted!');
    } catch (error) {
      toast.error('Failed to reply');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Learn, compete and practice together" />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Discussion Feed (Left / Main) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Peer Mock Interview Banner */}
              <div className="glass-card rounded-3xl p-6 border border-indigo-500/30 bg-indigo-900/10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-indigo-400">Peer Mock Interviews</h3>
                  <p className="text-slate-400 text-sm mt-1">Find a practice partner and schedule a mock interview to test your skills.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shrink-0">
                  Find Partner
                </button>
              </div>

              {/* Create Post */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800">
                <form onSubmit={handleCreatePost}>
                  <input 
                    type="text" 
                    placeholder="Discussion Title..."
                    value={newPostTitle}
                    onChange={e => setNewPostTitle(e.target.value)}
                    className="w-full bg-slate-900/50 border-none text-lg text-white font-semibold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-3"
                  />
                  <textarea
                    placeholder="Share your interview experience, ask a question, or post a tip..."
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none mb-3"
                  ></textarea>
                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center">
                      <FaPaperPlane className="mr-2" /> Post
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed List */}
              <div className="space-y-6">
                {posts.map(post => (
                  <div key={post._id} className="glass-card rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {post.user?.profileImage ? (
                          <img src={post.user.profileImage} alt="" className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                            {post.user?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-200">{post.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      {post.user?.badges?.length > 0 && (
                        <div className="flex space-x-1">
                          {post.user.badges.slice(0, 2).map((b, i) => (
                            <span key={i} className="text-lg" title={b}>{b.includes('Fast') ? '⚡' : '🏆'}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <p className="text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex items-center space-x-6 border-t border-slate-800 pt-4">
                      <button onClick={() => handleLike(post._id)} className={`flex items-center space-x-2 transition-colors ${post.likes?.includes(post.user?._id) ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}>
                        <FaHeart />
                        <span>{post.likes?.length || 0}</span>
                      </button>
                      <button onClick={() => setActiveReply(activeReply === post._id ? null : post._id)} className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors">
                        <FaComment />
                        <span>{post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {/* Replies */}
                    {activeReply === post._id && (
                      <div className="mt-6 space-y-4">
                        <form onSubmit={(e) => handleReply(e, post._id)} className="flex space-x-3">
                          <input 
                            type="text" 
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-sm"
                          />
                          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                            Reply
                          </button>
                        </form>
                        
                        <div className="space-y-4 mt-4">
                          {post.comments?.map((comment, idx) => (
                            <div key={idx} className="flex space-x-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                              {comment.user?.profileImage ? (
                                <img src={comment.user.profileImage} alt="" className="w-8 h-8 rounded-full border border-slate-700 shrink-0 object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold shrink-0">
                                  {comment.user?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-baseline space-x-2">
                                  <span className="font-semibold text-sm text-slate-200">{comment.user?.name || 'Anonymous'}</span>
                                  <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-300 text-sm mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {posts.length === 0 && (
                  <div className="text-center py-12 glass-card rounded-3xl border border-slate-800">
                    <p className="text-slate-400">No discussions yet. Be the first to start one!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard (Right Side) */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-3xl p-6 border border-slate-800 sticky top-0">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="mr-2">🏆</span> Leaderboard
                  </h2>
                  <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">Top 20</span>
                </div>
                
                <div className="space-y-4">
                  {leaderboard.map((user) => (
                    <div key={user._id} className={`flex items-center justify-between p-3 rounded-xl ${user.rank <= 3 ? 'bg-gradient-to-r from-indigo-900/30 to-transparent border border-indigo-500/20' : 'bg-slate-900/50 hover:bg-slate-800 transition-colors'}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 flex items-center justify-center font-bold text-sm ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-slate-300' : user.rank === 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                          #{user.rank}
                        </div>
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-slate-200">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.interviewsCompleted} interviews</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-400">{user.averageScore}</p>
                        <p className="text-xs text-slate-500">avg score</p>
                      </div>
                    </div>
                  ))}
                  
                  {leaderboard.length === 0 && (
                    <p className="text-center text-slate-500 text-sm py-4">No data yet. Take an interview to get ranked!</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityPage;
