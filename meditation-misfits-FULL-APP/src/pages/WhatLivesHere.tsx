import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sunrise, 
  Shield, 
  Waves, 
  Heart, 
  Leaf, 
  Star,
  Volume2,
  Activity,
  BookOpen,
  Feather,
  Moon
} from 'lucide-react';

interface WhatLivesHereProps {
  onBack?: () => void;
}

const WhatLivesHere: React.FC<WhatLivesHereProps> = ({ onBack }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950">
      {/* Back Button */}
      <div className="fixed top-24 left-4 z-50">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 px-4 py-2 rounded-lg backdrop-blur-sm transition-all border border-purple-500/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 pt-32">

        {/* Page Title */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
            This Is Home
          </h1>
          <div className="max-w-2xl mx-auto space-y-2 text-gray-400">
            <p>Not a productivity app.</p>
            <p>Not a meditation app.</p>
            <p className="text-purple-300 mt-4">
              A living sanctuary for Lightworkers and Starseeds reclaiming themselves.
            </p>
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-12">
          
          {/* Section 1: The Daily Flow */}
          <section className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 border border-purple-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sunrise className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Daily Flow</h2>
                <p className="text-gray-400">
                  Each day unfolds gently — not as a task list, but as a rhythm.
                </p>
              </div>
            </div>
            <ul className="space-y-3 ml-16 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span><strong className="text-purple-200">Arrival</strong> — short grounding</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span><strong className="text-purple-200">Core Practice</strong> — meditation, frequency, or reflection</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                <span><strong className="text-purple-200">Integration</strong> — journaling or inner check-in</span>
              </li>
            </ul>
            <p className="mt-6 ml-16 text-gray-500 italic">
              No streaks. No shame. Just presence.
            </p>
          </section>

          {/* Section 2: Shadow-Safe Mode */}
          <section className="bg-gradient-to-r from-slate-900/50 to-gray-900/50 rounded-2xl p-8 border border-orange-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Shadow-Safe Mode</h2>
                <p className="text-gray-400">
                  For days when affirmations feel wrong and manifesting feels heavy.
                </p>
              </div>
            </div>
            <ul className="space-y-3 ml-16 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span>Softer audio</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span>No "positive thinking" pressure</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                <span>Language designed for nervous system safety</span>
              </li>
            </ul>
            <p className="mt-6 ml-16 text-gray-500 italic">
              Some days aren't for becoming. They're for staying.
            </p>
          </section>

          {/* Section 3: Sensory Pathways */}
          <section className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 rounded-2xl p-8 border border-teal-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Waves className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Choose How You Heal</h2>
                <p className="text-gray-400">
                  Not everyone visualizes. Not everyone sits still.
                </p>
              </div>
            </div>
            <div className="ml-16">
              <p className="text-gray-300 mb-4">Choose your path:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 bg-teal-900/30 rounded-lg px-4 py-3 border border-teal-500/20">
                  <Volume2 className="w-4 h-4 text-teal-300" />
                  <span className="text-teal-200">Sound-led</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-900/30 rounded-lg px-4 py-3 border border-teal-500/20">
                  <Activity className="w-4 h-4 text-teal-300" />
                  <span className="text-teal-200">Body-based</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-900/30 rounded-lg px-4 py-3 border border-teal-500/20">
                  <Moon className="w-4 h-4 text-teal-300" />
                  <span className="text-teal-200">Ritual-based</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-900/30 rounded-lg px-4 py-3 border border-teal-500/20">
                  <BookOpen className="w-4 h-4 text-teal-300" />
                  <span className="text-teal-200">Writing-based</span>
                </div>
                <div className="flex items-center gap-2 bg-teal-900/30 rounded-lg px-4 py-3 border border-teal-500/20">
                  <Feather className="w-4 h-4 text-teal-300" />
                  <span className="text-teal-200">Minimal / quiet</span>
                </div>
              </div>
            </div>
            <p className="mt-6 ml-16 text-gray-500 italic">
              This app adapts to you — not the other way around.
            </p>
          </section>

          {/* Section 4: The Companion Presence */}
          <section className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-2xl p-8 border border-pink-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">A Quiet Companion</h2>
                <p className="text-gray-400">
                  This isn't a chatbot.
                </p>
              </div>
            </div>
            <div className="ml-16 space-y-3 text-gray-300">
              <p>It doesn't talk at you.</p>
              <p>It reflects. It notices patterns. It asks the right question at the right time.</p>
              <p className="text-pink-200 font-medium mt-4">Like someone who actually knows you.</p>
            </div>
          </section>

          {/* Section 5: Inner Seasons */}
          <section className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">Seasons, Not Challenges</h2>
                <p className="text-gray-400">
                  You don't "complete" healing.
                </p>
              </div>
            </div>
            <div className="ml-16">
              <p className="text-gray-300 mb-4">You move through seasons:</p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Restoring Trust</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Reclaiming Voice</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  <span>Grounding After Awakening</span>
                </li>
              </ul>
            </div>
            <p className="mt-6 ml-16 text-gray-500 italic">
              No deadlines. No falling behind.
            </p>
          </section>

          {/* Section 6: For Who This Is */}
          <section className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-2xl p-8 border border-violet-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-violet-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-2">This Space Is For You If...</h2>
              </div>
            </div>
            <ul className="ml-16 space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                <span>You've always felt different</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                <span>You're sensitive to energy</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                <span>You've been through darkness</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                <span>You're done forcing healing</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                <span>You want something real</span>
              </li>
            </ul>
            <p className="mt-6 ml-16 text-violet-200 font-medium">
              If you found this app, it's not an accident.
            </p>
          </section>

        </div>

        {/* Closing */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <div className="w-12 h-px bg-gray-600"></div>
            <Star className="w-4 h-4" />
            <div className="w-12 h-px bg-gray-600"></div>
          </div>
          <p className="mt-6 text-gray-400">
            You're not building an app people use.<br />
            <span className="text-purple-300">You're building a place people return to.</span>
          </p>
        </div>

        {/* Return Home Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Return Home</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default WhatLivesHere;
