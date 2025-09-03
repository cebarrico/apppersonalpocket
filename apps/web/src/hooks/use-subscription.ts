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

  return {
    subscription,
    currentPlan,
    loading,
    error,
  };
};
