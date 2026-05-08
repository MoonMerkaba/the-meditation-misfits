export function JourneyWhy({ reason }: { reason?: string }) {
  if (!reason) return null;
  return <p style={{ fontSize:12, color:"#a9a8b8", marginTop:6 }}>Why this: {reason}</p>;
}
