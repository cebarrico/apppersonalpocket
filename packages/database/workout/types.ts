import { Exercise } from "@pocket-trainer-hub/supabase-client";

// Estendendo o Exercise com campos adicionais para o database
export interface ExerciseExtended extends Exercise {
  difficulty: "beginner" | "intermediate" | "advanced";
  primary_muscles: string[];
  secondary_muscles: string[];
  tips: string[];
}

// Tipos para filtros
export interface ExerciseFilters {
  muscle_group?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  equipment?: string;
}

// Tipos para templates de treino
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  muscle_groups: string[];
  exercises: {
    exercise_id: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    notes?: string;
  }[];
}

// Grupos musculares disponíveis
export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Ombros",
  "Braços",
  "Pernas",
  "Abdômen",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// Equipamentos disponíveis
export const EQUIPMENT_TYPES = [
  "Peso corporal",
  "Halteres",
  "Barra",
  "Máquina",
  "Cabo",
  "Kettlebell",
  "Elástico",
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

// Tipos para níveis de dificuldade
export const DIFFICULTY_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

// Tipo para geração de treino
export interface WorkoutGenerationOptions {
  muscle_groups: MuscleGroup[];
  difficulty: DifficultyLevel;
  exercise_count: number;
  equipment_available?: string[];
  duration_minutes?: number;
}

// Tipo para resposta de busca
export interface ExerciseSearchResult {
  exercises: ExerciseExtended[];
  total_count: number;
  filtered_count: number;
}
