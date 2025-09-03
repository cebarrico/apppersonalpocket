# Database Workout - Pocket Trainer Hub

Database mockado de exercícios e templates de treino para o Pocket Trainer Hub.

## 📁 Estrutura

```
packages/database/workout/
├── exercises/          # Exercícios organizados por grupo muscular
│   ├── chest.json     # Exercícios de peito
│   ├── back.json      # Exercícios de costas
│   ├── shoulders.json # Exercícios de ombros
│   ├── arms.json      # Exercícios de braços
│   ├── legs.json      # Exercícios de pernas
│   └── abs.json       # Exercícios de abdômen
├── types.ts           # Tipos TypeScript
├── services.ts        # Serviços para manipular dados
├── index.ts           # Ponto de entrada
└── README.md          # Documentação
```

## 🚀 Instalação

```bash
# Na raiz do projeto
npm install
```

## 📖 Uso Básico

### Importar exercícios

```typescript
import { exerciseDatabase } from "@pocket-trainer-hub/database-workout";

// Buscar todos os exercícios
const allExercises = exerciseDatabase.getAll();

// Buscar exercícios de peito
const chestExercises = exerciseDatabase.getByMuscleGroup("chest");

// Buscar exercícios para iniciantes
const beginnerExercises = exerciseDatabase.getByDifficulty("beginner");

// Buscar exercícios por equipamento
const bodyweightExercises = exerciseDatabase.getByEquipment("Peso corporal");
```

### Criar templates de treino

```typescript
import { workoutTemplateService } from "@pocket-trainer-hub/database-workout";

// Gerar treino automático
const workout = workoutTemplateService.generateWorkout(
  ["chest", "arms"],
  "intermediate",
  4
);

// Criar template personalizado
const customTemplate = workoutTemplateService.createTemplate(
  "Meu Treino de Peito",
  ["chest-001", "chest-002", "chest-003"],
  "intermediate"
);

// Gerar treino full body
const fullBodyWorkout =
  workoutTemplateService.generateFullBodyWorkout("beginner");
```

## 🎯 Grupos Musculares

- `chest` - Peito
- `back` - Costas
- `shoulders` - Ombros
- `arms` - Braços (bíceps + tríceps)
- `legs` - Pernas
- `abs` - Abdômen

## 📊 Níveis de Dificuldade

- `beginner` - Iniciante
- `intermediate` - Intermediário
- `advanced` - Avançado

## 🛠️ Equipamentos Disponíveis

- Peso corporal
- Halteres
- Barra
- Máquina
- Cabo
- Kettlebell
- Elástico

## 🔧 API Completa

### exerciseDatabase

```typescript
// Métodos principais
exerciseDatabase.getAll(); // Todos os exercícios
exerciseDatabase.getById(id); // Exercício específico
exerciseDatabase.getByMuscleGroup(group); // Por grupo muscular
exerciseDatabase.getByDifficulty(difficulty); // Por dificuldade
exerciseDatabase.getByEquipment(equipment); // Por equipamento
exerciseDatabase.getByFilters(filters); // Com filtros customizados
exerciseDatabase.getRandomExercises(count, filters); // Exercícios aleatórios

// Métodos utilitários
exerciseDatabase.getAvailableMuscleGroups(); // Grupos disponíveis
exerciseDatabase.getAvailableEquipment(); // Equipamentos disponíveis
exerciseDatabase.getBodyweightExercises(); // Só peso corporal
exerciseDatabase.getCountByMuscleGroup(); // Contagem por grupo
```

### workoutTemplateService

```typescript
// Criação de templates
workoutTemplateService.createTemplate(name, exerciseIds, difficulty);
workoutTemplateService.generateWorkout(muscleGroups, difficulty, count);
workoutTemplateService.generateAdvancedWorkout(options);
workoutTemplateService.generateBeginnerWorkout();
workoutTemplateService.generateFullBodyWorkout(difficulty);
```

### workoutStatsService

```typescript
// Estatísticas e validação
workoutStatsService.getGeneralStats(); // Estatísticas gerais
workoutStatsService.validateWorkoutTemplate(template); // Validar template
```

## 💡 Exemplos Práticos

### Exemplo 1: Seletor de Exercícios

