import { Link, useLocation } from "wouter";
import { BarChart3, Users, FolderOpen, Menu, X, CreditCard, FileText, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Projetos", href: "/projetos", icon: FolderOpen },
  { name: "Assinaturas", href: "/assinaturas", icon: CreditCard },
  { name: "Propostas", href: "/propostas", icon: FileText },
  { name: "Gestão Financeira", href: "/servidores", icon: DollarSign },
];

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Mobile menu - only shown on mobile
  if (isMobile) {
    // Get current page name
    const currentPage = navigation.find(item => item.href === location)?.name || "Dashboard";
    
    return (
      <>
        {/* Mobile Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 h-14 border-b border-border-secondary z-40 lg:hidden" style={{ backgroundColor: '#060606' }}>
          <div className="h-full flex items-center px-4">
            {/* Menu Button */}
            <button
              id="mobile-menu-button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -ml-2 hover:bg-bg-primary rounded-lg transition-colors"
              data-testid="mobile-menu-toggle"
            >
              <Menu className="w-6 h-6 text-text-primary" />
            </button>

            {/* Page Title */}
            <h1 className="ml-3 text-lg font-semibold text-text-primary truncate">
              {currentPage}
            </h1>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar Menu */}
        <div 
          id="mobile-sidebar"
          className={`fixed left-0 top-0 h-full w-72 container-bg border-r border-border-secondary flex flex-col z-50 transition-transform duration-300 lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header with Logo */}
          <div className="px-6 py-5 border-b border-border-secondary">
            <img 
              src="/assets/LOGO Evolut IA com texto na horizontal.png" 
              alt="Evolut IA Logo" 
              className="h-9 w-auto"
              data-testid="logo"
            />
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href} className="focus:outline-none focus:ring-0">
                  <div
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-0 ${
                      isActive 
                        ? "bg-[hsl(203.89,88.28%,53.14%)] text-white" 
                        : "text-text-secondary hover:bg-bg-primary"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  // Desktop sidebar - collapsible version
  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} container-bg border-r border-border-secondary flex flex-col hidden lg:flex transition-all duration-300`}>
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} flex items-center justify-center transition-all duration-300`}>
        <img 
          src="/assets/LOGO Evolut IA com texto na horizontal.png" 
          alt="Evolut IA Logo" 
          className={`${isCollapsed ? 'h-8 max-w-[48px] object-contain' : 'h-10 w-auto'} cursor-pointer transition-all duration-300`}
          data-testid="logo"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menu" : "Colapsar menu"}
        />
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href} className="focus:outline-none focus:ring-0">
              <div
                className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-all cursor-pointer focus:outline-none focus:ring-0 ${
                  isActive 
                    ? "sidebar-active text-text-primary" 
                    : "text-text-secondary"
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
                title={isCollapsed ? item.name : ""}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} transition-all`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
