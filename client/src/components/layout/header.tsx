import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="container-bg border-b border-border-secondary p-6 lg:p-6 pt-6 pb-6 pr-6 pl-16 lg:pl-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="min-w-0 flex-1 lg:flex-none">
          <h2 className="text-xl lg:text-2xl font-bold break-words text-chart-1" data-testid="header-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-secondary mt-1 text-sm lg:text-base break-words" data-testid="header-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0" data-testid="header-actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
