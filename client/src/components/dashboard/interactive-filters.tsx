import { useState } from "react";
import { Calendar, Filter, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InteractiveFiltersProps {
  onTimeFilterChange: (filter: string) => void;
  onSectorFilterChange: (filter: string) => void;
  onSourceFilterChange: (filter: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  "data-testid"?: string;
}

export default function InteractiveFilters({ 
  onTimeFilterChange, 
  onSectorFilterChange, 
  onSourceFilterChange,
  onExport,
  onRefresh,
  "data-testid": testId 
}: InteractiveFiltersProps) {
  const [timeFilter, setTimeFilter] = useState("30");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
    onTimeFilterChange(filter);
  };

  const handleSectorFilterChange = (filter: string) => {
    setSectorFilter(filter);
    onSectorFilterChange(filter);
  };

  const handleSourceFilterChange = (filter: string) => {
    setSourceFilter(filter);
    onSourceFilterChange(filter);
  };

  const getTimeFilterLabel = (filter: string) => {
    switch (filter) {
      case "7": return "7 dias";
      case "30": return "30 dias";
      case "90": return "90 dias";
      case "365": return "1 ano";
      default: return "30 dias";
    }
  };

  const getSectorFilterLabel = (filter: string) => {
    switch (filter) {
      case "all": return "Todos os Setores";
      case "technology": return "Tecnologia";
      case "marketing": return "Marketing";
      case "consultoria": return "Consultoria";
      default: return "Todos os Setores";
    }
  };

  const getSourceFilterLabel = (filter: string) => {
    switch (filter) {
      case "all": return "Todas as Fontes";
      case "indicacao": return "Indicação";
      case "google": return "Google Ads";
      case "linkedin": return "LinkedIn";
      default: return "Todas as Fontes";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-6" data-testid={testId}>
      {/* Time Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            className="btn-secondary px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">{getTimeFilterLabel(timeFilter)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-bg-container border-border-secondary">
          <DropdownMenuLabel className="text-text-primary">Período</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleTimeFilterChange("7")} 
            className="text-text-secondary"
          >
            7 dias
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleTimeFilterChange("30")} 
            className="text-text-secondary"
          >
            30 dias
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleTimeFilterChange("90")} 
            className="text-text-secondary"
          >
            90 dias
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleTimeFilterChange("365")} 
            className="text-text-secondary"
          >
            1 ano
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sector Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            className="btn-secondary px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{getSectorFilterLabel(sectorFilter)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-bg-container border-border-secondary">
          <DropdownMenuLabel className="text-text-primary">Setor</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleSectorFilterChange("all")} 
            className="text-text-secondary"
          >
            Todos os Setores
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSectorFilterChange("technology")} 
            className="text-text-secondary"
          >
            Tecnologia
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSectorFilterChange("marketing")} 
            className="text-text-secondary"
          >
            Marketing
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSectorFilterChange("consultoria")} 
            className="text-text-secondary"
          >
            Consultoria
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Source Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            className="btn-secondary px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">{getSourceFilterLabel(sourceFilter)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-bg-container border-border-secondary">
          <DropdownMenuLabel className="text-text-primary">Fonte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleSourceFilterChange("all")} 
            className="text-text-secondary"
          >
            Todas as Fontes
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSourceFilterChange("indicacao")} 
            className="text-text-secondary"
          >
            Indicação
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSourceFilterChange("google")} 
            className="text-text-secondary"
          >
            Google Ads
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleSourceFilterChange("linkedin")} 
            className="text-text-secondary"
          >
            LinkedIn
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          onClick={onRefresh}
          variant="secondary"
          className="btn-secondary px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Atualizar</span>
        </Button>
        
        <Button
          onClick={onExport}
          className="btn-primary px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </div>
    </div>
  );
}
