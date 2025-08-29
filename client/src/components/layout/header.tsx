import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="container-bg border-b border-border-secondary p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'hsl(203.89, 88.28%, 53.14%)' }} data-testid="header-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-secondary mt-1" data-testid="header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div data-testid="header-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
