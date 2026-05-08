export interface VaultProtocol {
  id: string;
  name: string;
  status: string;
  threat_level: string;
  classification: string;
  one_line_hook: string;
  duration: string;
  tech_specs: {
    beatStart: string;
    beatEnd: string;
    isoHz: string;
    noise: string;
    intensity: string;
  };
  file_summary: string;
  operational_purpose: string[];
  research_notes: string[];
  activation_procedure: string[];
  observed_effects: string[];
  unconfirmed_theories: string[];
  integration_notes: string[];
  warnings: string[];
  audioFile: string;
}

// Map to existing Soundicine audio files
export const AUDIO_FILES = {
  alpha5: "Classic-alpha-5-mins-(learning)-220-230.wav",
  alpha10: "Classic-alpha-10-mins-(learning)-220-230.wav",
  theta5: "Classic-theta-5-mins-(meditation)-220-230.wav",
  theta10: "Classic-theta-10-mins-(meditation)-220-230.wav",
  delta5: "Classic-delta-5-mins-(sleep)-220-230.wav",
  delta10: "Classic-delta-10-mins-(sleep)-220-230.wav",
  beta5: "Classic-beta-5-mins-(focus)-220-230.wav",
  beta10: "Classic-beta-10-mins-(focus)-220-230.wav",
  gamma5: "Classic-gamma-5-mins-(insight)-220-230.wav",
  heart5: "Heart-639hz-5-mins-220-230.wav",
  heart10: "Heart-639hz-10-mins-220-230.wav",
  root5: "Root-396hz-5-mins-220-230.wav",
  schumann5: "Schumann-7.83hz-5-mins-220-230.wav",
  jupiter5: "Jupiter-183hz-5-mins-220-230.wav",
  venus5: "Venus-221hz-5-mins-220-230.wav"
};

