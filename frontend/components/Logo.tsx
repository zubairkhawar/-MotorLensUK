export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_12px_rgba(59,108,247,0.5)]"
    >
      <defs>
        <linearGradient id="lens-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#3b6cf7" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <radialGradient id="lens-highlight" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#lens-grad)" />
      <circle cx="20" cy="20" r="9" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
      <circle cx="20" cy="20" r="4.5" fill="white" opacity="0.95" />
      <circle cx="20" cy="20" r="9" fill="url(#lens-highlight)" />
      <path d="M28 28 L33 33" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}
