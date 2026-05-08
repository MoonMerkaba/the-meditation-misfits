import { useState } from "react";

export function ToneHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 8 }}>
      <button
        aria-label="Info"
        onClick={() => setOpen(v => !v)}
        style={{ 
          border: "1px solid rgba(255,255,255,.25)", 
          background: "transparent", 
          color: "#eae8f5",
          width: 18, 
          height: 18, 
          borderRadius: 9, 
          fontSize: 11, 
          lineHeight: "16px",
          cursor: "pointer"
        }}
      >
        i
      </button>
      {open && (
        <div style={{ 
          position: "absolute", 
          top: "130%", 
          right: 0, 
          minWidth: 200, 
          zIndex: 50,
          background: "#0f1018", 
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 10, 
          padding: "8px 10px", 
          boxShadow: "0 8px 24px rgba(0,0,0,.45)",
          fontSize: 12, 
          color: "#d7d6e7" 
        }}>
          {text}
        </div>
      )}
    </span>
  );
}
