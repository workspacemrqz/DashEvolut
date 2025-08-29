import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderOpen, Building, Mail, Phone, Calendar, DollarSign } from "lucide-react";
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
    { id: "active", name: "Ativos", color: "bg-chart-1" },
    { id: "inactive", name: "Inativos", color: "bg-muted" }
  ];

  // Project status configuration
  const projectStatuses = [
    { id: "discovery", name: "Discovery", color: "bg-chart-5" },
    { id: "development", name: "Desenvolvimento", color: "bg-chart-1" },
    { id: "delivery", name: "Entrega", color: "bg-chart-2" },
    { id: "post_sale", name: "Pós-venda", color: "bg-chart-3" }
  ];

  const updateClientStatus = useMutation({
    mutationFn: async ({ clientId, status }: { clientId: string; status: string }) => {
      return apiRequest("PATCH", `/api/clients/${clientId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Status atualizado",
        description: "Status do cliente foi atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do cliente",
        variant: "destructive",
      });
    },
  });

  const updateProjectStatus = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: string; status: string }) => {
      return apiRequest("PATCH", `/api/projects/${projectId}`, { status });
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

  const handleClientDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    if (draggedClient && draggedClient.status !== targetStatus) {
      updateClientStatus.mutate({ 
        clientId: draggedClient.id, 
        status: targetStatus 
      });
    }
    setDraggedClient(null);
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

  const getClientsByStatus = (status: string): Client[] => {
    return clients?.filter(client => client.status === status) || [];
  };

  const getProjectsByStatus = (status: string): ProjectWithClient[] => {
    return projects?.filter(project => project.status === status) || [];
  };

  const ClientCard = ({ client }: { client: Client }) => (
    <Card 
      className="mb-3 cursor-grab active:cursor-grabbing border-border-secondary bg-card hover:bg-card/80 transition-colors"
      draggable
      onDragStart={() => handleClientDragStart(client)}
      data-testid={`client-card-${client.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-text-primary">{client.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center text-xs text-text-secondary">
          <Building className="w-3 h-3 mr-1" />
          {client.company}
        </div>
        <div className="flex items-center text-xs text-text-secondary">
          <Mail className="w-3 h-3 mr-1" />
          {client.email}
        </div>
        {client.phone && (
          <div className="flex items-center text-xs text-text-secondary">
            <Phone className="w-3 h-3 mr-1" />
            {client.phone}
          </div>
        )}
        {client.ltv && client.ltv > 0 && (
          <div className="flex items-center text-xs">
            <DollarSign className="w-3 h-3 mr-1 text-green-500" />
            <span className="text-green-500">R$ {client.ltv.toLocaleString('pt-BR')}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <Badge className="status-badge status-active text-xs">
            {client.sector}
          </Badge>
          {client.upsellPotential && (
            <Badge className="status-badge status-active text-xs">
              {client.upsellPotential === 'high' ? 'Alto' : client.upsellPotential === 'medium' ? 'Médio' : 'Baixo'} Upsell
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ProjectCard = ({ project }: { project: ProjectWithClient }) => (
    <Card 
      className="mb-3 cursor-grab active:cursor-grabbing border-border-secondary bg-card hover:bg-card/80 transition-colors"
      draggable
      onDragStart={() => handleProjectDragStart(project)}
      data-testid={`project-card-${project.id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-text-primary">{project.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <p className="text-xs text-text-secondary line-clamp-2">{project.description}</p>
        <div className="flex items-center text-xs text-text-secondary">
          <Users className="w-3 h-3 mr-1" />
          {project.client?.name}
        </div>
        <div className="flex items-center text-xs">
          <DollarSign className="w-3 h-3 mr-1 text-green-500" />
          <span className="text-green-500">R$ {project.value.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center text-xs text-text-secondary">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(project.dueDate).toLocaleDateString('pt-BR')}
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
      </CardContent>
    </Card>
  );

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
      className="flex-1 min-h-96"
      onDrop={onDrop}
      onDragOver={handleDragOver}
      data-testid={`kanban-column-${title.toLowerCase()}`}
    >
      <div className={`${color} h-1 rounded-t-lg`} />
      <div className="bg-card border border-border-secondary border-t-0 rounded-b-lg p-4 min-h-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">{title}</h3>
          <Badge className="status-badge status-active text-xs">
            {count}
          </Badge>
        </div>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-bg-primary">
      <Header title="Kanban" />
      
      <div className="flex-1 p-6">
        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card border border-border-secondary">
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:!bg-[#f5f5f5] data-[state=active]:!text-[#060606] [&[data-state=active]>svg]:!text-[#060606]"
            >
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger 
              value="projects" 
              className="data-[state=active]:!bg-[#f5f5f5] data-[state=active]:!text-[#060606] [&[data-state=active]>svg]:!text-[#060606]"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Projetos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4 mt-6">
            <div className="flex gap-6">
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

          <TabsContent value="projects" className="space-y-4 mt-6">
            <div className="flex gap-6">
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