import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Flame, Sparkles, Droplets, BookOpen, Moon, Gem, 
  Wind, ExternalLink, Heart, ShoppingBag, Info
} from 'lucide-react';

interface RitualTool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  affiliateUrl?: string;
  priceRange?: string;
}

const ritualTools: RitualTool[] = [
  {
    id: 'candles',
    name: 'Ritual Candles',
    category: 'Fire Element',
    description: 'Hand-poured soy candles in colors aligned with intention work. Choose colors that resonate with your current focus.',
    icon: <Flame className="w-5 h-5" />,
    priceRange: '$12-35'
  },
  {
    id: 'diffuser',
    name: 'Essential Oil Diffuser',
    category: 'Air Element',
    description: 'Ultrasonic diffusers that gently release therapeutic-grade essential oils into your sacred space.',
    icon: <Wind className="w-5 h-5" />,
    priceRange: '$25-60'
  },
  {
    id: 'altar-bowl',
    name: 'Altar Bowls',
    category: 'Water Element',
    description: 'Handcrafted ceramic or brass bowls for holding water, crystals, or sacred objects on your altar.',
    icon: <Droplets className="w-5 h-5" />,
    priceRange: '$18-45'
  },
  {
    id: 'journal',
    name: 'Ritual Journals',
    category: 'Earth Element',
    description: 'Beautifully bound journals with prompts for shadow work, gratitude, and intention setting.',
    icon: <BookOpen className="w-5 h-5" />,
    priceRange: '$15-40'
  },
  {
    id: 'moon-lamp',
    name: 'Moon Phase Lamps',
    category: 'Lunar',
    description: '3D-printed moon lamps that cycle through phases. Perfect for lunar ritual work and ambient lighting.',
    icon: <Moon className="w-5 h-5" />,
    priceRange: '$20-55'
  },
  {
    id: 'crystals',
    name: 'Crystal Sets',
    category: 'Earth Element',
    description: 'Ethically sourced crystal collections curated for specific intentions: protection, love, clarity, or grounding.',
    icon: <Gem className="w-5 h-5" />,
    priceRange: '$25-80'
  },
  {
    id: 'incense',
    name: 'Incense & Holders',
    category: 'Air Element',
    description: 'Natural incense sticks and beautiful holders for smoke cleansing and creating sacred atmosphere.',
    icon: <Sparkles className="w-5 h-5" />,
    priceRange: '$8-30'
  },
  {
    id: 'altar-cloth',
    name: 'Altar Cloths',
    category: 'Sacred Space',
    description: 'Handwoven or printed cloths with sacred geometry, moon phases, or elemental symbols.',
    icon: <Heart className="w-5 h-5" />,
    priceRange: '$15-45'
  }
];

export function RitualToolsAffiliate() {
  const [open, setOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<RitualTool | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 text-white hover:bg-amber-500/20"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ritual Tools
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Optional Ritual Tools
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Intro Copy */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <p className="text-white/80 leading-relaxed">
                Some people enjoy using physical items to support their rituals.
                <br />
                Others prefer simplicity.
              </p>
              <p className="text-amber-300 mt-3 font-medium">
                Both are valid.
              </p>
            </div>

            {/* Description */}
            <p className="text-white/70 text-sm">
              If tangible tools help you feel more grounded or intentional, you may enjoy exploring options like:
            </p>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ritualTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    selectedTool?.id === tool.id
                      ? 'bg-amber-500/20 border-amber-500/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg inline-block mb-2 ${
                    selectedTool?.id === tool.id ? 'bg-amber-500/30 text-amber-300' : 'bg-white/10 text-white/70'
                  }`}>
                    {tool.icon}
                  </div>
                  <p className="text-white text-sm font-medium">{tool.name}</p>
                  <p className="text-white/50 text-xs mt-1">{tool.category}</p>
                </button>
              ))}
            </div>

            {/* Selected Tool Detail */}
            {selectedTool && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      {selectedTool.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{selectedTool.name}</h4>
                      <p className="text-white/50 text-sm">{selectedTool.category}</p>
                    </div>
                  </div>
                  {selectedTool.priceRange && (
                    <span className="text-amber-400 text-sm">{selectedTool.priceRange}</span>
                  )}
                </div>
                <p className="text-white/70 text-sm mb-4">{selectedTool.description}</p>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  onClick={() => {
                    // In production, this would link to affiliate URL
                    window.open('https://example.com/ritual-tools', '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Options
                </Button>
              </div>
            )}

            {/* Closing Copy */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/70 text-sm">
                These items are <span className="text-amber-300">never required</span> — they're simply optional supports.
              </p>
              <p className="text-white/60 text-sm mt-2">
                Choose what feels aligned.<br />
                Leave the rest.
              </p>
            </div>

            {/* Transparency Note */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Info className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <p className="text-white/60 text-xs">
                Some links may be affiliated. This never affects your cost and helps support the continued creation of this space.
              </p>
            </div>

            {/* Browse Button */}
            <Button
              variant="outline"
              className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              onClick={() => {
                // In production, this would link to a curated shop page
                window.open('https://example.com/altar-friendly-tools', '_blank');
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Browse Altar-Friendly Tools
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Inline affiliate section for embedding in pages
export function RitualToolsSection() {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Optional Ritual Tools</h3>
      </div>

      <p className="text-white/70 text-sm mb-4">
        Some people enjoy using physical items to support their rituals. Others prefer simplicity.
        <span className="text-amber-300 font-medium"> Both are valid.</span>
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {['candles', 'diffusers', 'altar bowls', 'journals', 'moon lamps', 'crystals', 'incense'].map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm"
          >
            {item}
          </span>
        ))}
      </div>

      <p className="text-white/60 text-sm mb-4 italic">
        These items are never required — they're simply optional supports.
      </p>

      <Button
        variant="outline"
        className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
        onClick={() => {
          window.open('https://example.com/ritual-tools', '_blank');
        }}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Explore Supportive Ritual Items
      </Button>

      <p className="text-white/40 text-xs mt-3 text-center">
        Some links may be affiliated. This never affects your cost and helps support this space.
      </p>
    </div>
  );
}
