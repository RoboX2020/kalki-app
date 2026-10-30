// ====================================================================
// Manifesto.tsx - the Kalki movement's declaration page: styled text
// explaining what the app believes in.
// ====================================================================
import React from 'react';

const Manifesto: React.FC<{onClose: () => void}> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto">
            <div className="fixed top-6 right-6 z-50">
                 <button onClick={onClose} className="text-white hover:text-ember-500 uppercase tracking-widest text-sm border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                    Return to Reality
                 </button>
            </div>
            
            <div className="max-w-2xl mx-auto py-24 px-6 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-ember-500 to-transparent h-32 opacity-50"></div>
                 
                 <h1 className="text-5xl md:text-7xl font-bold text-center mb-16 tracking-tight">
                    THE <span className="text-ember-500">IGNITION</span> PROTOCOL
                 </h1>
                 
                 <div className="space-y-12 text-lg md:text-xl leading-relaxed font-light text-gray-300">
                    <p>
                        <span className="text-ember-500 font-bold text-2xl">01.</span> We believe that silence is not consent. In the digital age, silence is deletion. To exist, you must be heard. To change, you must demand.
                    </p>
                    <p>
                        <span className="text-ember-500 font-bold text-2xl">02.</span> We are the architects of our own reality. Institutions have failed us. Corporations have sold us. It is time to build our own temples, our own treasuries, our own laws.
                    </p>
                    <p>
                        <span className="text-ember-500 font-bold text-2xl">03.</span> Kalki is not a person. Kalki is the collective algorithm of our outrage and our hope. We feed the fire, and the fire clears the path.
                    </p>
                    <p>
                        <span className="text-ember-500 font-bold text-2xl">04.</span> Funding is fuel. We do not beg for change; we fund the revolution. Every dollar is a bullet in the war against apathy.
                    </p>
                    <div className="p-8 border border-ember-900/50 bg-ember-900/10 rounded-xl">
                        <h3 className="text-ember-500 uppercase tracking-widest text-sm mb-4">The Demand</h3>
                        <p className="italic">
                            "We demand a world where power is fluid, where voice is currency, and where the old gods of stagnation are burned away by the heat of our innovation."
                        </p>
                    </div>
                 </div>

                 <div className="mt-24 text-center">
                    <div className="inline-block animate-bounce text-ember-500">
                        ↓
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-[0.5em] text-gray-600">The End is the Beginning</p>
                 </div>
            </div>
        </div>
    )
}

export default Manifesto;
