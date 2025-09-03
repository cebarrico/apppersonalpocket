import { Database } from "./Database";

// Tipos base das tabelas
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type DailyWorkout =
  Database["public"]["Tables"]["daily_workouts"]["Row"];
export type DailyWorkoutInsert =
  Database["public"]["Tables"]["daily_workouts"]["Insert"];
export type DailyWorkoutUpdate =
  Database["public"]["Tables"]["daily_workouts"]["Update"];

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert =
  Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate =
  Database["public"]["Tables"]["appointments"]["Update"];

export type TrainerStudent =
  Database["public"]["Tables"]["trainer_students"]["Row"];
export type TrainerStudentInsert =
  Database["public"]["Tables"]["trainer_students"]["Insert"];
export type TrainerStudentUpdate =
  Database["public"]["Tables"]["trainer_students"]["Update"];

export type StudentTrainerRequest =
  Database["public"]["Tables"]["student_trainer_requests"]["Row"];
export type StudentTrainerRequestInsert =
  Database["public"]["Tables"]["student_trainer_requests"]["Insert"];
export type StudentTrainerRequestUpdate =
  Database["public"]["Tables"]["student_trainer_requests"]["Update"];

// Enums específicos baseados no schema
export type UserRole = "teacher" | "student";
export type UserStatus = "active" | "inactive";
export type Gender = "male" | "female" | "other";
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed";

export type StudentType = "presencial" | "remoto";
export type RequesterRole = "student" | "trainer";
export type RequestStatus = "pending" | "accepted" | "rejected";

// Tipos específicos para campos JSON
export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
}

export interface WorkoutSet {
  set_number: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  notes?: string;
}

export interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimated_duration?: number;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  created_at: string;
  updated_at: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  bicep_left?: number;
  bicep_right?: number;
  thigh_left?: number;
  thigh_right?: number;
  calf_left?: number;
  calf_right?: number;
  forearm_left?: number;
  forearm_right?: number;
  neck?: number;
  shoulder?: number;
  measured_at: string;
  notes?: string;
}

// Tipos tipados para usuários específicos
export interface Student
  extends Omit<
    User,
    "role" | "cref" | "prebuilt_workout" | "body_measurements"
  > {
  role: "student";
  teacher_id: string;
  goal: string;
  height_cm: number;
  weight_kg: number;
  body_fat_percent: number | null;
  prebuilt_workout: Workout | null;
  body_measurements: BodyMeasurements | null;
}

export interface Teacher
  extends Omit<
    User,
    | "role"
    | "teacher_id"
    | "goal"
    | "height_cm"
    | "weight_kg"
    | "body_fat_percent"
    | "prebuilt_workout"
    | "body_measurements"
  > {
  role: "teacher";
  cref: string;
  teacher_id: null;
}

// Tipos tipados para treinos diários
export interface DailyWorkoutTyped extends Omit<DailyWorkout, "workout"> {
  workout: Workout;
}

// Tipos para inserção/atualização com validação
export interface StudentInsert extends Omit<UserInsert, "role"> {
  role: "student";
  teacher_id: string;
  goal: string;
  height_cm: number;
  weight_kg: number;
  body_fat_percent?: number | null;
  prebuilt_workout?: Database["public"]["Tables"]["users"]["Insert"]["prebuilt_workout"];
  body_measurements?: Database["public"]["Tables"]["users"]["Insert"]["body_measurements"];
}

export interface TeacherInsert extends Omit<UserInsert, "role"> {
  role: "teacher";
  cref: string;
  teacher_id?: null;
}

export interface DailyWorkoutInsertTyped
  extends Omit<DailyWorkoutInsert, "workout"> {
  workout: Workout;
}

// Tipos para operações com relacionamentos
export interface UserWithRelations extends User {
  teacher?: Teacher;
  students?: Student[];
  appointments?: Appointment[];
  daily_workouts?: DailyWorkoutTyped[];
}

export interface AppointmentWithRelations extends Appointment {
  student?: Student;
  teacher?: Teacher;
}

export interface DailyWorkoutWithRelations extends DailyWorkoutTyped {
  student?: Student;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Tipos para filtros e busca
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  teacher_id?: string;
  search?: string;
}

export interface AppointmentFilters {
  student_id?: string;
  teacher_id?: string;
  status?: AppointmentStatus;
  date_from?: string;
  date_to?: string;
}

export interface DailyWorkoutFilters {
  student_id?: string;
  date_from?: string;
  date_to?: string;
}

// Tipos para autenticação
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata: {
    role?: UserRole;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  cpf: string;
  phone: string;
  // Campos específicos do professor
  cref?: string;
  // Campos específicos do aluno
  teacher_id?: string;
  goal?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_percent?: number;
  gender?: Gender;
  birth_date: string;
}

export interface ProfileUpdateForm {
  full_name?: string;
  cpf?: string;
  phone?: string;
  avatar_url?: string;
  // Campos específicos do aluno
  goal?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_percent?: number;
  gender?: Gender;
  birth_date?: string;
}

// Tipos para dashboard
export interface DashboardStats {
  total_students?: number;
  total_appointments?: number;
  upcoming_appointments?: number;
  completed_workouts_this_week?: number;
  pending_assessments?: number;
}

export interface StudentDashboardStats {
  completed_workouts_this_week: number;
  upcoming_appointments: number;
  last_assessment?: string;
  current_weight?: number;
  weight_change?: number;
}

// Tipos para notificações
export interface NotificationData {
  id: string;
  type:
    | "appointment_reminder"
    | "workout_assigned"
    | "assessment_due"
    | "general";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id: string;
}

export type { Database as default };
