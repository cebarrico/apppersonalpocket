import { supabase } from "./index";
import type {
  User,
  UserInsert,
  UserUpdate,
  Student,
  Teacher,
  StudentInsert,
  TeacherInsert,
  Appointment,
  AppointmentInsert,
  AppointmentUpdate,
  DailyWorkout,
  DailyWorkoutInsert,
  DailyWorkoutUpdate,
  UserFilters,
  AppointmentFilters,
  DailyWorkoutFilters,
  ApiResponse,
  UserRole,
  AppointmentStatus,
} from "./types";

// Utilitários para usuários
export const userService = {
  // Buscar usuário por ID
  async getById(id: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar usuário",
        status: 500,
      };
    }
  },

  // Buscar usuários com filtros
  async getAll(filters: UserFilters = {}): Promise<ApiResponse<User[]>> {
    try {
      let query = supabase.from("users").select("*");

      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.teacher_id) {
        query = query.eq("teacher_id", filters.teacher_id);
      }

      if (filters.search) {
        query = query.ilike("full_name", `%${filters.search}%`);
      }

      const { data, error } = await query;

      return {
        data: data || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar usuários",
        status: 500,
      };
    }
  },

  // Criar usuário
  async create(userData: UserInsert): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert(userData)
        .select()
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 201,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao criar usuário",
        status: 500,
      };
    }
  },

  // Atualizar usuário
  async update(id: string, userData: UserUpdate): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(userData)
        .eq("id", id)
        .select()
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao atualizar usuário",
        status: 500,
      };
    }
  },

  // Buscar estudantes de um professor
  async getStudentsByTeacher(
    teacherId: string
  ): Promise<ApiResponse<Student[]>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("role", "student");

      return {
        data: (data as Student[]) || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar estudantes",
        status: 500,
      };
    }
  },

  // Buscar todos os professores
  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "teacher");

      return {
        data: (data as Teacher[]) || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar professores",
        status: 500,
      };
    }
  },
};

