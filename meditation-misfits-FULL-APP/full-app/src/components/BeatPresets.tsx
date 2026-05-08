const PRESETS = [
  { key:"alpha8", name:"Alpha 8 Hz", blurb:"Relaxed focus & abundance visualization", beat:8 },
  { key:"theta4", name:"Theta 4 Hz", blurb:"Subconscious work & manifestation", beat:4 },
  { key:"delta2", name:"Delta 2 Hz", blurb:"Deep rest & recovery", beat:2 },
];

export function BeatPresets({ setBinaural }: { setBinaural: (base:number, beat:number)=>void }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
      {PRESETS.map(p => (
        <button key={p.key} className="btn small"
          title={p.blurb}
          onClick={()=> setBinaural(500 - p.beat, p.beat)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
