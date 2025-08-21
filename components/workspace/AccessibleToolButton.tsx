'use client';

interface AccessibleToolButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  toolName: string;
  description: string;
  shortcut?: string;
  className?: string;
}

export function AccessibleToolButton({
  onClick,
  isActive,
  children,
  toolName,
  description,
  shortcut,
  className = ''
}: AccessibleToolButtonProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const ariaLabel = `${toolName} tool${shortcut ? ` (${shortcut})` : ''} - ${description}`;
  const title = `${toolName} - ${description}${shortcut ? ` • Shortcut: ${shortcut}` : ''}`;

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      title={title}
      className={`focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-75 ${className}`}
    >
      {children}
    </button>
  );
}