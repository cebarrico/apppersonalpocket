export interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  maxStudents: number;
  features: string[];
  color: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "free",
    displayName: "Gratuito",
    price: 0,
    currency: "BRL",
    maxStudents: 1,
    features: ["agenda", "treinos básicos"],
    color: "bronze-metal",
  },
  {
    id: "basic",
    name: "basic",
    displayName: "Básico",
    price: 29.9,
    currency: "BRL",
    maxStudents: 10,
    features: ["agenda", "treinos básicos"],
    color: "silver-metal",
  },
  {
    id: "premium",
    name: "premium",
    displayName: "Premium",
    price: 59.9,
    currency: "BRL",
    maxStudents: 30,
    features: ["agenda", "treinos personalizados", "evolução"],
    color: "gold-metal",

    popular: true,
  },
];

export const PLAN_FEATURES = {
  free: {
    maxStudents: 1,
    features: ["agenda", "treinos básicos"],
  },
  basic: {
    maxStudents: 10,
    features: ["agenda", "treinos básicos"],
  },
  premium: {
    maxStudents: 30,
    features: ["agenda", "treinos personalizados", "evolução"],
  },
};

// Helper functions
export const getPlanById = (planId: string): Plan | undefined => {
  return PLANS.find((plan) => plan.id === planId);
};

export const getFreePlan = (): Plan => {
  return PLANS.find((plan) => plan.id === "free")!;
};
