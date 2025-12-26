import React, { useState, useEffect } from 'react';
import { Pulse } from '../types';

interface PulseButtonProps {
    pulse: Pulse | undefined;
    onIgnite: () => void;
    onParticipate: () => void;
    isUserInitated: boolean; // Must be at least initiated to participate
}

const PulseButton: React.FC<PulseButtonProps> = ({ pulse, onIgnite, onParticipate, isUserInitated }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isSparking, setIsSparking] = useState(false);

    useEffect(() => {
        if (!pulse) return;

        const interval = setInterval(() => {
            if (pulse.isActive) {
                setTimeLeft('ACTIVE');
                return;
            }

            const now = Date.now();
            const diff = pulse.nextRitual - now;

            if (diff <= 0) {
                // Ready to ignite
                setTimeLeft('READY');
            } else {
                // Countdown
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [pulse]);

    const handleClick = () => {
        if (!isUserInitated) return;

        setIsSparking(true);
        setTimeout(() => setIsSparking(false), 500);

        if (pulse?.isActive) {
            onParticipate();
        } else if (timeLeft === 'READY') {
            onIgnite();
        }
    };

    if (!pulse) return null;

    const isReady = timeLeft === 'READY';
    const isActive = pulse.isActive;

    return (
        <div className="relative group">
            {/* Ritualistic Border/Glow */}
            <div className={`absolute -inset-1 rounded-full blur opacity-40 transition duration-1000 group-hover:opacity-100 ${isActive ? 'bg-red-600 animate-pulse' : 'bg-ember-900'
                }`} />

            <button
                onClick={handleClick}
                disabled={!isUserInitated || (!isReady && !isActive)}
                className={`
            relative w-full rounded-full px-4 py-2 flex items-center justify-center gap-2 border transition-all duration-300
            ${isActive
                        ? 'bg-red-900/80 border-red-500 text-red-200 animate-pulse-fast'
                        : isReady
                            ? 'bg-ember-900 border-ember-500 text-white animate-pulse'
                            : 'bg-black/80 border-white/10 text-gray-500'
                    }
            ${!isUserInitated && 'opacity-50 cursor-not-allowed'}
            ${isSparking && 'scale-95'}
         `}
            >
                {isActive ? (
                    <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="font-bold tracking-widest uppercase">IGNITE ({pulse.participationCount})</span>
                    </>
                ) : isReady ? (
                    <span className="font-bold tracking-widest uppercase animate-flicker">Start Ritual</span>
                ) : (
                    <span className="font-mono text-xs">{timeLeft}</span>
                )}
            </button>

            {isActive && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center overflow-hidden">
                    {/* Particle effects could go here */}
                    <div className="w-20 h-20 bg-red-500 rounded-full blur-3xl opacity-20 animate-ping"></div>
                </div>
            )}
        </div>
    );
};

export default PulseButton;
