import { useState, useEffect } from "react";
import {
  dailyWorkoutService,
  type DailyWorkout,
  type DailyWorkoutInsert,
  type DailyWorkoutUpdate,
} from "@pocket-trainer-hub/supabase-client";

// Estados do hook
interface WorkoutState {
  workouts: DailyWorkout[];
  currentWorkout: DailyWorkout | null;
  isLoading: boolean;
  error: string | null;
}

export const useWorkout = () => {
  const [state, setState] = useState<WorkoutState>({
    workouts: [],
    currentWorkout: null,
    isLoading: false,
    error: null,
  });

  // Função principal: buscar treinos por aluno e dia específico
  const getWorkoutsByDay = async (studentId: string, date: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await dailyWorkoutService.getAll({
        student_id: studentId,
        date_from: date,
        date_to: date, // Buscar apenas do dia específico
      });

      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error,
          isLoading: false,
        }));
        return [];
      }

      const workouts = response.data || [];
      setState((prev) => ({
        ...prev,
        workouts,
        isLoading: false,
      }));

      return workouts;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao buscar treinos";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return [];
    }
  };

  // Função para buscar treinos sem atualizar o estado global (para uso no modal)
  const getWorkoutsByDayQuiet = async (studentId: string, date: string) => {
    try {
      const response = await dailyWorkoutService.getAll({
        student_id: studentId,
        date_from: date,
        date_to: date,
      });

      if (response.error) {
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar treinos:", error);
      return [];
    }
  };

  // Buscar treinos por semana
  const getWorkoutsByWeek = async (studentId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await dailyWorkoutService.getWeeklyByStudent(studentId);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error,
          isLoading: false,
        }));
        return [];
      }

      const workouts = response.data || [];
      setState((prev) => ({
        ...prev,
        workouts,
        isLoading: false,
      }));

      return workouts;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao buscar treinos da semana";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return [];
    }
  };

  // Buscar todos os treinos de um aluno
  const getWorkoutsByStudent = async (studentId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await dailyWorkoutService.getAll({
        student_id: studentId,
      });

      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error,
          isLoading: false,
        }));
        return [];
      }

      const workouts = response.data || [];
      setState((prev) => ({
        ...prev,
        workouts,
        isLoading: false,
      }));

      return workouts;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao buscar treinos do aluno";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return [];
    }
  };

  // Criar novo treino
  const createWorkout = async (workoutData: DailyWorkoutInsert) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await dailyWorkoutService.create(workoutData);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error,
          isLoading: false,
        }));
        return { error: response.error, data: null };
      }

      const newWorkout = response.data!;
      setState((prev) => ({
        ...prev,
        workouts: [...prev.workouts, newWorkout],
        currentWorkout: newWorkout,
        isLoading: false,
      }));

      return { error: null, data: newWorkout };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar treino";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { error: errorMessage, data: null };
    }
  };

  // Interface para exercícios selecionados (vindo do modal)
  interface SelectedExercise {
    exercise: {
      id: string;
      name: string;
      muscle_group: string;
      equipment?: string;
      instructions?: string;
      video_url?: string;
      image_url?: string;
    };
    sets: number;
    reps: string;
    weight: number;
    rest_seconds: number;
    notes: string;
  }

  // Função específica para adicionar exercícios a um dia (usado pelo modal)
  const addWorkoutToDay = async (
    studentId: string,
    date: string,
    dayOfWeek: string,
    selectedExercises: SelectedExercise[],
    difficulty: string = "intermediate"
  ) => {
    if (!studentId || !date || selectedExercises.length === 0) {
      return { error: "Dados inválidos para criar treino", data: null };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Verificar se já existe treino para este dia
      const existingWorkouts = await getWorkoutsByDay(studentId, date);

      // Converter exercícios para formato do banco
      const workoutData = {
        id: `workout-${Date.now()}`,
        name: `Treino ${dayOfWeek}`,
        description: `Treino programado para ${dayOfWeek}`,
        day_of_week: dayOfWeek, // Adicionar o dia da semana
        exercises: selectedExercises.map((selectedEx) => ({
          exercise: {
            id: selectedEx.exercise.id,
            name: selectedEx.exercise.name,
            muscle_group: selectedEx.exercise.muscle_group,
            equipment: selectedEx.exercise.equipment,
            instructions: selectedEx.exercise.instructions,
            video_url: selectedEx.exercise.video_url,
            image_url: selectedEx.exercise.image_url,
          },
          sets: Array.from({ length: selectedEx.sets }, (_, i) => ({
            set_number: i + 1,
            reps: parseInt(selectedEx.reps.split("-")[0]) || 10,
            weight: selectedEx.weight,
            rest_time: selectedEx.rest_seconds,
            notes: selectedEx.notes,
          })),
          notes: selectedEx.notes,
        })),
        estimated_duration: selectedExercises.length * 10,
        difficulty_level: difficulty !== "all" ? difficulty : "intermediate",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Se já existe treino, atualizar; senão, criar novo
      let result;
      if (existingWorkouts.length > 0) {
        // Atualizar o primeiro treino existente
        result = await updateWorkout(existingWorkouts[0].id, {
          workout: JSON.stringify(workoutData), // Converter para JSON string
          notes: `Treino atualizado para ${dayOfWeek}`,
        });
      } else {
        // Criar novo treino
        result = await createWorkout({
          student_id: studentId,
          date: date,
          workout: JSON.stringify(workoutData), // Converter para JSON string
          notes: `Treino criado para ${dayOfWeek}`,
        });
      }

      if (result.error) {
        setState((prev) => ({
          ...prev,
          error: result.error,
          isLoading: false,
        }));
        return { error: result.error, data: null };
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      return { error: null, data: result.data };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao salvar treino";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { error: errorMessage, data: null };
    }
  };

  // Atualizar treino existente
  const updateWorkout = async (id: string, workoutData: DailyWorkoutUpdate) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await dailyWorkoutService.update(id, workoutData);

      if (response.error) {
        setState((prev) => ({
          ...prev,
          error: response.error,
          isLoading: false,
        }));
        return { error: response.error, data: null };
      }

      const updatedWorkout = response.data!;
      setState((prev) => ({
        ...prev,
        workouts: prev.workouts.map((w) => (w.id === id ? updatedWorkout : w)),
        currentWorkout:
          prev.currentWorkout?.id === id ? updatedWorkout : prev.currentWorkout,
        isLoading: false,
      }));

      return { error: null, data: updatedWorkout };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar treino";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { error: errorMessage, data: null };
    }
  };

  // Utilitários de estado
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const setCurrentWorkout = (workout: DailyWorkout | null) => {
    setState((prev) => ({ ...prev, currentWorkout: workout }));
  };

  // Função para formatar data para exibição
  const formatWorkoutDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Função para verificar se há treino em uma data específica
  const hasWorkoutOnDate = (date: string) => {
    return state.workouts.some((workout) => workout.date === date);
  };

  // Função para obter treino de uma data específica
  const getWorkoutByDate = (date: string) => {
    return state.workouts.find((workout) => workout.date === date) || null;
  };

  // Função para agrupar treinos por semana
  const getWorkoutsByWeekGrouped = () => {
    const grouped: { [key: string]: DailyWorkout[] } = {};

    state.workouts.forEach((workout) => {
      const date = new Date(workout.date);
      const startOfWeek = new Date(
        date.setDate(date.getDate() - date.getDay())
      );
      const weekKey = startOfWeek.toISOString().split("T")[0];

      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(workout);
    });

    return grouped;
  };

  return {
    // Estados
    workouts: state.workouts,
    currentWorkout: state.currentWorkout,
    isLoading: state.isLoading,
    error: state.error,

    // Métodos principais
    getWorkoutsByDay,
    getWorkoutsByDayQuiet,
    getWorkoutsByWeek,
    getWorkoutsByStudent,
    createWorkout,
    updateWorkout,
    addWorkoutToDay,

    // Utilitários
    clearError,
    setCurrentWorkout,
    formatWorkoutDate,
    hasWorkoutOnDate,
    getWorkoutByDate,
    getWorkoutsByWeekGrouped,
  };
};

// Hook específico para um aluno
export const useStudentWorkouts = (studentId: string) => {
  const workout = useWorkout();

  useEffect(() => {
    if (studentId) {
      workout.getWorkoutsByStudent(studentId);
    }
  }, [studentId]);

  return workout;
};

// Hook específico para um dia
export const useDayWorkout = (studentId: string, date: string) => {
  const workout = useWorkout();

  useEffect(() => {
    if (studentId && date) {
      workout.getWorkoutsByDay(studentId, date);
    }
  }, [studentId, date]);

  return workout;
};
