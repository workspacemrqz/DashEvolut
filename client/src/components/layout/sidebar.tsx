import { Link, useLocation } from "wouter";
import { BarChart3, Users, FolderOpen, Settings, Kanban, Menu, X, CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Projetos", href: "/projects", icon: FolderOpen },
  { name: "Assinaturas", href: "/subscriptions", icon: CreditCard },
  { name: "Kanban", href: "/kanban", icon: Kanban },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (sidebar && !sidebar.contains(event.target as Node) && 
          menuButton && !menuButton.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isMobile]);

  // Mobile menu button - only shown on mobile
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-button"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 gradient-bg rounded-lg lg:hidden"
          data-testid="mobile-menu-toggle"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div 
          id="mobile-sidebar"
          className={`fixed left-0 top-0 h-full w-80 container-bg border-r border-border-secondary flex flex-col z-40 transition-transform duration-300 lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 pt-16 border-b border-border-secondary">
            <img 
              src="/assets/LOGO Evolut IA com texto na horizontal.png" 
              alt="Evolut IA Logo" 
              className="h-10 w-auto"
              data-testid="logo"
            />
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive 
                        ? "sidebar-active text-text-primary" 
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border-secondary">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">JS</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary" data-testid="user-name">
                  João Silva
                </p>
                <p className="text-xs text-text-secondary" data-testid="user-role">
                  Administrador
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar - same as before but hidden on mobile
  return (
    <div className="w-64 container-bg border-r border-border-secondary flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-border-secondary">
        <img 
          src="/assets/LOGO Evolut IA com texto na horizontal.png" 
          alt="Evolut IA Logo" 
          className="h-10 w-auto"
          data-testid="logo"
        />
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? "sidebar-active text-text-primary" 
                    : "text-text-secondary hover:text-text-primary"
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">JS</span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary" data-testid="user-name">
              João Silva
            </p>
            <p className="text-xs text-text-secondary" data-testid="user-role">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
