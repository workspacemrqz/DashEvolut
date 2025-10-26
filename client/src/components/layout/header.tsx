import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="container-bg border-b border-border-secondary px-3 py-6 pl-14 sm:px-6 lg:pl-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold break-words" style={{ color: 'hsl(203.89, 88.28%, 53.14%)' }} data-testid="header-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-secondary mt-1 text-xs sm:text-sm lg:text-base break-words" data-testid="header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0 w-auto" data-testid="header-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
