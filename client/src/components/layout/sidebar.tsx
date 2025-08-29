import { Link, useLocation } from "wouter";
import { BarChart3, Users, FolderOpen, FileText, Settings } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Projetos", href: "/projects", icon: FolderOpen },
  { name: "Relatórios", href: "/reports", icon: FileText },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 container-bg border-r border-border-secondary flex flex-col">
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
