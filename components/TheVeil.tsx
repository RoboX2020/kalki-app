// ====================================================================
// TheVeil.tsx - the entry gate: a dramatic full-screen intro you pass
// through before entering the app. Pure theater.
// ====================================================================
import React from 'react';

interface TheVeilProps {
    children: React.ReactNode;
    userRank: string | undefined; // 'unbeliever' | 'initiate' | 'disciple' | 'keeper'
    requiredRank: 'initiate' | 'disciple' | 'keeper';
    fallbackMessage?: string;
    blurAmount?: 'sm' | 'md' | 'lg' | 'xl';
}

const TheVeil: React.FC<TheVeilProps> = ({
    children,
    userRank = 'unbeliever',
    requiredRank,
    fallbackMessage = "The truth is hidden from the initiated.",
    blurAmount = 'md'
}) => {

    const rankValues = {
        'unbeliever': 0,
        'initiate': 1,
        'disciple': 2,
        'keeper': 3
    };

    const hasAccess = rankValues[userRank as keyof typeof rankValues] >= rankValues[requiredRank];

    if (hasAccess) {
        return <>{children}</>;
    }

    const blurClass = {
        'sm': 'blur-sm',
        'md': 'blur-md',
        'lg': 'blur-lg',
        'xl': 'blur-xl'
    }[blurAmount];

    return (
        <div className="relative overflow-hidden group">
            <div className={`${blurClass} select-none pointer-events-none opacity-50 transition-all duration-700 group-hover:blur-sm`}>
                {children}
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center shadow-2xl transform transition-transform group-hover:scale-105">
                    <div className="w-8 h-8 mx-auto mb-2 text-ember-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Veiled Content</h3>
                    <p className="text-xs text-gray-400 max-w-[200px] mb-3">{fallbackMessage}</p>

                    <div className="text-[10px] text-ember-600 bg-ember-900/20 py-1 px-2 rounded border border-ember-900/50 uppercase tracking-widest">
                        Requires Rank: {requiredRank}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheVeil;
