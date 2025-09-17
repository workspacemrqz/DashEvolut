import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FolderOpen, Building, Mail, Phone, Calendar, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { Client, Project, ProjectWithClient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ClientWithDrag = Client & {
  isDragging?: boolean;
};

type ProjectWithDrag = ProjectWithClient & {
  isDragging?: boolean;
};

export default function Kanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedClient, setDraggedClient] = useState<ClientWithDrag | null>(null);
  const [draggedProject, setDraggedProject] = useState<ProjectWithDrag | null>(null);

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: projects } = useQuery<ProjectWithClient[]>({
    queryKey: ["/api/projects"],
  });

  // Client status configuration
  const clientStatuses = [
    { id: "prospect", name: "Prospects", color: "bg-chart-3" },
    { id: "active", name: "Ativos", color: "bg-chart-1" }
  ];

  // Project status configuration
  const projectStatuses = [
    { id: "discovery", name: "Discovery", color: "bg-chart-5" },
    { id: "development", name: "Desenvolvimento", color: "bg-chart-1" },
    { id: "delivery", name: "Entrega", color: "bg-chart-2" },
    { id: "post_sale", name: "Pós-venda", color: "bg-chart-3" }
  ];


  const updateProjectStatus = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      return apiRequest("PATCH", `/api/projects/${projectId}`, { 
        status,
        updatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Status atualizado",
        description: "Status do projeto foi atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do projeto",
        variant: "destructive",
      });
    },
  });

  const handleClientDragStart = (client: Client) => {
    setDraggedClient(client);
  };


  const handleProjectDragStart = (project: ProjectWithClient) => {
    setDraggedProject(project);
  };

  const handleProjectDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedProject && draggedProject.status !== targetStatus) {
      updateProjectStatus.mutate({ 
        projectId: draggedProject.id, 
        status: targetStatus 
      });
    }
    setDraggedProject(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };


  // Arrow navigation functions for projects
  const moveProjectToStatus = (projectId: string, currentStatus: string, direction: 'left' | 'right') => {
    const currentIndex = projectStatuses.findIndex(s => s.id === currentStatus);
    let targetIndex;
    
    if (direction === 'left') {
      targetIndex = currentIndex - 1;
    } else {
      targetIndex = currentIndex + 1;
    }
    
    // Check if target index is valid
    if (targetIndex >= 0 && targetIndex < projectStatuses.length) {
      const targetStatus = projectStatuses[targetIndex].id;
      updateProjectStatus.mutate({ projectId, status: targetStatus });
    }
  };

  const getClientsByStatus = (status: string): Client[] => {
    let filteredClients: Client[] = [];
    
    if (status === "active") {
      filteredClients = clients?.filter(client => client.hasActiveSubscription) || [];
    } else if (status === "prospect") {
      filteredClients = clients?.filter(client => !client.hasActiveSubscription) || [];
    }
    
    return filteredClients.sort((a, b) => {
      const aUpdated = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bUpdated = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bUpdated - aUpdated;
    });
  };

  const getProjectsByStatus = (status: string): ProjectWithClient[] => {
    const filteredProjects = projects?.filter(project => project.status === status) || [];
    return filteredProjects.sort((a, b) => {
      const aUpdated = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bUpdated = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bUpdated - aUpdated;
    });
  };

  const ClientCard = ({ client }: { client: Client }) => {
    const currentIndex = clientStatuses.findIndex(s => s.id === client.status);
    const canMoveLeft = currentIndex > 0;
    const canMoveRight = currentIndex < clientStatuses.length - 1;

    return (
      <Card 
        className="mb-2 lg:mb-3 cursor-grab active:cursor-grabbing border-border-secondary bg-card relative"
        draggable
        onDragStart={() => handleClientDragStart(client)}
        data-testid={`client-card-${client.id}`}
      >
        {/* Individual card navigation arrows - always visible */}
        {canMoveLeft && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 left-1 w-5 h-5 p-0 bg-background/80 backdrop-blur-sm border border-border-secondary z-10"
            onClick={(e) => {
              e.stopPropagation();
              moveClientToStatus(client.id, client.status, 'left');
            }}
            data-testid={`client-arrow-left-${client.id}`}
          >
            <ChevronLeft className="w-3 h-3 text-text-primary" />
          </Button>
        )}
        
        {canMoveRight && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 w-5 h-5 p-0 bg-background/80 backdrop-blur-sm border border-border-secondary z-10"
            onClick={(e) => {
              e.stopPropagation();
              moveClientToStatus(client.id, client.status, 'right');
            }}
            data-testid={`client-arrow-right-${client.id}`}
          >
            <ChevronRight className="w-3 h-3 text-text-primary" />
          </Button>
        )}

        <CardHeader className="pb-2 p-3 lg:p-6">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xs lg:text-sm font-medium text-text-primary leading-tight">{client.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1 lg:space-y-2 p-3 lg:p-6">
          <div className="flex items-center text-xs text-text-secondary">
            <Building className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{client.company}</span>
          </div>
          <div className="flex items-center text-xs text-text-secondary">
            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center text-xs text-text-secondary hidden lg:flex">
              <Phone className="w-3 h-3 mr-1" />
              {client.phone}
            </div>
          )}
          {client.ltv && client.ltv > 0 && (
            <div className="flex items-center text-xs">
              <DollarSign className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
              <span className="text-green-500">
                <span className="lg:hidden">R$ {Math.round(client.ltv / 1000)}k</span>
                <span className="hidden lg:inline">R$ {client.ltv.toLocaleString('pt-BR')}</span>
              </span>
            </div>
          )}
          <div className="flex justify-between items-center flex-wrap gap-1">
            <Badge className="status-badge status-active text-xs truncate">
              {client.sector}
            </Badge>
            {client.upsellPotential && (
              <Badge className="status-badge status-active text-xs hidden lg:block">
                {client.upsellPotential === 'high' ? 'Alto' : client.upsellPotential === 'medium' ? 'Médio' : 'Baixo'} Upsell
              </Badge>
            )}
          </div>
          <div className="text-xs mt-2 lg:mt-3 hidden lg:block">
            <span className="text-dark-text">Atualização: </span>
            <span style={{color: '#2D81EA'}}>
              {client.updatedAt ? 
                new Date(client.updatedAt).toLocaleDateString('pt-BR') + ' - ' + new Date(client.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                new Date(client.createdAt || Date.now()).toLocaleDateString('pt-BR') + ' - ' + new Date(client.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectCard = ({ project }: { project: ProjectWithClient }) => {
    const currentIndex = projectStatuses.findIndex(s => s.id === project.status);
    const canMoveLeft = currentIndex > 0;
    const canMoveRight = currentIndex < projectStatuses.length - 1;

    return (
      <Card 
        className="mb-2 lg:mb-3 cursor-grab active:cursor-grabbing border-border-secondary bg-card relative"
        draggable
        onDragStart={() => handleProjectDragStart(project)}
        data-testid={`project-card-${project.id}`}
      >
        {/* Individual card navigation arrows - always visible */}
        {canMoveLeft && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 left-1 w-5 h-5 p-0 bg-background/80 backdrop-blur-sm border border-border-secondary z-10"
            onClick={(e) => {
              e.stopPropagation();
              moveProjectToStatus(project.id, project.status, 'left');
            }}
            data-testid={`project-arrow-left-${project.id}`}
          >
            <ChevronLeft className="w-3 h-3 text-text-primary" />
          </Button>
        )}
        
        {canMoveRight && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 w-5 h-5 p-0 bg-background/80 backdrop-blur-sm border border-border-secondary z-10"
            onClick={(e) => {
              e.stopPropagation();
              moveProjectToStatus(project.id, project.status, 'right');
            }}
            data-testid={`project-arrow-right-${project.id}`}
          >
            <ChevronRight className="w-3 h-3 text-text-primary" />
          </Button>
        )}

        <CardHeader className="pb-2 p-3 lg:p-6">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xs lg:text-sm font-medium text-text-primary leading-tight">{project.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-1 lg:space-y-2 p-3 lg:p-6">
          <p className="text-xs text-text-secondary line-clamp-2 leading-tight">{project.description}</p>
          <div className="flex items-center text-xs text-text-secondary">
            <Users className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{project.client?.name}</span>
          </div>
          <div className="flex items-center text-xs">
            <DollarSign className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
            <span className="text-green-500">
              <span className="lg:hidden">R$ {Math.round(project.value / 1000)}k</span>
              <span className="hidden lg:inline">R$ {project.value.toLocaleString('pt-BR')}</span>
            </span>
          </div>
          <div className="flex items-center text-xs text-text-secondary">
            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">{new Date(project.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary ml-2">{project.progress}%</span>
          </div>
          <div className="text-xs mt-2 lg:mt-3 hidden lg:block">
            <span className="text-dark-text">Atualização: </span>
            <span style={{color: '#2D81EA'}}>
              {project.updatedAt ? 
                new Date(project.updatedAt).toLocaleDateString('pt-BR') + ' - ' + new Date(project.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 
                new Date(project.createdAt || Date.now()).toLocaleDateString('pt-BR') + ' - ' + new Date(project.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const KanbanColumn = ({ 
    title, 
    color, 
    children, 
    onDrop, 
    count
  }: { 
    title: string; 
    color: string; 
    children: React.ReactNode; 
    onDrop: (e: React.DragEvent) => void; 
    count: number;
  }) => (
    <div 
      className="flex-shrink-0 w-72 lg:flex-1 lg:w-auto min-h-80 lg:min-h-96"
      onDrop={onDrop}
      onDragOver={handleDragOver}
      data-testid={`kanban-column-${title.toLowerCase()}`}
    >
      <div className="h-1 rounded-t-lg bg-[#3571e6]" />
      <div className="bg-card border border-border-secondary border-t-0 rounded-b-lg p-3 lg:p-4 min-h-80 lg:min-h-96">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="font-semibold text-text-primary text-sm lg:text-base">{title}</h3>
          <Badge variant="outline" className="text-xs">
            {count}
          </Badge>
        </div>
        <div className="space-y-2 lg:space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-bg-primary">
      <Header 
        title="Kanban" 
        subtitle="Gestão visual de clientes e projetos"
      />
      
      <div className="flex-1 p-3 lg:p-6">
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border-secondary">
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:bg-light-bg data-[state=active]:text-light-text [&[data-state=active]>svg]:text-light-text text-xs lg:text-sm [&:not([data-state=active])]:!text-[hsl(203.89,88.28%,53.14%)] [&:not([data-state=active])>svg]:!text-[hsl(203.89,88.28%,53.14%)]"
            >
              <Users className="w-4 h-4 mr-1 lg:mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:bg-light-bg data-[state=active]:text-light-text [&[data-state=active]>svg]:text-light-text text-xs lg:text-sm [&:not([data-state=active])]:!text-[hsl(203.89,88.28%,53.14%)] [&:not([data-state=active])>svg]:!text-[hsl(203.89,88.28%,53.14%)]"
            >
              <FolderOpen className="w-4 h-4 mr-1 lg:mr-2" />
              Projetos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4 mt-4 lg:mt-6">
            <div className="flex gap-3 lg:gap-6 overflow-x-auto pb-4">
              {clientStatuses.map((status) => {
                const clientsInStatus = getClientsByStatus(status.id);
                return (
                  <KanbanColumn
                    key={status.id}
                    title={status.name}
                    color={status.color}
                    count={clientsInStatus.length}
                    onDrop={(e) => handleClientDrop(e, status.id)}
                  >
                    {clientsInStatus.map((client) => (
                      <ClientCard key={client.id} client={client} />
                    ))}
                  </KanbanColumn>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-4 lg:mt-6">
            <div className="flex gap-3 lg:gap-6 overflow-x-auto pb-4">
              {projectStatuses.map((status) => {
                const projectsInStatus = getProjectsByStatus(status.id);
                return (
                  <KanbanColumn
                    key={status.id}
                    title={status.name}
                    color={status.color}
                    count={projectsInStatus.length}
                    onDrop={(e) => handleProjectDrop(e, status.id)}
                  >
                    {projectsInStatus.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </KanbanColumn>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}