// Utilitários para agendamentos
export const appointmentService = {
  // Buscar agendamentos com filtros
  async getAll(
    filters: AppointmentFilters = {}
  ): Promise<ApiResponse<Appointment[]>> {
    try {
      let query = supabase.from("appointments").select(`
        *,
        student:users!appointments_student_id_fkey(*),
        teacher:users!appointments_teacher_id_fkey(*)
      `);

      if (filters.student_id) {
        query = query.eq("student_id", filters.student_id);
      }

      if (filters.teacher_id) {
        query = query.eq("teacher_id", filters.teacher_id);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.date_from) {
        query = query.gte("date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("date", filters.date_to);
      }

      const { data, error } = await query;

      return {
        data: data || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar agendamentos",
        status: 500,
      };
    }
  },

  // Criar agendamento
  async create(
    appointmentData: AppointmentInsert
  ): Promise<ApiResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointmentData)
        .select()
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 201,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao criar agendamento",
        status: 500,
      };
    }
  },

  // Atualizar agendamento
  async update(
    id: string,
    appointmentData: AppointmentUpdate
  ): Promise<ApiResponse<Appointment>> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update(appointmentData)
        .eq("id", id)
        .select()
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao atualizar agendamento",
        status: 500,
      };
    }
  },

  // Buscar agendamentos do dia atual
  async getToday(teacherId?: string): Promise<ApiResponse<Appointment[]>> {
    try {
      const today = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          student:users!appointments_student_id_fkey(*),
          teacher:users!appointments_teacher_id_fkey(*)
        `
        )
        .eq("date", today);

      if (teacherId) {
        query = query.eq("teacher_id", teacherId);
      }

      const { data, error } = await query;

      return {
        data: data || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar agendamentos de hoje",
        status: 500,
      };
    }
  },
};

// Utilitários para treinos diários
export const dailyWorkoutService = {
  // Buscar treinos com filtros
  async getAll(
    filters: DailyWorkoutFilters = {}
  ): Promise<ApiResponse<DailyWorkout[]>> {
    try {
      let query = supabase.from("daily_workouts").select(`
        *,
        student:users!daily_workouts_student_id_fkey(*)
      `);

      if (filters.student_id) {
        query = query.eq("student_id", filters.student_id);
      }

      if (filters.date_from) {
        query = query.gte("date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("date", filters.date_to);
      }

      const { data, error } = await query;

      return {
        data: data || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar treinos",
        status: 500,
      };
    }
  },

  // Criar treino diário
  async create(
    workoutData: DailyWorkoutInsert
  ): Promise<ApiResponse<DailyWorkout>> {
    try {
      const { data, error } = await supabase
        .from("daily_workouts")
        .insert(workoutData)
        .select()
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 201,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao criar treino",
        status: 500,
      };
    }
  },

  // Atualizar treino diário
  async update(
    id: string,
    workoutData: DailyWorkoutUpdate
  ): Promise<ApiResponse<DailyWorkout>> {
    try {
      const { data, error } = await supabase
        .from("daily_workouts")
        .update(workoutData)
        .eq("id", id)
        .select()
        .single();

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao atualizar treino",
        status: 500,
      };
    }
  },

  // Buscar treinos da semana para um estudante
  async getWeeklyByStudent(
    studentId: string
  ): Promise<ApiResponse<DailyWorkout[]>> {
    try {
      const today = new Date();
      const weekStart = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const weekEnd = new Date(
        today.setDate(today.getDate() - today.getDay() + 6)
      );

      const { data, error } = await supabase
        .from("daily_workouts")
        .select("*")
        .eq("student_id", studentId)
        .gte("date", weekStart.toISOString().split("T")[0])
        .lte("date", weekEnd.toISOString().split("T")[0]);

      return {
        data: data || [],
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado ao buscar treinos da semana",
        status: 500,
      };
    }
  },
};

// Utilitários para autenticação
export const authService = {
  // Login
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return {
        data,
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado no login",
        status: 500,
      };
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      return {
        data: null,
        error: error?.message || null,
        status: error ? 400 : 200,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado no logout",
        status: 500,
      };
    }
  },

  // Registrar usuário
  async signUp(email: string, password: string, userData: UserInsert) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });

      if (authError) {
        return {
          data: null,
          error: authError.message,
          status: 400,
        };
      }

      if (authData.user) {
        // Criar registro na tabela users
        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .insert({
            ...userData,
            id: authData.user.id,
          })
          .select()
          .single();

        if (userError) {
          return {
            data: null,
            error: userError.message,
            status: 400,
          };
        }

        return {
          data: { auth: authData, user: userRecord },
          error: null,
          status: 201,
        };
      }

      return {
        data: authData,
        error: null,
        status: 201,
      };
    } catch (err) {
      return {
        data: null,
        error: "Erro inesperado no registro",
        status: 500,
      };
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      if (process.env.NODE_ENV !== "production") {
        console.log("🔍 authService.getCurrentUser: Iniciando busca...");
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (process.env.NODE_ENV !== "production") {
        console.log("🔍 authService.getCurrentUser: Auth user", {
          user: user ? { id: user.id, email: user.email } : null,
          error: error?.message,
        });
      }

      if (error || !user) {
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "❌ authService.getCurrentUser: Sem usuário autenticado",
            {
              error: error?.message,
            }
          );
        }
        return {
          data: null,
          error: error?.message || "Usuário não encontrado",
          status: 401,
        };
      }

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "🔍 authService.getCurrentUser: Buscando dados na tabela users..."
        );
      }

      // Buscar dados completos do usuário
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (process.env.NODE_ENV !== "production") {
        console.log("🔍 authService.getCurrentUser: Resultado da busca", {
          userData: userData
            ? {
                id: userData.id,
                role: userData.role,
                email: userData.email,
              }
            : null,
          userError: userError?.message,
        });
      }

      if (userError) {
        if (process.env.NODE_ENV !== "production") {
          console.log(
            "❌ authService.getCurrentUser: Erro na consulta da tabela users",
            {
              error: userError.message,
              details: userError.details,
              hint: userError.hint,
              code: userError.code,
            }
          );
        }
      }

      return {
        data: userData,
        error: userError?.message || null,
        status: userError ? 400 : 200,
      };
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("❌ authService.getCurrentUser: Erro inesperado", err);
      }
      return {
        data: null,
        error: "Erro inesperado ao buscar usuário atual",
        status: 500,
      };
    }
  },
};

// Utilitários para validação
export const validationService = {
  // Validar CPF
  isValidCPF(cpf: string): boolean {
    if (!cpf) return false;

    const cleanCPF = cpf.replace(/[^\d]/g, "");

    if (cleanCPF.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }

    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCPF[9]) !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }

    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCPF[10]) === digit2;
  },

  // Validar email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validar telefone
  isValidPhone(phone: string): boolean {
    if (!phone) return false;

    const cleanPhone = phone.replace(/[^\d]/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  },

  // Validar CREF
  isValidCREF(cref: string): boolean {
    if (!cref) return false;

    const cleanCREF = cref.replace(/[^\d]/g, "");
    return cleanCREF.length >= 6 && cleanCREF.length <= 8;
  },
};
