import { useQuery } from "@tanstack/react-query";
import { ClientWithStats } from "@shared/schema";

interface SectorHeatmapProps {
  "data-testid"?: string;
}

export default function SectorHeatmap({ "data-testid": testId }: SectorHeatmapProps) {
  const { data: clients } = useQuery<ClientWithStats[]>({
    queryKey: ["/api/clients"],
  });

  const generateHeatmapData = () => {
    if (!clients) return [];

    const sectors = ["Tecnologia", "Marketing", "Consultoria"];
    const sources = ["Indicação", "Google Ads", "LinkedIn"];
    
    const data = [];
    
    sectors.forEach(sector => {
      sources.forEach(source => {
        const count = clients.filter(client => 
          client.sector.toLowerCase().includes(sector.toLowerCase()) &&
          client.source.toLowerCase().includes(source.toLowerCase())
        ).length;
        
        data.push({
          sector,
          source,
          count,
          intensity: count > 0 ? Math.min(count / 5, 1) : 0 // Normalize intensity
        });
      });
    });
    
    return data;
  };

  const data = generateHeatmapData();
  const maxCount = Math.max(...data.map(d => d.count));

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
    if (intensity <= 0.2) return "bg-blue-200 dark:bg-blue-900";
    if (intensity <= 0.4) return "bg-blue-300 dark:bg-blue-800";
    if (intensity <= 0.6) return "bg-blue-400 dark:bg-blue-700";
    if (intensity <= 0.8) return "bg-blue-500 dark:bg-blue-600";
    return "bg-blue-600 dark:bg-blue-500";
  };

  const getTextColor = (intensity: number) => {
    return intensity > 0.5 ? "text-white" : "text-gray-700 dark:text-gray-300";
  };

  return (
    <div className="container-bg rounded-xl p-6 border border-border-secondary" data-testid={testId}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Heatmap: Setor vs Fonte</h3>
        <p className="text-sm text-text-secondary">Distribuição de clientes por setor e fonte de aquisição</p>
      </div>
      
      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2">
          <div></div>
          <div className="text-center text-sm font-medium text-text-secondary">Indicação</div>
          <div className="text-center text-sm font-medium text-text-secondary">Google Ads</div>
          <div className="text-center text-sm font-medium text-text-secondary">LinkedIn</div>
        </div>
        
        {/* Heatmap Grid */}
        {["Tecnologia", "Marketing", "Consultoria"].map(sector => (
          <div key={sector} className="grid grid-cols-4 gap-2 items-center">
            <div className="text-sm font-medium text-text-primary">{sector}</div>
            {["Indicação", "Google Ads", "LinkedIn"].map(source => {
              const cellData = data.find(d => d.sector === sector && d.source === source);
              const count = cellData?.count || 0;
              const intensity = cellData?.intensity || 0;
              
              return (
                <div
                  key={`${sector}-${source}`}
                  className={`h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${getIntensityColor(intensity)} ${getTextColor(intensity)}`}
                  title={`${sector} - ${source}: ${count} clientes`}
                >
                  {count}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-text-secondary">Intensidade:</div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-text-secondary">0</div>
          <div className="flex space-x-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded ${getIntensityColor(intensity)}`}
                title={`${Math.round(intensity * maxCount)} clientes`}
              />
            ))}
          </div>
          <div className="text-xs text-text-secondary">{maxCount}</div>
        </div>
      </div>
    </div>
  );
}
