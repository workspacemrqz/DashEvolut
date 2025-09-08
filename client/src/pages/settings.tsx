import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
} from "lucide-react";


export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notifications");


  // Buscar configurações do usuário
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/user/settings"],
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



  const handleNotificationChange = (key: string, value: boolean) => {
    if (!userSettings?.notifications) return;
    
    const updatedNotifications = {
      ...userSettings.notifications,
      [key]: value
    };
    
    updateSettingsMutation.mutate({
      notifications: updatedNotifications
    });
  };

  const handleUISettingChange = (key: string, value: string | boolean) => {
    if (!userSettings?.uiSettings) return;
    
    const updatedUISettings = {
      ...userSettings.uiSettings,
      [key]: value
    };
    
    updateSettingsMutation.mutate({
      uiSettings: updatedUISettings
    });
  };


  const tabs = [
    { id: "notifications", label: "Notificações", icon: Bell },
  ];

  if (isLoadingSettings) {
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

        </div>
      </main>
    </div>
  );
}