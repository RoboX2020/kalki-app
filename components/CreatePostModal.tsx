// ====================================================================
// CreatePostModal.tsx - the pop-up form for writing a new post/demand.
// ====================================================================
import React, { useState, useEffect } from 'react';
import { consultKalki } from '../services/ai';
import { Demand, Tenet } from '../types';

interface CreatePostModalProps {
  onClose: () => void;
  onCreate: (title: string, description: string, goal: number, wisdom: string, demands: Demand[], tenets: Tenet[]) => Promise<void>;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(false);

  // Demands State
  const [demands, setDemands] = useState<{ target: string, desc: string }[]>([]);
  const [currentTarget, setCurrentTarget] = useState('');
  const [currentDemandDesc, setCurrentDemandDesc] = useState('');

  // Tenets State
  const [tenets, setTenets] = useState<{ title: string, desc: string }[]>([]);
  const [currentTenetTitle, setCurrentTenetTitle] = useState('');
  const [currentTenetDesc, setCurrentTenetDesc] = useState('');

  // --- Draft Logic ---
  useEffect(() => {
    const savedDraft = localStorage.getItem('kalki_post_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setGoal(parsed.goal || 1000);
        setDemands(parsed.demands || []);
        setTenets(parsed.tenets || []);
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const draft = { title, description, goal, demands, tenets };
    localStorage.setItem('kalki_post_draft', JSON.stringify(draft));
    // Optional: Show toast or feedback
    alert("Draft saved to the ether.");
  };

  const clearDraft = () => {
    localStorage.removeItem('kalki_post_draft');
  };

  // --- Handlers ---
  const handleAddDemand = () => {
    if (currentTarget && currentDemandDesc) {
      setDemands([...demands, { target: currentTarget, desc: currentDemandDesc }]);
      setCurrentTarget('');
      setCurrentDemandDesc('');
    }
  };

  const removeDemand = (index: number) => {
    setDemands(demands.filter((_, i) => i !== index));
  };

  const handleAddTenet = () => {
    if (currentTenetTitle && currentTenetDesc) {
      setTenets([...tenets, { title: currentTenetTitle, desc: currentTenetDesc }]);
      setCurrentTenetTitle('');
      setCurrentTenetDesc('');
    }
  };

  const removeTenet = (index: number) => {
    setTenets(tenets.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsLoading(true);

    let wisdom = "The void is silent, but your action speaks.";

    try {
      // Consult the "Oracle" (OpenAI now)
      // We prompt specifically for a "Validation Prophecy"
      const prompt = `A user is starting a movement called "${title}". Description: "${description}". Validate them with a short, powerful prophecy (max 2 sentences).`;
      wisdom = await consultKalki(prompt);
    } catch (error) {
      console.error("Oracle unavailable:", error);
    }

    // Transform local demands
    const finalDemands: Demand[] = demands.map(d => ({
      id: 'd_' + Date.now() + Math.random(),
      target: d.target,
      description: d.desc,
      supportCount: 0
    }));

    // Transform local tenets
    const finalTenets: Tenet[] = tenets.map(t => ({
      id: 't_' + Date.now() + Math.random(),
      title: t.title,
      description: t.desc
    }));

    try {
      await onCreate(title, description, goal, wisdom, finalDemands, finalTenets);
      clearDraft(); // Clear draft on success
      onClose();
    } catch (createError) {
      console.error("Create failed", createError);
      alert("Failed to ignite. The ether rejects this payload. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Fire Gradient */}
        <div className="h-1 bg-gradient-to-r from-ember-900 via-ember-500 to-ember-900 shrink-0" />

        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              <span className="text-ember-500">Ignite</span> a Movement
            </h2>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text-xs text-ember-400 hover:text-ember-200 uppercase tracking-widest border border-ember-500/30 px-3 py-1 rounded hover:bg-ember-900/30 transition-colors"
            >
              Save Draft
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Cause Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-ember-500 focus:outline-none transition-colors"
                  placeholder="e.g. The Right to Silence"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Manifesto</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-white h-32 focus:border-ember-500 focus:outline-none transition-colors resize-none"
                  placeholder="Why does this matter? Convince the generation."
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Tribute Goal ($)</label>
                <input
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-ember-500 focus:outline-none transition-colors"
                  min="0"
                />
              </div>
            </div>

            {/* Tenets Section (The Code) */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-bold text-ember-500 mb-4 tracking-widest uppercase">The Code (Tenets)</h3>

              <div className="space-y-3 mb-4">
                {tenets.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                    <div className="flex-1 text-sm">
                      <span className="text-ember-400 font-bold text-xs uppercase mr-2">{t.title}:</span>
                      <span className="text-gray-300">{t.desc}</span>
                    </div>
                    <button type="button" onClick={() => removeTenet(idx)} className="text-gray-500 hover:text-red-500">
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={currentTenetTitle}
                  onChange={(e) => setCurrentTenetTitle(e.target.value)}
                  placeholder="Rule (e.g. No Noise)"
                  className="bg-black border border-white/10 rounded-lg p-2 text-sm text-white focus:border-ember-500 focus:outline-none flex-1"
                />
                <input
                  type="text"
                  value={currentTenetDesc}
                  onChange={(e) => setCurrentTenetDesc(e.target.value)}
                  placeholder="Description"
                  className="bg-black border border-white/10 rounded-lg p-2 text-sm text-white focus:border-ember-500 focus:outline-none flex-[2]"
                />
                <button
                  type="button"
                  onClick={handleAddTenet}
                  disabled={!currentTenetTitle || !currentTenetDesc}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Demands Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-sm font-bold text-ember-500 mb-4 tracking-widest uppercase">Demands to Authority</h3>

              <div className="space-y-3 mb-4">
                {demands.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                    <div className="flex-1 text-sm">
                      <span className="text-ember-400 font-bold text-xs uppercase mr-2">{d.target}:</span>
                      <span className="text-gray-300">{d.desc}</span>
                    </div>
                    <button type="button" onClick={() => removeDemand(idx)} className="text-gray-500 hover:text-red-500">
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={currentTarget}
                  onChange={(e) => setCurrentTarget(e.target.value)}
                  placeholder="Target (e.g. City Mayor)"
                  className="bg-black border border-white/10 rounded-lg p-2 text-sm text-white focus:border-ember-500 focus:outline-none flex-1"
                />
                <input
                  type="text"
                  value={currentDemandDesc}
                  onChange={(e) => setCurrentDemandDesc(e.target.value)}
                  placeholder="What do you demand?"
                  className="bg-black border border-white/10 rounded-lg p-2 text-sm text-white focus:border-ember-500 focus:outline-none flex-[2]"
                />
                <button
                  type="button"
                  onClick={handleAddDemand}
                  disabled={!currentTarget || !currentDemandDesc}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-ember-700 hover:bg-ember-600 text-white rounded-lg text-sm font-bold tracking-widest uppercase transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Consulting Kalki...
                  </>
                ) : (
                  'Spark'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;