// Exemplo de uso do Database Workout
// Este arquivo demonstra como usar as funcionalidades principais

import {
  exerciseDatabase,
  workoutTemplateService,
  workoutStatsService,
  MUSCLE_GROUPS,
  DIFFICULTY_LEVELS,
} from "./index";

// Exemplo 1: Buscar exercícios por grupo muscular
console.log("=== Exercícios de Peito ===");
const chestExercises = exerciseDatabase.getByMuscleGroup("chest");
chestExercises.forEach((exercise) => {
  console.log(
    `${exercise.name} - ${exercise.difficulty} - ${exercise.equipment}`
  );
});

// Exemplo 2: Buscar exercícios por dificuldade
console.log("\n=== Exercícios para Iniciantes ===");
const beginnerExercises = exerciseDatabase.getByDifficulty("beginner");
beginnerExercises.forEach((exercise) => {
  console.log(`${exercise.name} (${exercise.muscle_group})`);
});

// Exemplo 3: Buscar exercícios por equipamento
console.log("\n=== Exercícios com Peso Corporal ===");
const bodyweightExercises = exerciseDatabase.getByEquipment("Peso corporal");
bodyweightExercises.forEach((exercise) => {
  console.log(`${exercise.name} - ${exercise.muscle_group}`);
});

// Exemplo 4: Gerar treino automático
console.log("\n=== Treino Automático ===");
const workout = workoutTemplateService.generateWorkout(
  ["chest", "arms"],
  "intermediate",
  4
);

if (workout) {
  console.log(`Treino: ${workout.name}`);
  console.log(`Descrição: ${workout.description}`);
  console.log(`Duração: ${workout.duration_minutes} minutos`);
  console.log("Exercícios:");

  workout.exercises.forEach((ex) => {
    const exercise = exerciseDatabase.getById(ex.exercise_id);
    console.log(
      `  - ${exercise?.name}: ${ex.sets} séries × ${ex.reps} reps (${ex.rest_seconds}s descanso)`
    );
  });
}

// Exemplo 5: Gerar treino full body
console.log("\n=== Treino Full Body ===");
const fullBodyWorkout =
  workoutTemplateService.generateFullBodyWorkout("beginner");

if (fullBodyWorkout) {
  console.log(`Treino: ${fullBodyWorkout.name}`);
  console.log("Exercícios:");

  fullBodyWorkout.exercises.forEach((ex) => {
    const exercise = exerciseDatabase.getById(ex.exercise_id);
    console.log(`  - ${exercise?.name} (${exercise?.muscle_group})`);
  });
}

// Exemplo 6: Estatísticas do database
console.log("\n=== Estatísticas do Database ===");
const stats = workoutStatsService.getGeneralStats();
console.log(`Total de exercícios: ${stats.total}`);
console.log("Por grupo muscular:");
Object.entries(stats.byMuscleGroup).forEach(([group, count]) => {
  console.log(`  ${group}: ${count} exercícios`);
});
console.log("Por dificuldade:");
Object.entries(stats.byDifficulty).forEach(([difficulty, count]) => {
  console.log(`  ${difficulty}: ${count} exercícios`);
});

// Exemplo 7: Buscar exercícios com filtros
console.log("\n=== Exercícios de Peito para Iniciantes ===");
const filteredExercises = exerciseDatabase.getByFilters({
  muscle_group: "chest",
  difficulty: "beginner",
});
filteredExercises.forEach((exercise) => {
  console.log(`${exercise.name} - ${exercise.equipment}`);
});

// Exemplo 8: Exercícios aleatórios
console.log("\n=== 3 Exercícios Aleatórios ===");
const randomExercises = exerciseDatabase.getRandomExercises(3);
randomExercises.forEach((exercise) => {
  console.log(
    `${exercise.name} (${exercise.muscle_group}) - ${exercise.difficulty}`
  );
});

// Exemplo 9: Criar template personalizado
console.log("\n=== Template Personalizado ===");
const customTemplate = workoutTemplateService.createTemplate(
  "Treino de Peito Personalizado",
  ["chest-001", "chest-002", "chest-003"],
  "intermediate"
);

if (customTemplate) {
  console.log(`Template: ${customTemplate.name}`);
  console.log(`Exercícios: ${customTemplate.exercises.length}`);
  console.log(`Duração estimada: ${customTemplate.duration_minutes} minutos`);
}

// Exemplo 10: Validar template
console.log("\n=== Validação de Template ===");
if (customTemplate) {
  const validation =
    workoutStatsService.validateWorkoutTemplate(customTemplate);
  console.log(`Template válido: ${validation.valid}`);
  if (!validation.valid) {
    console.log("Erros:", validation.errors);
  }
}

// Exemplo 11: Integração com daily_workouts (demonstração)
console.log("\n=== Exemplo de Integração com daily_workouts ===");
const convertTemplateToWorkout = (template: any) => {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    exercises: template.exercises.map((ex: any) => {
      const exercise = exerciseDatabase.getById(ex.exercise_id);
      return {
        exercise: {
          id: exercise?.id,
          name: exercise?.name,
          muscle_group: exercise?.muscle_group,
          equipment: exercise?.equipment,
          instructions: exercise?.instructions,
          video_url: exercise?.video_url,
          image_url: exercise?.image_url,
        },
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          set_number: i + 1,
          reps: parseInt(ex.reps.split("-")[0]) || 10,
          weight: 0,
          rest_time: ex.rest_seconds,
          notes: ex.notes,
        })),
        notes: ex.notes,
      };
    }),
    estimated_duration: template.duration_minutes,
    difficulty_level: template.difficulty,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

if (workout) {
  const workoutForDB = convertTemplateToWorkout(workout);
  console.log("Treino pronto para salvar no daily_workouts:");
  console.log(JSON.stringify(workoutForDB, null, 2));
}

// Para executar este exemplo:
// npx ts-node packages/database/workout/example.ts
