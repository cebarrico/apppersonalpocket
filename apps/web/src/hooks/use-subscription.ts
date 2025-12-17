import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import {
  Plan,
  getPlanById,
  getFreePlan,
} from "../../../../packages/database/plans/plans";
import { Database } from "../../../../packages/supabase-client/Database";

// Tipo para a subscription vindo do Database.ts
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  currentPlan: Plan;
  loading: boolean;
  error: string | null;
  upgradeToPremium: () => Promise<{ success: boolean; error?: string }>;
  refreshSubscription: () => Promise<void>;
}

export const useSubscription = (userId: string): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan>(getFreePlan());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar subscription ativa do usuário
        const { data, error: subscriptionError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .single();

        if (subscriptionError) {
          // 42P01 = Tabela não existe no banco
          // PGRST116 = No rows returned (subscription not found)
          if (subscriptionError.code === "42P01") {
            console.warn(
              "Tabela subscriptions não existe no banco. Usando plano gratuito como fallback."
            );
            setSubscription(null);
            setCurrentPlan(getFreePlan());
            return;
          } else if (subscriptionError.code !== "PGRST116") {
            throw subscriptionError;
          }
        }

        if (data) {
          // Usuário tem subscription ativa
          setSubscription(data);
          // Usar plan_type e remover quebras de linha
          const planId = data.plan_type?.trim();
          const plan = getPlanById(planId);
          if (plan) {
            setCurrentPlan(plan);
          } else {
            // Plan_type não encontrado, usar plano gratuito como fallback
            console.warn(`Plano não encontrado: ${planId}`);
            setCurrentPlan(getFreePlan());
          }
        } else {
          // Usuário não tem subscription ativa, usar plano gratuito
          setSubscription(null);
          setCurrentPlan(getFreePlan());
        }
      } catch (err) {
        console.error("Erro ao buscar subscription:", err);
        setError("Erro ao carregar informações do plano");
        // Em caso de erro, usar plano gratuito como fallback
        setCurrentPlan(getFreePlan());
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const upgradeToPremium = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: "Usuário não encontrado" };
    }

    try {
      setLoading(true);
      
      // Verificar se já existe uma subscription ativa
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (existingSubscription) {
        // Atualizar subscription existente para premium
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            plan_type: "premium",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSubscription.id);

        if (updateError) {
          console.error("Erro ao atualizar subscription:", updateError);
          return { success: false, error: "Erro ao atualizar plano" };
        }
      } else {
        // Criar nova subscription premium
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan_type: "premium",
            status: "active",
            started_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Erro ao criar subscription:", insertError);
          return { success: false, error: "Erro ao criar plano premium" };
        }
      }

      // Atualizar o estado local
      await refreshSubscription();
      
      return { success: true };
    } catch (error) {
      console.error("Erro no upgrade:", error);
      return { success: false, error: "Erro inesperado no upgrade" };
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async (): Promise<void> => {
    if (!userId) return;
    
    try {
      // Buscar subscription ativa do usuário
      const { data, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        throw subscriptionError;
      }

      if (data) {
        // Usuário tem subscription ativa
        setSubscription(data);
        const planId = data.plan_type?.trim();
        const plan = getPlanById(planId);
        if (plan) {
          setCurrentPlan(plan);
        } else {
          setCurrentPlan(getFreePlan());
        }
      } else {
        // Usuário não tem subscription ativa, usar plano gratuito
        setSubscription(null);
        setCurrentPlan(getFreePlan());
      }
    } catch (err) {
      console.error("Erro ao atualizar subscription:", err);
      setCurrentPlan(getFreePlan());
    }
  };

  return {
    subscription,
    currentPlan,
    loading,
    error,
    upgradeToPremium,
    refreshSubscription,
  };
};
