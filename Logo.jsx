/** Логотип Emerald Empire — изумруд, цвет через CSS-переменные темы */
export function EmeraldLogo({ themeId, size = 36, className = "" }) {
  const filter = `var(--logo-filter, none)`;
  return (
    <svg
      className={`emerald-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      style={{ filter, flexShrink: 0, transition: "filter 0.4s ease" }}
    >
      <defs>
        <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--teal)" />
          <stop offset="50%" stopColor="var(--silver)" />
          <stop offset="100%" stopColor="var(--purple)" />
        </linearGradient>
      </defs>
      <polygon points="32,4 56,24 48,60 16,60 8,24" fill="url(#gemGrad)" stroke="var(--teal)" strokeWidth="2" />
      <polygon points="32,14 44,26 40,48 24,48 20,26" fill="var(--bg)" opacity="0.35" />
      <line x1="32" y1="4" x2="32" y2="60" stroke="var(--silver)" strokeWidth="1" opacity="0.4" />
      <line x1="8" y1="24" x2="56" y2="24" stroke="var(--silver)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}