```typescript
import {
  exerciseDatabase,
  MUSCLE_GROUPS,
} from "@pocket-trainer-hub/database-workout";

const ExerciseSelector = () => {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("chest");
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const exercisesList =
      exerciseDatabase.getByMuscleGroup(selectedMuscleGroup);
    setExercises(exercisesList);
  }, [selectedMuscleGroup]);

  return (
    <div>
      <select onChange={(e) => setSelectedMuscleGroup(e.target.value)}>
        {MUSCLE_GROUPS.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      {exercises.map((exercise) => (
        <div key={exercise.id}>
          <h3>{exercise.name}</h3>
          <p>{exercise.instructions}</p>
          <span>Dificuldade: {exercise.difficulty}</span>
        </div>
      ))}
    </div>
  );
};
```

### Exemplo 2: Gerador de Treino

```typescript
import { workoutTemplateService } from "@pocket-trainer-hub/database-workout";

const WorkoutGenerator = () => {
  const [workout, setWorkout] = useState(null);

  const generateWorkout = () => {
    const newWorkout = workoutTemplateService.generateWorkout(
      ["chest", "arms"],
      "intermediate",
      4
    );
    setWorkout(newWorkout);
  };

  return (
    <div>
      <button onClick={generateWorkout}>Gerar Treino</button>

      {workout && (
        <div>
          <h2>{workout.name}</h2>
          <p>{workout.description}</p>
          <p>Duração estimada: {workout.duration_minutes} minutos</p>

          {workout.exercises.map((exercise) => (
            <div key={exercise.exercise_id}>
              <h4>{exerciseDatabase.getById(exercise.exercise_id)?.name}</h4>
              <p>
                {exercise.sets} séries × {exercise.reps} repetições
              </p>
              <p>Descanso: {exercise.rest_seconds}s</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Exemplo 3: Integração com daily_workouts

```typescript
import { workoutTemplateService } from "@pocket-trainer-hub/database-workout";
import { dailyWorkoutService } from "@pocket-trainer-hub/supabase-client";

const createWorkoutForStudent = async (studentId: string, date: string) => {
  // Gerar template de treino
  const template = workoutTemplateService.generateWorkout(
    ["chest", "arms"],
    "intermediate",
    4
  );

  if (!template) {
    throw new Error("Não foi possível gerar o treino");
  }

  // Converter template para formato do daily_workout
  const workoutData = {
    id: template.id,
    name: template.name,
    description: template.description,
    exercises: template.exercises.map((ex) => {
      const exercise = exerciseDatabase.getById(ex.exercise_id);
      return {
        exercise: {
          id: exercise.id,
          name: exercise.name,
          muscle_group: exercise.muscle_group,
          equipment: exercise.equipment,
          instructions: exercise.instructions,
          video_url: exercise.video_url,
          image_url: exercise.image_url,
        },
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          set_number: i + 1,
          reps: parseInt(ex.reps.split("-")[0]), // Pega o primeiro número
          weight: 0, // Será preenchido pelo usuário
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

  // Salvar no banco
  await dailyWorkoutService.create({
    student_id: studentId,
    date: date,
    workout: workoutData,
    notes: `Treino gerado automaticamente - ${template.name}`,
  });
};
```

## 🔄 Expandindo o Database

### Adicionar novos exercícios

1. Edite o arquivo JSON do grupo muscular correspondente
2. Siga a estrutura existente:

```json
{
  "id": "chest-004",
  "name": "Novo Exercício",
  "muscle_group": "chest",
  "equipment": "Halteres",
  "instructions": "Instruções detalhadas...",
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "difficulty": "intermediate",
  "primary_muscles": ["pectoralis_major"],
  "secondary_muscles": ["anterior_deltoid"],
  "tips": ["Dica 1", "Dica 2"]
}
```

### Adicionar novos grupos musculares

1. Crie um novo arquivo JSON em `exercises/`
2. Adicione o grupo em `MUSCLE_GROUPS` no `types.ts`
3. Importe o JSON no `services.ts`

## 📈 Estatísticas Atuais

Com a estrutura atual, você tem:

- **18 exercícios** no total
- **3 exercícios** por grupo muscular
- **6 grupos musculares**
- **3 níveis de dificuldade**
- **Exercícios para todos os equipamentos**

## 🤝 Contribuindo

Para adicionar novos exercícios ou melhorar a estrutura:

1. Mantenha a consistência nos IDs (`grupo-001`, `grupo-002`, etc.)
2. Inclua sempre instruções detalhadas
3. Adicione pelo menos 2 dicas por exercício
4. Especifique músculos primários e secundários
5. Teste a integração com os services

## 🏗️ Roadmap

- [ ] Adicionar mais exercícios (meta: 10 por grupo)
- [ ] Incluir exercícios com cabo
- [ ] Adicionar exercícios funcionais
- [ ] Criar templates de treino específicos
- [ ] Incluir exercícios de aquecimento
- [ ] Adicionar exercícios de alongamento
