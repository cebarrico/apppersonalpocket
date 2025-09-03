// Exportar todos os tipos
export * from "./types";

// Exportar todos os services
export * from "./services";

// Exportar exercícios por categoria (para uso direto se necessário)
export { default as chestExercises } from "./exercises/chest.json";
export { default as backExercises } from "./exercises/back.json";
export { default as shouldersExercises } from "./exercises/shoulders.json";
export { default as armsExercises } from "./exercises/arms.json";
export { default as legsExercises } from "./exercises/legs.json";
export { default as absExercises } from "./exercises/abs.json";

// Exportar services principais (para facilitar imports)
export {
  exerciseDatabase,
  workoutTemplateService,
  workoutStatsService,
} from "./services";

// Exportar constantes úteis
export { MUSCLE_GROUPS, EQUIPMENT_TYPES, DIFFICULTY_LEVELS } from "./types";
