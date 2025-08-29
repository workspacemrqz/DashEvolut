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
  Eye,
  EyeOff
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

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

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      const response = await apiRequest("PATCH", "/api/user/password", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: "Erro ao alterar senha",
        description: "Não foi possível alterar a senha.",
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
        name: userProfile.name || "",
        email: userProfile.email || "",
        company: userProfile.company || "",
        phone: userProfile.phone || "",
      });
    }
  }, [userProfile]);

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const updatedNotifications = {
      ...userSettings?.notifications,
      [key]: value
    };
    
    updateSettingsMutation.mutate({
      notifications: updatedNotifications
    });
  };

  const handleUISettingChange = (key: string, value: string | boolean) => {
    const updatedUISettings = {
      ...userSettings?.uiSettings,
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
              <CardContent>
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

                  <Separator />

                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                      <h3 className="text-lg font-semibold text-text-primary">Alterar Senha</h3>
                      
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-text-primary">Senha Atual</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  className="bg-bg-primary border-border-secondary text-text-primary pr-10"
                                  data-testid="input-current-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showPassword ? (
                                    <EyeOff className="w-4 h-4 text-text-secondary" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-text-secondary" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-text-primary">Nova Senha</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-bg-primary border-border-secondary text-text-primary"
                                  data-testid="input-new-password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-text-primary">Confirmar Nova Senha</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="password"
                                  className="bg-bg-primary border-border-secondary text-text-primary"
                                  data-testid="input-confirm-password"
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
                          data-testid="button-change-password"
                          disabled={changePasswordMutation.isPending}
                        >
                          <Save className="w-4 h-4" />
                          {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                        </Button>
                      </div>
                    </form>
                  </Form>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
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
                      checked={notifications.email}
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
                      checked={notifications.push}
                      onCheckedChange={(value) => handleNotificationChange("push", value)}
                      data-testid="switch-push-notifications"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary">Tipos de Notificação</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-primary font-medium">Atualizações de Projeto</Label>
                      <p className="text-sm text-text-secondary">Mudanças de status e progresso</p>
                    </div>
                    <Switch
                      checked={notifications.projectUpdates}
                      onCheckedChange={(value) => handleNotificationChange("projectUpdates", value)}
                      data-testid="switch-project-updates"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-primary font-medium">Mensagens de Clientes</Label>
                      <p className="text-sm text-text-secondary">Novos contatos e comunicações</p>
                    </div>
                    <Switch
                      checked={notifications.clientMessages}
                      onCheckedChange={(value) => handleNotificationChange("clientMessages", value)}
                      data-testid="switch-client-messages"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-primary font-medium">Alertas de Prazo</Label>
                      <p className="text-sm text-text-secondary">Projetos próximos do vencimento</p>
                    </div>
                    <Switch
                      checked={notifications.deadlineAlerts}
                      onCheckedChange={(value) => handleNotificationChange("deadlineAlerts", value)}
                      data-testid="switch-deadline-alerts"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-primary font-medium">Relatórios Semanais</Label>
                      <p className="text-sm text-text-secondary">Resumo semanal de atividades</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(value) => handleNotificationChange("weeklyReports", value)}
                      data-testid="switch-weekly-reports"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interface Tab */}
          {activeTab === "interface" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configurações de Interface
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Personalize a aparência e comportamento da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-text-primary font-medium">Tema</Label>
                      <p className="text-sm text-text-secondary mb-2">Escolha a aparência da interface</p>
                      <Select
                        value={uiSettings.theme}
                        onValueChange={(value) => handleUISettingChange("theme", value)}
                      >
                        <SelectTrigger className="bg-bg-primary border-border-secondary text-text-primary" data-testid="select-theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-container border-border-secondary">
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-text-primary font-medium">Idioma</Label>
                      <p className="text-sm text-text-secondary mb-2">Idioma da interface</p>
                      <Select
                        value={uiSettings.language}
                        onValueChange={(value) => handleUISettingChange("language", value)}
                      >
                        <SelectTrigger className="bg-bg-primary border-border-secondary text-text-primary" data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-container border-border-secondary">
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-text-primary font-medium">Formato de Data</Label>
                      <p className="text-sm text-text-secondary mb-2">Como as datas são exibidas</p>
                      <Select
                        value={uiSettings.dateFormat}
                        onValueChange={(value) => handleUISettingChange("dateFormat", value)}
                      >
                        <SelectTrigger className="bg-bg-primary border-border-secondary text-text-primary" data-testid="select-date-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-container border-border-secondary">
                          <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                          <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-text-primary font-medium">Moeda</Label>
                      <p className="text-sm text-text-secondary mb-2">Moeda padrão para valores</p>
                      <Select
                        value={uiSettings.currency}
                        onValueChange={(value) => handleUISettingChange("currency", value)}
                      >
                        <SelectTrigger className="bg-bg-primary border-border-secondary text-text-primary" data-testid="select-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-bg-container border-border-secondary">
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Salvamento Automático</Label>
                    <p className="text-sm text-text-secondary">Salvar alterações automaticamente</p>
                  </div>
                  <Switch
                    checked={uiSettings.autoSave}
                    onCheckedChange={(value) => handleUISettingChange("autoSave", value)}
                    data-testid="switch-auto-save"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Gerencie a segurança da sua conta e dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary border border-border-secondary">
                    <div>
                      <h3 className="font-medium text-text-primary">Autenticação de Dois Fatores</h3>
                      <p className="text-sm text-text-secondary">Adicione uma camada extra de segurança</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        Não Configurado
                      </Badge>
                      <Button variant="outline" size="sm" data-testid="button-setup-2fa">
                        Configurar
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary border border-border-secondary">
                    <div>
                      <h3 className="font-medium text-text-primary">Sessões Ativas</h3>
                      <p className="text-sm text-text-secondary">Gerencie dispositivos conectados</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-manage-sessions">
                      Gerenciar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-bg-secondary border border-border-secondary">
                    <div>
                      <h3 className="font-medium text-text-primary">Log de Atividades</h3>
                      <p className="text-sm text-text-secondary">Visualizar histórico de acessos</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-view-activity">
                      Visualizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Tab */}
          {activeTab === "data" && (
            <Card className="container-bg border-border-secondary">
              <CardHeader>
                <CardTitle className="text-text-primary flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Gerenciamento de Dados
                </CardTitle>
                <CardDescription className="text-text-secondary">
                  Importe, exporte e gerencie seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleExportData}
                    variant="outline" 
                    className="h-24 flex-col gap-2"
                    data-testid="button-export-data"
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
                    data-testid="button-import-data"
                  >
                    <Upload className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-medium">Importar Dados</div>
                      <div className="text-sm text-text-secondary">Carregar dados de arquivo</div>
                    </div>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary text-red-500">Zona de Perigo</h3>
                  
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-500">Excluir Conta</h4>
                        <p className="text-sm text-text-secondary">Esta ação não pode ser desfeita</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}