export const vaultProtocols: VaultProtocol[] = [
  {
    id: "omega7",
    name: "Omega-7 Awareness Bridge",
    status: "Recovered | Unauthorized Release | Cleared for Misfit Use Only",
    threat_level: "Elevated",
    classification: "Cognitive Boundary Dissolution",
    one_line_hook: "A recovered consciousness pattern rumored to bypass the mental firewall.",
    duration: "5 or 10 minutes",
    tech_specs: {
      beatStart: "3.5 Hz",
      beatEnd: "7.0 Hz",
      isoHz: "396 or 432 Hz",
      noise: "Amber or Pink",
      intensity: "Moderate-High"
    },
    file_summary: "This acoustic file appears in a sealed archive labeled 'Consciousness Manipulation – Tier 3 Experiments.' Notes suggest Omega-7 was designed to open cross-domain sensory channels and induce non-ordinary awareness states.",
    operational_purpose: [
      "expanded perception",
      "subconscious access",
      "inner symbol decoding",
      "early stage astral looseness"
    ],
    research_notes: [
      "Subjects reported 'tilting inward.'",
      "Cross-hemisphere synchronization occurred within 90 seconds.",
      "Some participants saw non-physical colors.",
      "Temporary agency-suspension states observed."
    ],
    activation_procedure: [
      "Sit or lie down with headphones.",
      "Stay still until the session ends.",
      "Let dissociative sensations occur naturally.",
      "Avoid sudden standing afterward."
    ],
    observed_effects: [
      "floating sensations",
      "internal quiet",
      "forehead pressure",
      "symbolic imagery",
      "time distortion"
    ],
    unconfirmed_theories: [
      "may thin the boundary between conscious and subconscious",
      "may activate non-local awareness",
      "may prepare for astral drift"
    ],
    integration_notes: [
      "Write down symbols seen.",
      "Note emotional shifts.",
      "Expect altered dreams within 24 hours."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.theta10
  },
  {
    id: "delta9",
    name: "Delta-9 Sleep Protocol",
    status: "Recovered | Black Site Origin | Declassified",
    threat_level: "Moderate",
    classification: "Deep State Induction",
    one_line_hook: "The frequency pattern they used to put assets into suspended animation.",
    duration: "10 minutes",
    tech_specs: {
      beatStart: "0.5 Hz",
      beatEnd: "4.0 Hz",
      isoHz: "174 Hz",
      noise: "Brown",
      intensity: "Deep"
    },
    file_summary: "Recovered from a facility codenamed 'DREAMGATE.' Delta-9 was allegedly used to induce rapid sleep states in field operatives who needed immediate rest cycles. The protocol targets the deepest brainwave patterns associated with restorative sleep.",
    operational_purpose: [
      "rapid sleep onset",
      "deep restorative rest",
      "physical recovery acceleration",
      "dream state access"
    ],
    research_notes: [
      "Average sleep onset: 4.2 minutes.",
      "REM cycles appeared compressed but complete.",
      "Subjects reported feeling 8 hours of rest in 2 hours.",
      "Some experienced lucid dream breakthrough."
    ],
    activation_procedure: [
      "Use only when you can sleep uninterrupted.",
      "Lie flat in complete darkness.",
      "Set intention for rest before beginning.",
      "Allow natural drift without resistance."
    ],
    observed_effects: [
      "rapid drowsiness",
      "body heaviness",
      "time compression",
      "vivid dreams",
      "morning clarity"
    ],
    unconfirmed_theories: [
      "may access collective unconscious during deep delta",
      "may accelerate cellular repair processes",
      "may enable prophetic dream states"
    ],
    integration_notes: [
      "Keep dream journal nearby.",
      "Note any unusual dream symbols.",
      "Hydrate upon waking."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.delta10
  },
  {
    id: "gamma12",
    name: "Gamma-12 Insight Burst",
    status: "Intercepted | Agency Unknown | Handle with Care",
    threat_level: "High",
    classification: "Cognitive Enhancement",
    one_line_hook: "The frequency stack that allegedly triggered spontaneous genius in test subjects.",
    duration: "5 minutes",
    tech_specs: {
      beatStart: "30 Hz",
      beatEnd: "42 Hz",
      isoHz: "528 Hz",
      noise: "White (filtered)",
      intensity: "High"
    },
    file_summary: "This file was intercepted from an encrypted transmission between unknown parties. Analysis suggests it was designed to induce gamma brainwave states associated with peak cognitive performance, creative breakthroughs, and 'aha' moments.",
    operational_purpose: [
      "creative problem solving",
      "pattern recognition enhancement",
      "information synthesis",
      "breakthrough thinking"
    ],
    research_notes: [
      "Subjects solved complex puzzles 40% faster.",
      "Reports of 'seeing connections' previously invisible.",
      "Temporary increase in verbal fluency observed.",
      "Some experienced synesthesia-like perception."
    ],
    activation_procedure: [
      "Use when facing a difficult problem.",
      "Have paper ready to capture insights.",
      "Sit upright with eyes closed.",
      "Focus on the question before starting."
    ],
    observed_effects: [
      "mental clarity",
      "rapid ideation",
      "heightened awareness",
      "emotional uplift",
      "time acceleration"
    ],
    unconfirmed_theories: [
      "may temporarily increase neural plasticity",
      "may access higher-dimensional thinking",
      "may synchronize with universal intelligence field"
    ],
    integration_notes: [
      "Immediately record all insights.",
      "Don't judge ideas during session.",
      "Allow 30 minutes before major decisions."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.gamma5
  },
  {
    id: "alpha3",
    name: "Alpha-3 Learning Accelerator",
    status: "Leaked | Educational Black Project | Partially Redacted",
    threat_level: "Low",
    classification: "Memory Enhancement",
    one_line_hook: "The study protocol that was too effective to release publicly.",
    duration: "5 or 10 minutes",
    tech_specs: {
      beatStart: "8 Hz",
      beatEnd: "12 Hz",
      isoHz: "417 Hz",
      noise: "Pink",
      intensity: "Moderate"
    },
    file_summary: "Documents suggest Alpha-3 was developed for accelerated learning programs. The protocol induces a relaxed-alert state optimal for information absorption and retention. Originally designed for language acquisition programs.",
    operational_purpose: [
      "enhanced learning",
      "memory consolidation",
      "focus without tension",
      "information retention"
    ],
    research_notes: [
      "Vocabulary retention increased 60%.",
      "Subjects entered 'flow state' within 3 minutes.",
      "Reduced test anxiety observed.",
      "Long-term memory encoding improved."
    ],
    activation_procedure: [
      "Use before or during study sessions.",
      "Keep learning material ready.",
      "Maintain comfortable seated position.",
      "Allow information to 'sink in' naturally."
    ],
    observed_effects: [
      "calm alertness",
      "improved focus",
      "reduced anxiety",
      "enhanced recall",
      "creative connections"
    ],
    unconfirmed_theories: [
      "may create new neural pathways faster",
      "may access photographic memory potential",
      "may enable subconscious learning"
    ],
    integration_notes: [
      "Review material after session.",
      "Sleep within 4 hours to consolidate.",
      "Test recall the next day."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.alpha10
  },
  {
    id: "beta7",
    name: "Beta-7 Focus Lock",
    status: "Recovered | Military Origin | Field Tested",
    threat_level: "Moderate",
    classification: "Attention Enhancement",
    one_line_hook: "The concentration protocol used by elite units for mission-critical focus.",
    duration: "5 or 10 minutes",
    tech_specs: {
      beatStart: "14 Hz",
      beatEnd: "20 Hz",
      isoHz: "285 Hz",
      noise: "None",
      intensity: "Moderate-High"
    },
    file_summary: "Beta-7 was recovered from a training facility specializing in attention enhancement. The protocol was allegedly used to help operatives maintain unwavering focus during extended operations. Creates a state of alert concentration.",
    operational_purpose: [
      "sustained attention",
      "task completion",
      "distraction immunity",
      "mental endurance"
    ],
    research_notes: [
      "Attention span extended by 300%.",
      "Subjects reported 'tunnel vision' for tasks.",
      "Procrastination impulses eliminated.",
      "Mental fatigue onset delayed significantly."
    ],
    activation_procedure: [
      "Define your task before starting.",
      "Remove all distractions from environment.",
      "Commit to single-task focus.",
      "Begin work immediately after protocol."
    ],
    observed_effects: [
      "laser focus",
      "time blindness",
      "task absorption",
      "reduced mind wandering",
      "completion drive"
    ],
    unconfirmed_theories: [
      "may activate dormant prefrontal regions",
      "may create temporary ADHD immunity",
      "may enhance willpower reserves"
    ],
    integration_notes: [
      "Take breaks every 90 minutes.",
      "Hydrate during focused work.",
      "Stretch after extended sessions."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.beta10
  },
  {
    id: "heart639",
    name: "Heart-639 Resonance Field",
    status: "Ancient Origin | Rediscovered | Cleared for Release",
    threat_level: "Low",
    classification: "Emotional Harmonization",
    one_line_hook: "The frequency that allegedly opens the heart's electromagnetic field.",
    duration: "5 or 10 minutes",
    tech_specs: {
      beatStart: "4 Hz",
      beatEnd: "8 Hz",
      isoHz: "639 Hz",
      noise: "Pink (subtle)",
      intensity: "Gentle"
    },
    file_summary: "This protocol combines ancient frequency knowledge with modern binaural technology. 639 Hz is associated with the heart chakra and interpersonal connection. Documents suggest it was studied for its effects on empathy and emotional intelligence.",
    operational_purpose: [
      "emotional healing",
      "relationship harmony",
      "self-compassion",
      "heart coherence"
    ],
    research_notes: [
      "Heart rate variability improved significantly.",
      "Subjects reported feeling 'more connected.'",
      "Reduced feelings of isolation observed.",
      "Enhanced empathic responses measured."
    ],
    activation_procedure: [
      "Place hand on heart during session.",
      "Breathe slowly and deeply.",
      "Visualize green or pink light at heart.",
      "Allow emotions to surface and release."
    ],
    observed_effects: [
      "warmth in chest",
      "emotional release",
      "feelings of love",
      "forgiveness impulses",
      "connection sense"
    ],
    unconfirmed_theories: [
      "may expand heart's electromagnetic field",
      "may heal ancestral emotional wounds",
      "may attract harmonious relationships"
    ],
    integration_notes: [
      "Journal any emotions that arose.",
      "Reach out to loved ones.",
      "Practice gratitude afterward."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.heart10
  },
  {
    id: "root396",
    name: "Root-396 Grounding Protocol",
    status: "Recovered | Monastery Archive | Authenticated",
    threat_level: "Low",
    classification: "Foundational Stabilization",
    one_line_hook: "The frequency used by monks to anchor consciousness to the physical plane.",
    duration: "5 minutes",
    tech_specs: {
      beatStart: "1 Hz",
      beatEnd: "4 Hz",
      isoHz: "396 Hz",
      noise: "Brown",
      intensity: "Deep"
    },
    file_summary: "This protocol was recovered from encrypted monastery archives. 396 Hz is associated with the root chakra and feelings of safety and security. It was allegedly used to help practitioners remain grounded during intense spiritual experiences.",
    operational_purpose: [
      "grounding and centering",
      "anxiety reduction",
      "physical body awareness",
      "security restoration"
    ],
    research_notes: [
      "Subjects reported feeling 'more present.'",
      "Anxiety levels dropped measurably.",
      "Physical sensations intensified positively.",
      "Dissociative states reversed."
    ],
    activation_procedure: [
      "Sit with feet flat on floor.",
      "Visualize roots extending downward.",
      "Focus on physical sensations.",
      "Breathe into the lower body."
    ],
    observed_effects: [
      "body heaviness",
      "calm stability",
      "present moment awareness",
      "reduced anxiety",
      "physical comfort"
    ],
    unconfirmed_theories: [
      "may strengthen connection to Earth's field",
      "may clear root chakra blockages",
      "may release stored survival trauma"
    ],
    integration_notes: [
      "Walk barefoot if possible.",
      "Eat grounding foods (root vegetables).",
      "Spend time in nature."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.root5
  },
  {
    id: "schumann",
    name: "Schumann-7.83 Earth Sync",
    status: "Natural Origin | Classified Study | Now Declassified",
    threat_level: "Minimal",
    classification: "Planetary Resonance",
    one_line_hook: "The Earth's own frequency, captured and amplified for human synchronization.",
    duration: "5 minutes",
    tech_specs: {
      beatStart: "7.83 Hz",
      beatEnd: "7.83 Hz",
      isoHz: "432 Hz",
      noise: "None",
      intensity: "Subtle"
    },
    file_summary: "The Schumann Resonance (7.83 Hz) is the electromagnetic frequency of Earth itself. This protocol was developed to help humans resynchronize with the planet's natural rhythm, which modern technology has disrupted.",
    operational_purpose: [
      "circadian rhythm reset",
      "EMF recovery",
      "natural state restoration",
      "planetary alignment"
    ],
    research_notes: [
      "Subjects reported feeling 'more natural.'",
      "Sleep quality improved over time.",
      "Reduced sensitivity to EMF reported.",
      "Sense of 'coming home' commonly described."
    ],
    activation_procedure: [
      "Use after extended screen time.",
      "Ideally use outdoors or near plants.",
      "Breathe naturally without forcing.",
      "Imagine syncing with Earth's pulse."
    ],
    observed_effects: [
      "natural calm",
      "circadian improvement",
      "reduced tech fatigue",
      "environmental connection",
      "baseline restoration"
    ],
    unconfirmed_theories: [
      "may repair EMF damage to biofield",
      "may restore natural healing rhythms",
      "may enhance connection to nature spirits"
    ],
    integration_notes: [
      "Reduce screen time after session.",
      "Spend time in nature.",
      "Ground barefoot on earth."
    ],
    warnings: [
      "Do NOT use while driving.",
      "Do NOT operate machinery.",
      "Do NOT use while standing or walking.",
      "Entertainment + relaxation only.",
      "Stop immediately if overwhelmed."
    ],
    audioFile: AUDIO_FILES.schumann5
  }
];
