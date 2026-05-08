export interface ForbiddenProtocol {
  id: string;
  sequenceNumber: number;
  codename: string;
  title: string;
  classification: 'DECLASSIFIED' | 'RESTRICTED' | 'REDACTED';
  accessLevel: number; // 1-5, determines unlock order
  duration: string;
  headphonesRequired: boolean;
  
  // Technical specifications (human-readable)
  techSpecs: {
    primaryFrequency: string;
    binauralRange: string;
    noiseBed: string;
    spatialMovement: string;
    rhythmicModulation: string;
    layerCount: number;
  };
  
  // Audio engine configuration (machine-readable)
  audioConfig: {
    baseFrequency: number;
    binauralStart: number;
    binauralEnd: number;
    sweepDuration: number; // 0 = constant, >0 = sweep over this many seconds
    noiseType: 'white' | 'pink' | 'brown' | 'none';
    noiseVolume: number; // 0-1
    spatialType: 'static' | 'circular' | 'vertical' | 'alternating' | 'expanding' | 'complex';
    spatialSpeed: number; // cycles per minute
    modulationType: 'none' | 'amplitude' | 'frequency' | 'both';
    modulationRate: number; // seconds per cycle
    modulationDepth: number; // 0-1
    durationSeconds: number;
  };
  
  // Grounded descriptions
  briefing: string;
  observedResponses: string[];
  reportedExperiences: string[];
  
  // Protocol structure
  preparationNotes: string[];
  duringProtocol: string[];
  afterProtocol: string[];
  
  // Safety
  groundingTechniques: string[];
  contraindications: string[];
}

