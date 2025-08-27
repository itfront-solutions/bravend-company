import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useToast } from "@/hooks/use-toast";
import BusinessDashboard from "@/components/businessquest/BusinessDashboard";

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar o BusinessQuest.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessDashboard />
    </div>
  );
}