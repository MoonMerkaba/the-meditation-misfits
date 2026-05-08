export function FreqReadout({ left, right }: { left?: number; right?: number }) {
  if (!left || !right) return null;
  const beat = Math.abs(right - left);
  return (
    <div style={{ fontSize: 12, color: "#c9c8d6", marginTop: 6 }}>
      <strong>Now Playing</strong>: L {left.toFixed(1)} Hz · R {right.toFixed(1)} Hz · Beat {beat.toFixed(1)} Hz
    </div>
  );
}
