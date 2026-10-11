// Form ke upar ka error (jaise "Invalid email or password")
export default function FormAlert({ children }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-sm text-bad"
    >
      {children}
    </div>
  );
}
