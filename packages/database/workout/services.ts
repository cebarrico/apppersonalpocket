import {
  ExerciseExtended,
  ExerciseFilters,
  MuscleGroup,
  WorkoutTemplate,
  DifficultyLevel,
  WorkoutGenerationOptions,
} from "./types";

// Importar os JSONs
import chestExercises from "./exercises/chest.json";
import backExercises from "./exercises/back.json";
import shouldersExercises from "./exercises/shoulders.json";
import armsExercises from "./exercises/arms.json";
import legsExercises from "./exercises/legs.json";
import absExercises from "./exercises/abs.json";

// Combinar todos os exercícios
const allExercises: ExerciseExtended[] = [
  ...chestExercises,
  ...backExercises,
  ...shouldersExercises,
  ...armsExercises,
  ...legsExercises,
  ...absExercises,
] as ExerciseExtended[];

export const exerciseDatabase = {
  // Buscar todos os exercícios
  getAll(): ExerciseExtended[] {
    return allExercises;
  },

  // Buscar exercício por ID
  getById(id: string): ExerciseExtended | null {
    return allExercises.find((exercise) => exercise.id === id) || null;
  },

  // Buscar exercícios por grupo muscular
  getByMuscleGroup(muscleGroup: MuscleGroup): ExerciseExtended[] {
    return allExercises.filter(
      (exercise) => exercise.muscle_group === muscleGroup
    );
  },

  // Buscar exercícios por filtros
  getByFilters(filters: ExerciseFilters): ExerciseExtended[] {
    let filtered = allExercises;

    if (filters.muscle_group) {
      filtered = filtered.filter(
        (exercise) => exercise.muscle_group === filters.muscle_group
      );
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (exercise) => exercise.difficulty === filters.difficulty
      );
    }

    if (filters.equipment) {
      filtered = filtered.filter((exercise) =>
        exercise.equipment
          ?.toLowerCase()
          .includes(filters.equipment!.toLowerCase())
      );
    }

    return filtered;
  },

  // Buscar exercícios por equipamento
  getByEquipment(equipment: string): ExerciseExtended[] {
    return allExercises.filter((exercise) =>
      exercise.equipment?.toLowerCase().includes(equipment.toLowerCase())
    );
  },

  // Buscar exercícios por dificuldade
  getByDifficulty(difficulty: DifficultyLevel): ExerciseExtended[] {
    return allExercises.filter(
      (exercise) => exercise.difficulty === difficulty
    );
  },

  // Buscar exercícios aleatórios
  getRandomExercises(
    count: number,
    filters?: ExerciseFilters
  ): ExerciseExtended[] {
    const available = filters ? this.getByFilters(filters) : allExercises;
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  // Obter todos os grupos musculares disponíveis
  getAvailableMuscleGroups(): string[] {
    return [...new Set(allExercises.map((exercise) => exercise.muscle_group))];
  },

  // Obter todos os equipamentos disponíveis
  getAvailableEquipment(): string[] {
    return [
      ...new Set(
        allExercises
          .map((exercise) => exercise.equipment)
          .filter((equipment): equipment is string => Boolean(equipment))
      ),
    ];
  },

  // Buscar exercícios para peso corporal
  getBodyweightExercises(): ExerciseExtended[] {
    return allExercises.filter((exercise) =>
      exercise.equipment?.toLowerCase().includes("peso corporal")
    );
  },

  // Contar exercícios por grupo muscular
  getCountByMuscleGroup(): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    allExercises.forEach((exercise) => {
      counts[exercise.muscle_group] = (counts[exercise.muscle_group] || 0) + 1;
    });
    return counts;
  },
};