export const forbiddenProtocols: ForbiddenProtocol[] = [
  {
    id: "ffp-001",
    sequenceNumber: 1,
    codename: "SIGNAL ZERO",
    title: "Baseline Calibration Protocol",
    classification: "DECLASSIFIED",
    accessLevel: 1,
    duration: "10 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "7.83 Hz (Schumann)",
      binauralRange: "7.83 Hz constant",
      noiseBed: "Brown noise, -18dB",
      spatialMovement: "Static center",
      rhythmicModulation: "None",
      layerCount: 3
    },
    audioConfig: {
      baseFrequency: 200,
      binauralStart: 7.83,
      binauralEnd: 7.83,
      sweepDuration: 0,
      noiseType: 'brown',
      noiseVolume: 0.12,
      spatialType: 'static',
      spatialSpeed: 0,
      modulationType: 'none',
      modulationRate: 0,
      modulationDepth: 0,
      durationSeconds: 600
    },
    briefing: "This protocol establishes a reference point. Listeners have commonly described it as a 'reset' sensation. The frequency matches Earth's electromagnetic resonance. No claims are made about outcomes—this is simply the starting point of the sequence.",
    observedResponses: [
      "Gradual decrease in mental chatter reported by some listeners",
      "Physical stillness often observed during sessions",
      "Some report feeling 'more present' afterward",
      "Breathing patterns tend to slow naturally"
    ],
    reportedExperiences: [
      "A sense of settling or grounding",
      "Reduced awareness of external sounds",
      "Mild heaviness in limbs",
      "Neutral emotional state"
    ],
    preparationNotes: [
      "Find a quiet space where you won't be disturbed",
      "Sit or lie down in a comfortable position",
      "Use quality headphones—this is required, not optional",
      "Set aside the full duration without interruption"
    ],
    duringProtocol: [
      "Keep eyes closed throughout",
      "Breathe naturally without forcing any pattern",
      "Allow whatever happens to happen",
      "If discomfort arises, open your eyes and stop"
    ],
    afterProtocol: [
      "Remain still for 60 seconds before moving",
      "Open eyes slowly and look at something nearby",
      "Drink water",
      "Note any observations without judgment"
    ],
    groundingTechniques: [
      "Press feet firmly into floor",
      "Name 5 things you can see",
      "Hold something with texture",
      "Splash cold water on wrists"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Not recommended during pregnancy without medical consultation",
      "Those with epilepsy or seizure history should consult a physician",
      "Stop immediately if you experience distress"
    ]
  },
  {
    id: "ffp-002",
    sequenceNumber: 2,
    codename: "DESCENT PATTERN",
    title: "Threshold Approach Protocol",
    classification: "DECLASSIFIED",
    accessLevel: 1,
    duration: "10 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "4-7 Hz sweep",
      binauralRange: "Theta band descent",
      noiseBed: "Pink noise, panning",
      spatialMovement: "Slow circular rotation",
      rhythmicModulation: "4-second cycle",
      layerCount: 4
    },
    audioConfig: {
      baseFrequency: 200,
      binauralStart: 7,
      binauralEnd: 4,
      sweepDuration: 600,
      noiseType: 'pink',
      noiseVolume: 0.15,
      spatialType: 'circular',
      spatialSpeed: 6,
      modulationType: 'amplitude',
      modulationRate: 4,
      modulationDepth: 0.3,
      durationSeconds: 600
    },
    briefing: "This protocol introduces gradual frequency descent. The spatial movement is designed to engage both hemispheres. Listeners have described various responses—none guaranteed, none promised. This is observation, not prescription.",
    observedResponses: [
      "Increased reports of visual phenomena with eyes closed",
      "Some listeners describe a 'sinking' sensation",
      "Time perception changes commonly reported",
      "Muscle relaxation frequently observed"
    ],
    reportedExperiences: [
      "Hypnagogic imagery (faces, patterns, colors)",
      "Sensation of movement while stationary",
      "Emotional content surfacing",
      "Dream-like thought patterns"
    ],
    preparationNotes: [
      "Complete Protocol 001 at least once before attempting",
      "Ensure you have no obligations immediately after",
      "Dim lighting is commonly preferred",
      "Have a blanket nearby—body temperature may drop"
    ],
    duringProtocol: [
      "Maintain passive observation of any experiences",
      "Do not try to control or direct what happens",
      "If imagery becomes uncomfortable, open your eyes",
      "Physical movement is fine if needed"
    ],
    afterProtocol: [
      "Allow 2-3 minutes before standing",
      "Move slowly and deliberately",
      "Avoid screens for 15 minutes if possible",
      "Journaling is optional but often reported as helpful"
    ],
    groundingTechniques: [
      "Wiggle fingers and toes deliberately",
      "Hum or make vocal sounds",
      "Touch your face with both hands",
      "Count backward from 10 out loud"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Not suitable if you need to be alert afterward",
      "Those prone to dissociation should proceed cautiously",
      "Stop if you feel disconnected from your body"
    ]
  },
  {
    id: "ffp-003",
    sequenceNumber: 3,
    codename: "DEEP STRUCTURE",
    title: "Subthreshold Navigation Protocol",
    classification: "RESTRICTED",
    accessLevel: 2,
    duration: "10 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "1-4 Hz",
      binauralRange: "Delta band",
      noiseBed: "Brown noise, layered",
      spatialMovement: "Slow vertical drift",
      rhythmicModulation: "8-second breath cycle",
      layerCount: 5
    },
    audioConfig: {
      baseFrequency: 180,
      binauralStart: 4,
      binauralEnd: 1,
      sweepDuration: 600,
      noiseType: 'brown',
      noiseVolume: 0.18,
      spatialType: 'vertical',
      spatialSpeed: 4,
      modulationType: 'amplitude',
      modulationRate: 8,
      modulationDepth: 0.4,
      durationSeconds: 600
    },
    briefing: "This protocol approaches the lowest frequency ranges associated with deep sleep states. Listeners remain conscious but report unusual perceptual states. This is experimental audio—not a sleep aid, not a treatment. Observation only.",
    observedResponses: [
      "Reports of body boundary dissolution",
      "Significant time distortion commonly described",
      "Some listeners report inability to move (sleep paralysis-like)",
      "Vivid internal experiences frequently mentioned"
    ],
    reportedExperiences: [
      "Sensation of floating or sinking",
      "Loss of body awareness",
      "Encounter with symbolic imagery",
      "Emotional processing or release"
    ],
    preparationNotes: [
      "Complete Protocols 001 and 002 first",
      "Use only when you can remain undisturbed for 30+ minutes",
      "Lying down is strongly recommended",
      "Inform someone you'll be unavailable"
    ],
    duringProtocol: [
      "Surrender to the experience without resistance",
      "Physical sensations are normal and temporary",
      "If fear arises, remember you can open your eyes anytime",
      "This is audio—nothing can harm you"
    ],
    afterProtocol: [
      "Remain lying down for 5 full minutes",
      "Reorient slowly to the room",
      "Eat something grounding (protein, root vegetables)",
      "Avoid important decisions for 1 hour"
    ],
    groundingTechniques: [
      "Clench and release all muscles",
      "Speak your name and location out loud",
      "Smell something strong (coffee, citrus)",
      "Take a short walk outside"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Not recommended for those with trauma history without support",
      "Avoid if you have difficulty distinguishing reality",
      "Do not use if sleep-deprived"
    ]
  },
  {
    id: "ffp-004",
    sequenceNumber: 4,
    codename: "PATTERN INTERRUPT",
    title: "Cognitive Disruption Protocol",
    classification: "RESTRICTED",
    accessLevel: 2,
    duration: "5 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "30-42 Hz",
      binauralRange: "Gamma band bursts",
      noiseBed: "White noise, filtered",
      spatialMovement: "Rapid alternation",
      rhythmicModulation: "Irregular intervals",
      layerCount: 6
    },
    audioConfig: {
      baseFrequency: 250,
      binauralStart: 30,
      binauralEnd: 42,
      sweepDuration: 300,
      noiseType: 'white',
      noiseVolume: 0.1,
      spatialType: 'alternating',
      spatialSpeed: 30,
      modulationType: 'both',
      modulationRate: 2,
      modulationDepth: 0.5,
      durationSeconds: 300
    },
    briefing: "This protocol uses high-frequency patterns with deliberate irregularity. It is designed to interrupt habitual thought patterns. Some find it uncomfortable. Some find it clarifying. No specific outcome is promised or implied.",
    observedResponses: [
      "Reports of sudden insight or clarity",
      "Some describe feeling 'shaken loose'",
      "Temporary increase in mental activity observed",
      "Pattern recognition changes reported"
    ],
    reportedExperiences: [
      "Racing thoughts followed by stillness",
      "Visual static or flickering",
      "Sense of cognitive 'reset'",
      "Emotional neutrality"
    ],
    preparationNotes: [
      "Use only when mentally stable",
      "Have a specific question or problem in mind (optional)",
      "Shorter duration—respect the intensity",
      "Not for relaxation—this is activating"
    ],
    duringProtocol: [
      "Stay present with the discomfort if it arises",
      "Do not resist the irregular patterns",
      "Keep eyes closed despite any urge to open them",
      "5 minutes is sufficient—do not extend"
    ],
    afterProtocol: [
      "Sit quietly and observe your thoughts",
      "Write down any insights immediately",
      "Allow 30 minutes before using again",
      "Physical movement can help integrate"
    ],
    groundingTechniques: [
      "Shake hands vigorously",
      "Stomp feet on floor",
      "Cold water on face",
      "Eat something crunchy"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Avoid if prone to anxiety or panic",
      "Not suitable for those with sensory processing issues",
      "Do not use more than once per day"
    ]
  },
  {
    id: "ffp-005",
    sequenceNumber: 5,
    codename: "RESONANCE FIELD",
    title: "Harmonic Alignment Protocol",
    classification: "RESTRICTED",
    accessLevel: 3,
    duration: "10 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "639 Hz (Solfeggio)",
      binauralRange: "4-8 Hz modulation",
      noiseBed: "Pink noise, subtle",
      spatialMovement: "Expanding/contracting",
      rhythmicModulation: "Heart rate range (60-80 BPM)",
      layerCount: 5
    },
    audioConfig: {
      baseFrequency: 639,
      binauralStart: 4,
      binauralEnd: 8,
      sweepDuration: 600,
      noiseType: 'pink',
      noiseVolume: 0.08,
      spatialType: 'expanding',
      spatialSpeed: 8,
      modulationType: 'amplitude',
      modulationRate: 1, // ~60 BPM
      modulationDepth: 0.35,
      durationSeconds: 600
    },
    briefing: "This protocol combines specific frequency relationships that some listeners report as 'harmonizing.' The spatial movement mimics expansion and contraction. Emotional responses are commonly reported. This is not therapy—it is experimental audio.",
    observedResponses: [
      "Chest sensations frequently reported",
      "Emotional release (tears, laughter) sometimes occurs",
      "Reports of feeling 'more open'",
      "Heart rate variability changes observed in some"
    ],
    reportedExperiences: [
      "Warmth in chest area",
      "Memories surfacing",
      "Sense of connection or compassion",
      "Physical tension release"
    ],
    preparationNotes: [
      "Complete earlier protocols first",
      "Have tissues nearby if needed",
      "Choose a time when emotional expression is safe",
      "Consider having support available afterward"
    ],
    duringProtocol: [
      "Place hand on chest if desired",
      "Allow emotions without judgment",
      "Crying is normal and not a problem",
      "Breathe through any intensity"
    ],
    afterProtocol: [
      "Be gentle with yourself",
      "Avoid conflict or difficult conversations",
      "Self-care activities recommended",
      "Reach out to someone if needed"
    ],
    groundingTechniques: [
      "Hug yourself firmly",
      "Wrap in a blanket",
      "Drink warm liquid",
      "Call a trusted person"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Use caution if processing grief or trauma",
      "Not a substitute for professional support",
      "Stop if emotional intensity becomes overwhelming"
    ]
  },
  {
    id: "ffp-006",
    sequenceNumber: 6,
    codename: "ANCHOR POINT",
    title: "Stabilization Protocol",
    classification: "DECLASSIFIED",
    accessLevel: 3,
    duration: "5 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "396 Hz",
      binauralRange: "1-4 Hz",
      noiseBed: "Brown noise, grounding",
      spatialMovement: "Downward drift",
      rhythmicModulation: "Slow, steady",
      layerCount: 3
    },
    audioConfig: {
      baseFrequency: 396,
      binauralStart: 4,
      binauralEnd: 1,
      sweepDuration: 300,
      noiseType: 'brown',
      noiseVolume: 0.2,
      spatialType: 'vertical',
      spatialSpeed: 3,
      modulationType: 'amplitude',
      modulationRate: 6,
      modulationDepth: 0.2,
      durationSeconds: 300
    },
    briefing: "This protocol is designed for stabilization and grounding. It is recommended after intense protocols or when feeling unmoored. The downward spatial movement and low frequencies are commonly described as 'anchoring.' Use as needed.",
    observedResponses: [
      "Rapid return to baseline state",
      "Physical heaviness and stillness",
      "Mental quieting",
      "Sense of safety commonly reported"
    ],
    reportedExperiences: [
      "Feeling of being 'held' or supported",
      "Connection to physical body",
      "Present-moment awareness",
      "Calm without drowsiness"
    ],
    preparationNotes: [
      "Use after any protocol that felt intense",
      "Can be used standalone for grounding",
      "Sitting with feet on floor is ideal",
      "No specific preparation needed"
    ],
    duringProtocol: [
      "Focus on physical sensations",
      "Feel your weight against the surface",
      "Breathe into your lower body",
      "Imagine roots extending downward"
    ],
    afterProtocol: [
      "You should feel ready to resume normal activity",
      "If still ungrounded, repeat the protocol",
      "Physical movement helps integration",
      "Eating is grounding"
    ],
    groundingTechniques: [
      "Already a grounding protocol",
      "Can be repeated as needed",
      "Combine with physical grounding",
      "Safe for frequent use"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Generally well-tolerated",
      "Safe for most listeners",
      "Stop if any discomfort arises"
    ]
  },
  {
    id: "ffp-007",
    sequenceNumber: 7,
    codename: "EDGE STATE",
    title: "Liminal Threshold Protocol",
    classification: "REDACTED",
    accessLevel: 4,
    duration: "10 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "3.5-7 Hz sweep",
      binauralRange: "Theta/Delta boundary",
      noiseBed: "Layered pink/brown",
      spatialMovement: "Complex rotation",
      rhythmicModulation: "Variable 4-12 second cycles",
      layerCount: 7
    },
    audioConfig: {
      baseFrequency: 200,
      binauralStart: 7,
      binauralEnd: 3.5,
      sweepDuration: 600,
      noiseType: 'pink',
      noiseVolume: 0.15,
      spatialType: 'complex',
      spatialSpeed: 5,
      modulationType: 'both',
      modulationRate: 8,
      modulationDepth: 0.45,
      durationSeconds: 600
    },
    briefing: "This protocol targets the boundary between waking and sleep states. Listeners commonly report unusual perceptual phenomena. This is not hypnosis, not meditation, not therapy. It is experimental audio that some find profound and others find unremarkable.",
    observedResponses: [
      "Hypnagogic phenomena frequently reported",
      "Difficulty determining if awake or asleep",
      "Time distortion significant",
      "Memory of session often fragmented"
    ],
    reportedExperiences: [
      "Vivid imagery indistinguishable from dreams",
      "Conversations with unknown figures",
      "Symbolic or archetypal content",
      "Sense of accessing 'other' spaces"
    ],
    preparationNotes: [
      "Complete all previous protocols first",
      "Use only when well-rested",
      "Evening use may affect sleep",
      "Have grounding protocol ready"
    ],
    duringProtocol: [
      "Maintain observer stance if possible",
      "Do not try to control experiences",
      "Remember: this is audio, nothing more",
      "You can stop at any time"
    ],
    afterProtocol: [
      "Use Anchor Point protocol immediately after",
      "Full reorientation before any activity",
      "Journal experiences while fresh",
      "Allow integration time"
    ],
    groundingTechniques: [
      "Use Protocol 006 (Anchor Point)",
      "Physical exercise",
      "Social interaction",
      "Mundane tasks"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "Not for those with psychotic symptoms",
      "Avoid if reality-testing is compromised",
      "Not recommended for daily use"
    ]
  },
  {
    id: "ffp-008",
    sequenceNumber: 8,
    codename: "FULL SPECTRUM",
    title: "Complete Sequence Protocol",
    classification: "REDACTED",
    accessLevel: 5,
    duration: "10 minutes",
    headphonesRequired: true,
    techSpecs: {
      primaryFrequency: "Multi-band sweep",
      binauralRange: "Delta through Gamma",
      noiseBed: "Dynamic layering",
      spatialMovement: "Full 3D rotation",
      rhythmicModulation: "Complex polyrhythms",
      layerCount: 8
    },
    audioConfig: {
      baseFrequency: 220,
      binauralStart: 1,
      binauralEnd: 40,
      sweepDuration: 600,
      noiseType: 'pink',
      noiseVolume: 0.12,
      spatialType: 'complex',
      spatialSpeed: 8,
      modulationType: 'both',
      modulationRate: 6,
      modulationDepth: 0.6,
      durationSeconds: 600
    },
    briefing: "This protocol combines elements from all previous sequences. It is the most complex audio in this program. Responses vary widely. Some report nothing notable. Others describe significant experiences. No outcome is guaranteed or implied. This is the end of the sequence.",
    observedResponses: [
      "Highly variable between listeners",
      "Some report profound experiences",
      "Others report nothing unusual",
      "Physical and emotional responses possible"
    ],
    reportedExperiences: [
      "Full range of previously described phenomena",
      "Novel experiences unique to individual",
      "Integration of previous protocol effects",
      "Sense of completion or resolution"
    ],
    preparationNotes: [
      "Complete entire sequence first",
      "Choose timing carefully",
      "Ensure extended recovery time available",
      "Have support person aware"
    ],
    duringProtocol: [
      "Trust your previous experience",
      "Allow the full duration",
      "Do not resist any phase",
      "Remember your grounding techniques"
    ],
    afterProtocol: [
      "Extended integration period recommended",
      "Use Anchor Point protocol",
      "Avoid stimulation for 1 hour",
      "Process experiences at your own pace"
    ],
    groundingTechniques: [
      "All previously learned techniques",
      "Protocol 006 strongly recommended",
      "Physical activity",
      "Nature exposure"
    ],
    contraindications: [
      "Do not use while operating vehicles or machinery",
      "All previous contraindications apply",
      "Not for casual or curious use",
      "Respect the sequence"
    ]
  }
];

export const programDisclaimer = {
  title: "IMPORTANT NOTICE",
  paragraphs: [
    "The Declassified Forbidden Frequency Program is experimental audio content designed for personal exploration. It is NOT a medical treatment, therapeutic intervention, or diagnostic tool.",
    "No claims are made regarding specific outcomes, benefits, or effects. Individual responses vary significantly. What one person experiences, another may not.",
    "All descriptions of 'observed responses' and 'reported experiences' are anecdotal accounts from listeners. They are not promises, guarantees, or predictions of what you will experience.",
    "This program is for entertainment and personal exploration only. It is not a substitute for professional medical, psychological, or psychiatric care.",
    "If you have any medical conditions, mental health concerns, or are taking medications, consult with a qualified healthcare provider before using this program.",
    "HEADPHONES ARE REQUIRED. The binaural and spatial elements will not function through speakers.",
    "By accessing this program, you acknowledge that you are using it at your own discretion and assume full responsibility for your experience."
  ],
  acknowledgment: "I understand this is experimental audio content, not a treatment or therapy. I accept full responsibility for my use of this program."
};
