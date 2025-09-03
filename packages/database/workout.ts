// Este arquivo agora aponta para a nova estrutura de database de workouts
// Localizada em packages/database/workout/

// Re-exportar tudo da nova estrutura
export * from "./workout/index";

// Importações principais para facilitar o uso
export {
  exerciseDatabase,
  workoutTemplateService,
  workoutStatsService,
} from "./workout/services";

export {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  DIFFICULTY_LEVELS,
} from "./workout/types";

// Exemplo de uso rápido
/*
import { exerciseDatabase, workoutTemplateService } from '@pocket-trainer-hub/database-workout';

// Buscar exercícios de peito
const chestExercises = exerciseDatabase.getByMuscleGroup('chest');

// Gerar treino automático
const workout = workoutTemplateService.generateWorkout(['chest', 'arms'], 'intermediate', 4);
*/
