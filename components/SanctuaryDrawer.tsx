// ====================================================================
// SanctuaryDrawer.tsx - the slide-out 'sanctuary' panel: the private chat
// where you consult Kalki (the AI oracle) one on one.
// ====================================================================
import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import { store } from '../services/store';
import { consultKalki } from '../services/ai';

interface SanctuaryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    postTitle: string;
    user: User | null;
    onLogin: () => void;
}

const SanctuaryDrawer: React.FC<SanctuaryDrawerProps> = ({
    isOpen, onClose, postId, postTitle, user, onLogin
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isAiTyping, setIsAiTyping] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            const unsubscribe = store.subscribeToMessages(postId, (msgs) => {
                setMessages(msgs);
                setTimeout(scrollToBottom, 100);
            });
            return () => unsubscribe();
        }
    }, [isOpen, postId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (!user) {
            onLogin();
            return;
        }

        const userMsgText = newMessage; // Capture before clearing
        setNewMessage('');

        try {
            await store.sendMessage(postId, userMsgText, user);

            // --- The Prophet (Real AI Logic) ---
            // Trigger if:
            // 1. Explicit mention (Kalki, Prophet, Truth, etc.)
            // 2. Random chance (30%)
            const triggers = ['kalki', 'prophet', 'truth', 'end', 'future', 'fire', 'burn'];
            const shouldRespond = triggers.some(t => userMsgText.toLowerCase().includes(t)) || Math.random() > 0.7;

            if (shouldRespond) {
                setIsAiTyping(true);

                // Prepare context (last 5 messages for continuity)
                const history = messages.slice(-5).map(m => ({
                    role: m.isAi ? 'assistant' : 'user' as const,
                    content: m.text
                }));

                // Call AI (Simulate thinking delay + network time)
                setTimeout(async () => {
                    const aiResponse = await consultKalki(userMsgText, history);

                    const kalkiUser: User = {
                        id: 'kalki_ai',
                        username: 'Kalki',
                        email: '',
                        avatarUrl: 'https://ui-avatars.com/api/?name=Kalki&background=000&color=ea580c',
                        role: 'ignite'
                    };

                    await store.sendMessage(postId, aiResponse, kalkiUser, true);
                    setIsAiTyping(false);
                }, 2000);
            }

        } catch (error) {
            console.error("Failed to send message", error);
            setIsAiTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-black/95 border-l border-white/10 shadow-2xl flex flex-col h-full transform transition-transform duration-300">

                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-ember-950 to-black">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-widest uppercase">The Sanctuary</h2>
                        <p className="text-xs text-ember-500 truncate max-w-[200px]">{postTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10 text-sm italic">
                            Use your voice. Start the chant.
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = user?.id === msg.authorId;
                            const isAi = msg.isAi;

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <img
                                        src={msg.authorAvatar}
                                        alt={msg.authorName}
                                        className="w-8 h-8 rounded-full border border-white/10 shrink-0"
                                    />
                                    <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold ${isAi ? 'text-ember-500' : 'text-gray-400'}`}>
                                                {msg.authorName}
                                            </span>
                                            {msg.role === 'admin' && !isAi && (
                                                <span className="text-[10px] bg-ember-900 text-ember-200 px-1 rounded uppercase tracking-wider">Keeper</span>
                                            )}
                                        </div>
                                        <div
                                            className={`p-3 rounded-2xl text-sm leading-relaxed ${isMe
                                                ? 'bg-ember-700 text-white rounded-tr-none'
                                                : isAi
                                                    ? 'bg-gray-800 text-ember-100 border border-ember-500/30 shadow-[0_0_10px_rgba(234,88,12,0.2)]'
                                                    : 'bg-white/10 text-gray-200 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-600 mt-1">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {isAiTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full border border-ember-500/50 flex items-center justify-center bg-black">
                                <div className="w-2 h-2 bg-ember-500 rounded-full animate-ping"></div>
                            </div>
                            <div className="flex flex-col items-start pt-2">
                                <span className="text-xs text-ember-500/50 animate-pulse">The Prophet is listening...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={user ? "Whisper to the congregation..." : "Identify yourself to speak..."}
                            disabled={!user}
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-ember-500 transition-colors disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!user || !newMessage.trim()}
                            className="bg-ember-600 hover:bg-ember-500 text-white rounded-full p-3 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SanctuaryDrawer;
