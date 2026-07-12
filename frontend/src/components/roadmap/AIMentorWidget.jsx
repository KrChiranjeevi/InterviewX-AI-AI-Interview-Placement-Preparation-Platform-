import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaExpand, FaCompress, FaPaperPlane, FaUser } from 'react-icons/fa';
import { askMentor } from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIMentorWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'mentor', content: 'Hi there! I am your AI Career Mentor. Ask me what to study today, how to prepare for interviews, or check your readiness!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isFullScreen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data } = await askMentor(userMsg, newMessages.slice(0, -1));
      setMessages([...newMessages, { role: 'mentor', content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'mentor', content: "I'm having connection issues right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (q) => {
    setInput(q);
  };

  // 1. Minimized State (Bubble)
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform z-50 animate-bounce"
      >
        <FaRobot />
      </button>
    );
  }

  // 2. Full Screen Mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
              <FaRobot />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">AI Mentor Workspace</h3>
              <p className="text-slate-400 text-xs">Full ChatGPT-style experience with your career data</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsFullScreen(false)} className="text-slate-400 hover:text-white transition-colors" title="Minimize">
              <FaCompress />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-400 transition-colors" title="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'mentor' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                    <FaRobot />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'}`}>
                  {msg.role === 'mentor' ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm">
                    <FaUser />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm"><FaRobot /></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900 border-t border-slate-800 p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length < 3 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {['What should I study today?', 'Am I ready for Amazon?', 'How can I improve my DSA?'].map(q => (
                  <button key={q} onClick={() => handleQuickQuestion(q)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-full px-3 py-1.5 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI Mentor anything about your career..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Floating Widget Mode (Right corner)
  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <FaRobot className="text-xl" />
          <span className="font-bold">AI Mentor</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFullScreen(true)} className="hover:text-indigo-200 transition-colors" title="Expand">
            <FaExpand className="text-sm" />
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:text-red-200 transition-colors" title="Close">
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-950/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'mentor' && <div className="w-6 h-6 mt-1 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]"><FaRobot /></div>}
            <div className={`max-w-[85%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
               {msg.role === 'mentor' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-snug">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
             <div className="w-6 h-6 mt-1 shrink-0 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]"><FaRobot /></div>
             <div className="bg-slate-800 rounded-xl rounded-bl-none p-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (only show if few messages) */}
      {messages.length < 4 && (
        <div className="px-4 pb-2 bg-slate-900 border-t border-slate-800 pt-3 flex flex-wrap gap-2">
          {['Study Plan', 'Interview Prep', 'Next Topic'].map(q => (
            <button key={q} onClick={() => handleQuickQuestion(q)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-full px-2 py-1 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Mentor..."
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-md bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 text-xs"
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIMentorWidget;
