import { useState } from "react";

const ITEMS = [
  { q:"Do I need headphones?", a:"Only for binaural beats. Isochronic and Solfeggio work fine on speakers." },
  { q:"Which beat should I pick for abundance?", a:"Alpha (~8 Hz) supports relaxed focus & receptivity. Theta (~4 Hz) is great for subconscious re-patterning." },
  { q:"Can I layer tones?", a:"Yes. Use one entrainment source at a time (binaural OR isochronic). You can stack a steady Solfeggio (e.g., 528 Hz) on top for intention." },
  { q:"How loud should it be?", a:"Low. 40–60% volume. Let your body soften into it." },
];

export function ToneFAQ(){
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="card">
      <h2>FAQ: Tones</h2>
      {ITEMS.map((it, i)=>(
        <div key={i} style={{ borderTop:"1px solid rgba(255,255,255,.08)", padding:"8px 0" }}>
          <button className="btn ghost small" onClick={()=> setOpen(open===i? null : i)}>{it.q}</button>
          {open===i && <p className="muted" style={{ margin:"6px 0 0" }}>{it.a}</p>}
        </div>
      ))}
    </div>
  );
}