// Service para templates de treino
export const workoutTemplateService = {
  // Criar template de treino baseado em exercícios
  createTemplate(
    name: string,
    exerciseIds: string[],
    difficulty: DifficultyLevel
  ): WorkoutTemplate | null {
    const exercises = exerciseIds
      .map((id) => exerciseDatabase.getById(id))
      .filter(Boolean);

    if (exercises.length === 0) {
      return null;
    }

    const muscleGroups = [...new Set(exercises.map((ex) => ex!.muscle_group))];

    return {
      id: `template-${Date.now()}`,
      name,
      description: `Treino focado em ${muscleGroups.join(", ")}`,
      difficulty,
      duration_minutes: exercises.length * 10, // Estimativa: 10 min por exercício
      muscle_groups: muscleGroups,
      exercises: exercises.map((ex) => ({
        exercise_id: ex!.id,
        sets:
          difficulty === "beginner" ? 3 : difficulty === "intermediate" ? 4 : 5,
        reps:
          difficulty === "beginner"
            ? "12-15"
            : difficulty === "intermediate"
            ? "8-12"
            : "6-10",
        rest_seconds:
          difficulty === "beginner"
            ? 60
            : difficulty === "intermediate"
            ? 90
            : 120,
        notes: ex!.tips[0] || undefined,
      })),
    };
  },

  // Gerar treino automático por grupo muscular
  generateWorkout(
    muscleGroups: MuscleGroup[],
    difficulty: DifficultyLevel,
    exerciseCount: number = 4
  ): WorkoutTemplate | null {
    const exercisesPerGroup = Math.ceil(exerciseCount / muscleGroups.length);
    const selectedExercises: ExerciseExtended[] = [];

    for (const group of muscleGroups) {
      const groupExercises = exerciseDatabase
        .getByMuscleGroup(group)
        .filter((ex) => ex.difficulty === difficulty);

      if (groupExercises.length === 0) {
        // Se não há exercícios para o nível, pega qualquer um do grupo
        const allGroupExercises = exerciseDatabase.getByMuscleGroup(group);
        const randomExercises = allGroupExercises
          .sort(() => 0.5 - Math.random())
          .slice(0, exercisesPerGroup);
        selectedExercises.push(...randomExercises);
      } else {
        const randomExercises = groupExercises
          .sort(() => 0.5 - Math.random())
          .slice(0, exercisesPerGroup);
        selectedExercises.push(...randomExercises);
      }
    }

    if (selectedExercises.length === 0) {
      return null;
    }

    return this.createTemplate(
      `Treino ${muscleGroups.join(" + ")}`,
      selectedExercises.map((ex) => ex.id),
      difficulty
    );
  },

  // Gerar treino com opções avançadas
  generateAdvancedWorkout(
    options: WorkoutGenerationOptions
  ): WorkoutTemplate | null {
    let availableExercises = allExercises;

    // Filtrar por grupos musculares
    if (options.muscle_groups.length > 0) {
      availableExercises = availableExercises.filter((ex) =>
        options.muscle_groups.includes(ex.muscle_group as MuscleGroup)
      );
    }

    // Filtrar por dificuldade
    availableExercises = availableExercises.filter(
      (ex) => ex.difficulty === options.difficulty
    );

    // Filtrar por equipamento disponível
    if (options.equipment_available && options.equipment_available.length > 0) {
      availableExercises = availableExercises.filter((ex) =>
        options.equipment_available!.some((equipment) =>
          ex.equipment?.toLowerCase().includes(equipment.toLowerCase())
        )
      );
    }

    if (availableExercises.length === 0) {
      return null;
    }

    // Selecionar exercícios aleatórios
    const selectedExercises = availableExercises
      .sort(() => 0.5 - Math.random())
      .slice(0, options.exercise_count);

    return this.createTemplate(
      `Treino Personalizado`,
      selectedExercises.map((ex) => ex.id),
      options.difficulty
    );
  },

  // Gerar treino para iniciantes (só peso corporal)
  generateBeginnerWorkout(): WorkoutTemplate | null {
    const bodyweightExercises = exerciseDatabase
      .getBodyweightExercises()
      .filter((ex) => ex.difficulty === "beginner");

    if (bodyweightExercises.length === 0) {
      return null;
    }

    const selectedExercises = bodyweightExercises
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    return this.createTemplate(
      "Treino Iniciante - Peso Corporal",
      selectedExercises.map((ex) => ex.id),
      "beginner"
    );
  },

  // Gerar treino full body
  generateFullBodyWorkout(difficulty: DifficultyLevel): WorkoutTemplate | null {
    const allMuscleGroups: MuscleGroup[] = [
      "Peito",
      "Costas",
      "Ombros",
      "Braços",
      "Pernas",
      "Abdômen",
    ];

    const selectedExercises: ExerciseExtended[] = [];

    // Pegar 1 exercício de cada grupo muscular
    for (const group of allMuscleGroups) {
      const groupExercises = exerciseDatabase
        .getByMuscleGroup(group)
        .filter((ex) => ex.difficulty === difficulty);

      if (groupExercises.length > 0) {
        const randomExercise =
          groupExercises[Math.floor(Math.random() * groupExercises.length)];
        selectedExercises.push(randomExercise);
      }
    }

    if (selectedExercises.length === 0) {
      return null;
    }

    return this.createTemplate(
      `Treino Full Body - ${difficulty}`,
      selectedExercises.map((ex) => ex.id),
      difficulty
    );
  },
};

// Service para estatísticas e utilidades
export const workoutStatsService = {
  // Obter estatísticas gerais do database
  getGeneralStats() {
    const total = allExercises.length;
    const byMuscleGroup = exerciseDatabase.getCountByMuscleGroup();
    const byDifficulty = {
      beginner: allExercises.filter((ex) => ex.difficulty === "beginner")
        .length,
      intermediate: allExercises.filter(
        (ex) => ex.difficulty === "intermediate"
      ).length,
      advanced: allExercises.filter((ex) => ex.difficulty === "advanced")
        .length,
    };
    const byEquipment = exerciseDatabase
      .getAvailableEquipment()
      .reduce((acc, equipment) => {
        acc[equipment] = exerciseDatabase.getByEquipment(equipment).length;
        return acc;
      }, {} as { [key: string]: number });

    return {
      total,
      byMuscleGroup,
      byDifficulty,
      byEquipment,
    };
  },

  // Validar se um template de treino é válido
  validateWorkoutTemplate(template: WorkoutTemplate): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!template.name || template.name.trim().length === 0) {
      errors.push("Nome do treino é obrigatório");
    }

    if (!template.exercises || template.exercises.length === 0) {
      errors.push("Treino deve ter pelo menos 1 exercício");
    }

    // Verificar se todos os exercícios existem
    for (const exercise of template.exercises) {
      const existingExercise = exerciseDatabase.getById(exercise.exercise_id);
      if (!existingExercise) {
        errors.push(`Exercício com ID ${exercise.exercise_id} não encontrado`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
