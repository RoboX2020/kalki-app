// ====================================================================
// ChatSection.tsx - a conversation view: shows messages and sends new
// ones through the store.
// ====================================================================
import React, { useState, useRef, useEffect } from 'react';
import { Comment } from '../types';
import { getKalkiChatResponse } from '../services/geminiService';

interface ChatSectionProps {
  comments: Comment[];
  postId: string;
  onAddComment: (postId: string, text: string, isAi?: boolean) => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ comments, postId, onAddComment }) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    onAddComment(postId, userText);

    // Chance for Kalki (AI) to respond
    if (Math.random() > 0.3) {
       setIsSending(true);
       const history = comments.map(c => `${c.author}: ${c.text}`);
       const aiResponse = await getKalkiChatResponse(history, userText);
       if (aiResponse) {
         onAddComment(postId, aiResponse, true);
       }
       setIsSending(false);
    }
  };

  return (
    <div className="mt-6 bg-void/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-ember-500 mb-4 tracking-widest uppercase">
        Congregation ({comments.length})
      </h3>
      
      <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className={`flex flex-col ${comment.isAi ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-2 text-sm ${
              comment.isAi 
                ? 'bg-ember-900/30 border border-ember-600/50 text-ember-100' 
                : 'bg-white/5 text-gray-300'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${comment.isAi ? 'text-ember-500' : 'text-gray-500'}`}>
                  {comment.author}
                </span>
                {comment.isAi && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ember-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-ember-500"></span>
                  </span>
                )}
              </div>
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak your truth..."
          className="flex-1 bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ember-500 transition-colors placeholder-gray-600"
        />
        <button 
          type="button" // Change to button to prevent default submit if we want custom handling, but keeping form submit logic
          onClick={handleSubmit}
          disabled={!input.trim() || isSending}
          className="bg-white/10 hover:bg-ember-600 text-white p-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatSection;