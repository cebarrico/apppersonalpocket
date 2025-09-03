# Supabase Client - Pocket Trainer Hub

Este pacote contém o cliente Supabase tipado e todos os tipos TypeScript necessários para o projeto Pocket Trainer Hub.

## Estrutura

- `Database.ts` - Tipos gerados automaticamente do Supabase
- `types.ts` - Tipos específicos do domínio da aplicação
- `services.ts` - Utilitários para operações comuns no banco
- `index.ts` - Ponto de entrada principal

## Uso

### Importar o cliente Supabase

```typescript
import { supabase } from "@pocket-trainer-hub/supabase-client";
```

### Importar tipos

```typescript
import type {
  User,
  Student,
  Teacher,
  Appointment,
  DailyWorkout,
  UserRole,
  AppointmentStatus,
} from "@pocket-trainer-hub/supabase-client";
```

### Usar os services

```typescript
import {
  userService,
  appointmentService,
  dailyWorkoutService,
  authService,
} from "@pocket-trainer-hub/supabase-client";

// Exemplo: Buscar estudantes de um professor
const { data: students, error } = await userService.getStudentsByTeacher(
  teacherId
);

// Exemplo: Criar um agendamento
const { data: appointment, error } = await appointmentService.create({
  student_id: "uuid-here",
  teacher_id: "uuid-here",
  date: "2024-01-15",
  time: "10:00",
  notes: "Avaliação física",
});

// Exemplo: Login
const { data: session, error } = await authService.signIn(email, password);
```

## Tipos Principais

### User

Tipo base para todos os usuários do sistema.

### Student

Usuário com role 'student', inclui campos específicos como:

- `teacher_id` (obrigatório)
- `goal` (obrigatório)
- `height_cm` (obrigatório)
- `weight_kg` (obrigatório)
- `body_fat_percent` (opcional)
- `prebuilt_workout` (opcional)
- `body_measurements` (opcional)

### Teacher

Usuário com role 'teacher', inclui campos específicos como:

- `cref` (obrigatório)

### Appointment

Agendamento entre professor e aluno, com campos:

- `student_id` (opcional)
- `teacher_id` (opcional)
- `date` (obrigatório)
- `time` (opcional)
- `status` (opcional, padrão: 'scheduled')
- `notes` (opcional)

### DailyWorkout

Treino diário de um aluno, com campos:

- `student_id` (opcional)
- `date` (obrigatório)
- `workout` (obrigatório, tipo JSON)
- `notes` (opcional)

## Enums

### UserRole

- `'teacher'`
- `'student'`

### UserStatus

- `'active'`
- `'inactive'`

### AppointmentStatus

- `'scheduled'`
- `'confirmed'`
- `'cancelled'`
- `'completed'`

### Gender

- `'male'`
- `'female'`
- `'other'`

## Tipos JSON Estruturados

### Workout

```typescript
interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimated_duration?: number;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  created_at: string;
  updated_at: string;
}
```

### BodyMeasurements

```typescript
interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  bicep_left?: number;
  bicep_right?: number;
  // ... outros campos
  measured_at: string;
  notes?: string;
}
```

## Services Disponíveis

### userService

- `getById(id: string)` - Buscar usuário por ID
- `getAll(filters?: UserFilters)` - Buscar usuários com filtros
- `create(userData: UserInsert)` - Criar usuário
- `update(id: string, userData: UserUpdate)` - Atualizar usuário
- `getStudentsByTeacher(teacherId: string)` - Buscar estudantes de um professor
- `getTeachers()` - Buscar todos os professores

### appointmentService

- `getAll(filters?: AppointmentFilters)` - Buscar agendamentos com filtros
- `create(appointmentData: AppointmentInsert)` - Criar agendamento
- `update(id: string, appointmentData: AppointmentUpdate)` - Atualizar agendamento
- `getToday(teacherId?: string)` - Buscar agendamentos do dia atual

### dailyWorkoutService

- `getAll(filters?: DailyWorkoutFilters)` - Buscar treinos com filtros
- `create(workoutData: DailyWorkoutInsert)` - Criar treino diário
- `update(id: string, workoutData: DailyWorkoutUpdate)` - Atualizar treino diário
- `getWeeklyByStudent(studentId: string)` - Buscar treinos da semana para um estudante

### authService

- `signIn(email: string, password: string)` - Login
- `signOut()` - Logout
- `signUp(email: string, password: string, userData: UserInsert)` - Registrar usuário
- `getCurrentUser()` - Obter usuário atual

### validationService

- `isValidCPF(cpf: string)` - Validar CPF
- `isValidEmail(email: string)` - Validar email
- `isValidPhone(phone: string)` - Validar telefone
- `isValidCREF(cref: string)` - Validar CREF

## Padrão de Resposta

Todos os services retornam uma resposta no formato:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
```

## Exemplo de Uso Completo

```typescript
import {
  supabase,
  userService,
  authService,
  validationService,
  type Student,
  type Teacher,
  type UserRole,
} from "@pocket-trainer-hub/supabase-client";

// Função para registrar um novo estudante
async function registerStudent(formData: {
  email: string;
  password: string;
  full_name: string;
  cpf: string;
  phone: string;
  teacher_id: string;
  goal: string;
  height_cm: number;
  weight_kg: number;
}) {
  // Validar dados
  if (!validationService.isValidEmail(formData.email)) {
    return { error: "Email inválido" };
  }

  if (!validationService.isValidCPF(formData.cpf)) {
    return { error: "CPF inválido" };
  }

  // Registrar usuário
  const { data, error } = await authService.signUp(
    formData.email,
    formData.password,
    {
      id: "", // Será preenchido pelo Supabase
      full_name: formData.full_name,
      cpf: formData.cpf,
      phone: formData.phone,
      role: "student",
      teacher_id: formData.teacher_id,
      goal: formData.goal,
      height_cm: formData.height_cm,
      weight_kg: formData.weight_kg,
    }
  );

  if (error) {
    return { error };
  }

  return { data };
}

// Função para buscar estudantes de um professor
async function getMyStudents(teacherId: string) {
  const { data: students, error } = await userService.getStudentsByTeacher(
    teacherId
  );

  if (error) {
    console.error("Erro ao buscar estudantes:", error);
    return [];
  }

  return students || [];
}
```

## Atualização dos Tipos

Para atualizar os tipos quando o schema do banco for alterado:

1. Execute o comando de geração de tipos do Supabase CLI
2. Substitua o conteúdo do arquivo `Database.ts`
3. Atualize os tipos específicos em `types.ts` conforme necessário
4. Teste os services para garantir compatibilidade

## Configuração do Projeto

Certifique-se de que o `tsconfig.json` do seu projeto inclua:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```
