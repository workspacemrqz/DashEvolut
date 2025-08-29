import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  phone: z.string().optional(),
});


type ProfileFormData = z.infer<typeof profileSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  // Buscar perfil do usuário
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  // Buscar configurações do usuário
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/user/settings"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
    },
  });


  // Mutations para atualizar perfil e senha
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    },
  });


  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/user/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  // Atualizar o formulário quando os dados do usuário carregarem
  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile?.name || "",
        email: userProfile?.email || "",
        company: userProfile?.company || "",
        phone: userProfile?.phone || "",
      });
    }
  }, [userProfile]);

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };


  const handleNotificationChange = (key: string, value: boolean) => {
    if (!userSettings) return;
    
    const updatedNotifications = {
      ...userSettings.notifications,
      [key]: value
    };
    
    updateSettingsMutation.mutate({
      notifications: updatedNotifications
    });
  };

  const handleUISettingChange = (key: string, value: string | boolean) => {
    if (!userSettings) return;
    
    const updatedUISettings = {
      ...userSettings.uiSettings,
      [key]: value
    };
    
    updateSettingsMutation.mutate({
      uiSettings: updatedUISettings
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo preparados para download.",
    });
  };

  const handleImportData = () => {
    // Simular upload de arquivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = () => {
      toast({
        title: "Importação iniciada",
        description: "Seus dados estão sendo processados.",
      });
    };
    input.click();
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "interface", label: "Interface", icon: Palette },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "data", label: "Dados", icon: Database },
  ];

  if (isLoadingProfile || isLoadingSettings) {
    return (
      <div className="flex-1 flex flex-col">
        <Header 
          title="Configurações" 
          subtitle="Gerencie suas preferências e configurações do sistema"
        />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div>Carregando...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Configurações" 
        subtitle="Gerencie suas preferências e configurações do sistema"
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "btn-primary" 
                      : "btn-secondary"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário de Perfil */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-text-primary">Nome Completo</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-bg-primary border-border-secondary text-text-primary"
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-text-primary">Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="bg-bg-primary border-border-secondary text-text-primary"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-text-primary">Empresa</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-bg-primary border-border-secondary text-text-primary"
                                data-testid="input-company"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-text-primary">Telefone</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-bg-primary border-border-secondary text-text-primary"
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="btn-primary flex items-center gap-2"
                        data-testid="button-save-profile"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="w-4 h-4" />
                        {updateProfileMutation.isPending ? "Salvando..." : "Salvar Perfil"}
                      </Button>
                    </div>
                  </form>
                </Form>

              </CardContent>
            </Card>
          )}

          {/* Notifications Tab - Simplified */}
          {activeTab === "notifications" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configurações de Notificação
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Escolha como e quando receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Canais de Notificação</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-primary font-medium">Notificações por Email</Label>
                      <p className="text-sm text-text-secondary">Receba notificações no seu email</p>
                    </div>
                    <Switch
                      checked={userSettings?.notifications?.email || false}
                      onCheckedChange={(value) => handleNotificationChange("email", value)}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-primary font-medium">Notificações Push</Label>
                      <p className="text-sm text-text-secondary">Receba notificações no navegador</p>
                    </div>
                    <Switch
                      checked={userSettings?.notifications?.push || false}
                      onCheckedChange={(value) => handleNotificationChange("push", value)}
                      data-testid="switch-push-notifications"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other tabs simplified */}
          {activeTab === "interface" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configurações de Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-text-primary font-medium">Tema</Label>
                    <Select
                      value={userSettings?.uiSettings?.theme || "dark"}
                      onValueChange={(value) => handleUISettingChange("theme", value)}
                    >
                      <SelectTrigger className="bg-bg-primary border-border-secondary text-text-primary mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">Funcionalidades de segurança em desenvolvimento.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === "data" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Gerenciamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleExportData}
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                  >
                    <Download className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">Exportar Dados</div>
                      <div className="text-sm text-text-secondary">Baixar todos os seus dados</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={handleImportData}
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                  >
                    <Upload className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">Importar Dados</div>
                      <div className="text-sm text-text-secondary">Carregar dados de arquivo</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}