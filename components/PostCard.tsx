import React, { useState } from 'react';
import { Post } from '../types';
import TheVeil from './TheVeil';
import PulseButton from './PulseButton';

interface PostCardProps {
  post: Post;
  userRank: string | undefined;
  onRaiseVoice: (id: string) => void;
  onDonate: (id: string, amount: number) => void;
  onSupportDemand: (postId: string, demandId: string) => void;
  onEnterSanctuary: (postId: string, title: string) => void;
  onIgnitePulse: (postId: string) => void;
  onParticipatePulse: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  userRank,
  onRaiseVoice,
  onDonate,
  onSupportDemand,
  onEnterSanctuary,
  onIgnitePulse,
  onParticipatePulse
}) => {
  const [donateAmount, setDonateAmount] = useState<string>('');

  const percentage = Math.min(100, (post.fundraisedAmount / post.fundraisingGoal) * 100);

  const handleDonate = () => {
    const amount = parseFloat(donateAmount);
    if (amount > 0) {
      onDonate(post.id, amount);
      setDonateAmount('');
    }
  };

  return (
    <div className="bg-black/80 border border-white/10 rounded-xl overflow-hidden mb-8 shadow-2xl backdrop-blur-md relative group">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-ember-600/0 via-ember-600/5 to-ember-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {post.imageUrl && (
        <TheVeil userRank={userRank} requiredRank="initiate" blurAmount="sm" fallbackMessage="Join to see the vision.">
          <div className="h-64 w-full overflow-hidden relative">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-wider">{post.title}</h2>
              <div className="flex items-center gap-2 text-xs text-ember-400">
                <span>Started by {post.author}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </TheVeil>
      )}

      <div className="p-6">
        {!post.imageUrl && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-wider">{post.title}</h2>
            <div className="flex items-center gap-2 text-xs text-ember-400">
              <span>Started by {post.author}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* The Pulse Ritual */}
        <div className="mb-6">
          <PulseButton
            pulse={post.pulse}
            onIgnite={() => onIgnitePulse(post.id)}
            onParticipate={() => onParticipatePulse(post.id)}
            isUserInitated={!!userRank && userRank !== 'unbeliever'}
          />
        </div>

        <TheVeil userRank={userRank} requiredRank="initiate" fallbackMessage="Only the initiated may read the scripture.">
          {post.kalkiWisdom && (
            <div className="mb-6 p-4 border-l-2 border-ember-600 bg-ember-900/10 italic text-ember-100/80 text-sm font-light">
              <span className="block text-xs font-bold text-ember-500 mb-1 uppercase tracking-widest">Kalki's Prophecy</span>
              "{post.kalkiWisdom}"
            </div>
          )}

          {post.tenets && post.tenets.length > 0 && (
            <div className="mb-6 bg-white/5 p-4 rounded border border-white/10">
              <h3 className="text-xs uppercase tracking-[0.2em] text-ember-500 mb-2">The Code</h3>
              <ul className="space-y-1">
                {post.tenets.map(tenet => (
                  <li key={tenet.id} className="text-sm text-gray-300">
                    <span className="font-bold text-ember-200">{tenet.title}:</span> {tenet.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-gray-300 leading-relaxed mb-6 font-light">
            {post.description}
          </p>
        </TheVeil>

        {/* Demands Section */}
        {post.demands && post.demands.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-ember-500 mb-3 border-b border-ember-900/50 pb-2">Active Demands</h3>
            <div className="space-y-3">
              {post.demands.map(demand => (
                <div key={demand.id} className="flex items-start justify-between bg-white/5 p-3 rounded-md border border-white/5 hover:border-ember-500/30 transition-colors">
                  <div className="mr-4">
                    <div className="text-xs text-ember-400 font-bold uppercase mb-1">To: {demand.target}</div>
                    <div className="text-sm text-gray-200">{demand.description}</div>
                  </div>
                  <button
                    onClick={() => onSupportDemand(post.id, demand.id)}
                    className="flex flex-col items-center justify-center min-w-[60px] p-1 bg-black/50 rounded border border-white/10 hover:bg-ember-600 hover:text-white group/demand transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500 group-hover/demand:text-white mb-1">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-bold">{demand.supportCount}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fundraising Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-widest">
            <span>Tribute Raised</span>
            <span>{percentage.toFixed(0)}% of ${post.fundraisingGoal}</span>
          </div>
          <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
            <div
              className="h-full bg-ember-600 shadow-[0_0_10px_rgba(234,88,12,0.8)] transition-all duration-1000"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              placeholder="$"
              className="bg-transparent border border-white/20 rounded px-3 py-1 text-sm w-20 text-white focus:border-ember-500 focus:outline-none"
            />
            <button
              onClick={handleDonate}
              className="text-xs uppercase tracking-widest bg-white/5 hover:bg-ember-600/20 border border-white/10 hover:border-ember-500 text-white px-4 py-1 rounded transition-all"
            >
              Give Tribute
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex gap-4">
            <button
              onClick={() => onRaiseVoice(post.id)}
              className="flex items-center gap-2 text-gray-400 hover:text-ember-500 transition-colors group/btn"
            >
              <div className="p-2 rounded-full bg-white/5 group-hover/btn:bg-ember-600/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                </svg>
              </div>
              <span className="font-bold">{post.voicesCount}</span>
              <span className="text-xs uppercase tracking-widest hidden sm:inline">Voices Raised</span>
            </button>
          </div>

          <TheVeil userRank={userRank} requiredRank="initiate" blurAmount="sm" fallbackMessage="">
            <button
              onClick={() => onEnterSanctuary(post.id, post.title)}
              className="flex items-center gap-2 text-ember-400 hover:text-white transition-colors bg-ember-900/10 hover:bg-ember-600/20 px-4 py-2 rounded-full border border-ember-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span className="text-xs uppercase tracking-widest font-bold">Enter Sanctuary</span>
            </button>
          </TheVeil>
        </div>
      </div>
    </div>
  );
};

export default PostCard;