import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Clock,
  Target,
  Coffee,
  Timer,
  Weight,
  MonitorPlay,
  X,
  CircleCheckBig,
} from "lucide-react";

import { useWorkout } from "../hooks/use-workout";
import { Button } from "./ui/button";
import { appointmentService } from "../../../../packages/supabase-client";
import { useToast } from "../hooks/use-toast";

interface StudentWorkoutViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  appointmentDate: string;
  appointmentId: string;
  onStatusUpdate?: () => void;
}

interface WorkoutExercise {
  exercise: {
    id: string;
    name: string;
    muscle_group: string;
    equipment?: string;
    instructions?: string;
  };
  sets: {
    set_number: number;
    reps: number;
    weight: number;
    rest_time: number;
    notes?: string;
  }[];
  notes?: string;
}

interface ParsedWorkout {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  estimated_duration?: number;
  difficulty_level?: string;
}

export const StudentWorkoutViewModal: React.FC<
  StudentWorkoutViewModalProps
> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  appointmentDate,
  appointmentId,
  onStatusUpdate,
}) => {
  const workoutHook = useWorkout();
  const { toast } = useToast();
  const [workouts, setWorkouts] = useState<ParsedWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Buscar treinos do aluno para a data do appointment
  useEffect(() => {
    if (!isOpen || !studentId || !appointmentDate) {
      setWorkouts([]);
      return;
    }

    const fetchWorkouts = async () => {
      setLoading(true);
      setError(null);

      try {
        const rawWorkouts = await workoutHook.getWorkoutsByDayQuiet(
          studentId,
          appointmentDate
        );

        const parsedWorkouts: ParsedWorkout[] = rawWorkouts.map(
          (dailyWorkout) => {
            try {
              const workoutData =
                typeof dailyWorkout.workout === "string"
                  ? JSON.parse(dailyWorkout.workout)
                  : dailyWorkout.workout;

              return {
                id: workoutData.id || `workout-${Date.now()}`,
                name: workoutData.name || "Treino",
                description: workoutData.description,
                exercises: workoutData.exercises || [],
                estimated_duration: workoutData.estimated_duration,
                difficulty_level: workoutData.difficulty_level,
              };
            } catch (parseError) {
              console.error("Erro ao parsear workout:", parseError);
              return {
                id: `error-${Date.now()}`,
                name: "Treino (erro ao carregar)",
                exercises: [],
              };
            }
          }
        );

        setWorkouts(parsedWorkouts);
      } catch (err) {
        setError("Erro ao carregar treinos do aluno");
        console.error("Erro ao buscar treinos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [isOpen, studentId, appointmentDate]);

  // Função para formatar data
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Função para obter cor da dificuldade
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30 hover:text-green-500";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30 hover:text-yellow-500";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30 hover:text-red-500";
      default:
        return "bg-aqua/20 text-aqua border-aqua/50 hover:bg-aqua/30 hover:text-aqua";
    }
  };

  // Função para obter texto da dificuldade
  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "Iniciante";
      case "intermediate":
        return "Intermediário";
      case "advanced":
        return "Avançado";
      default:
        return "Personalizado";
    }
  };

  // Função para agrupar músculos
  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: { [key: string]: string } = {
      Peito:
        "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-500",
      Costas:
        "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-500",
      Ombros:
        "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-500",
      Braços:
        "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-500",
      Pernas:
        "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-500",
      Abdômen:
        "bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 hover:text-pink-500",
    };
    return (
      colors[muscleGroup] ||
      "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 hover:text-gray-500"
    );
  };

  // Função para marcar appointment como concluído
  const dayAppointmentDone = async () => {
    setUpdatingStatus(true);
    try {
      const result = await appointmentService.update(appointmentId, {
        status: "completed",
      });

      if (result.error) {
        toast({
          title: "Erro",
          description: "Não foi possível marcar como concluído",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Treino marcado como concluído!",
          variant: "default",
        });
        onStatusUpdate?.();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Função para cancelar appointment
  const dayAppointmentCancel = async () => {
    setUpdatingStatus(true);
    try {
      const result = await appointmentService.update(appointmentId, {
        status: "cancelled",
      });

      if (result.error) {
        toast({
          title: "Erro",
          description: "Não foi possível cancelar o appointment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Appointment cancelado!",
          variant: "default",
        });
        onStatusUpdate?.();
        onClose();
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-dark-teal to-dark-teal/90 border-light-gray">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <DialogTitle className="text-ice-white text-xl">
                  Treinos de <span className="text-aqua">{studentName}</span>
                </DialogTitle>
                <p className="text-light-gray-text text-sm mt-1">
                  {formatDate(appointmentDate)}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Spinner size="md" className="mx-auto" />
                <p className="text-light-gray-text">Carregando treinos...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <p className="text-red-400 font-medium">
                  Erro ao carregar treinos
                </p>
                <p className="text-light-gray-text text-sm mt-2">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && workouts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-medium-blue-gray/50 rounded-lg p-8">
                <Coffee className="h-12 w-12 text-light-gray-text mx-auto mb-4" />
                <h3 className="text-ice-white font-semibold mb-2">
                  Dia de descanso
                </h3>
                <p className="text-light-gray-text">
                  Nenhum treino programado para este dia.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && workouts.length > 0 && (
            <div className="space-y-6">
              {workouts.map((workout, workoutIndex) => (
                <Card
                  key={workout.id}
                  className="bg-light-gray border-light-gray"
                >
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-ice-white">
                          {workout.name}
                        </CardTitle>
                        {workout.difficulty_level && (
                          <Badge
                            className={getDifficultyColor(
                              workout.difficulty_level
                            )}
                          >
                            {getDifficultyText(workout.difficulty_level)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-light-gray-text text-sm">
                        {workout.estimated_duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{workout.estimated_duration} min</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>{workout.exercises.length} exercícios</span>
                        </div>
                      </div>
                    </div>
                    {workout.description && (
                      <p className="text-light-gray-text text-sm">
                        {workout.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <Card
                        key={`${workoutIndex}-${exerciseIndex}`}
                        className="bg-medium-blue-gray/50 border-light-gray/30"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 w-full justify-between">
                                <h4 className="text-aqua font-medium max-w-[80%]">
                                  {exercise.exercise.name}
                                </h4>
                                <MonitorPlay className="h-6 w-6  text-aqua cursor-pointer" />
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  className={`text-xs ${getMuscleGroupColor(
                                    exercise.exercise.muscle_group
                                  )}`}
                                >
                                  {exercise.exercise.muscle_group}
                                </Badge>
                                {exercise.exercise.equipment && (
                                  <Badge className="bg-gray-500/20 text-gray-400 text-xs hover:bg-gray-500/30 ">
                                    {exercise.exercise.equipment}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Sets */}
                          <div className="space-y-2">
                            <h5 className="text-light-gray-text font-medium text-sm">
                              Séries:
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {exercise.sets.map((set, setIndex) => (
                                <div
                                  key={setIndex}
                                  className="bg-dark-teal/50 rounded-lg p-3 text-sm"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-aqua font-medium">
                                      Série {set.set_number}
                                    </span>
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center space-x-2 text-light-gray-text">
                                      <Target className="h-3 w-3" />
                                      <span>{set.reps} repetições</span>
                                    </div>
                                    {set.weight > 0 && (
                                      <div className="flex items-center space-x-2 text-light-gray-text">
                                        <Weight className="h-3 w-3" />
                                        <span>{set.weight}kg</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-2 text-light-gray-text">
                                      <Timer className="h-3 w-3" />
                                      <span>{set.rest_time}s descanso</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Instruções */}
                          {exercise.exercise.instructions && (
                            <div className="mt-4 p-3 bg-aqua/10 rounded-lg">
                              <h5 className="text-aqua font-medium text-sm mb-2">
                                Instruções:
                              </h5>
                              <p className="text-light-gray-text text-sm">
                                {exercise.exercise.instructions}
                              </p>
                            </div>
                          )}

                          {/* Notas do exercício */}
                          {exercise.notes && (
                            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                              <h5 className="text-yellow-400 font-medium text-sm mb-2">
                                Observações:
                              </h5>
                              <p className="text-light-gray-text text-sm">
                                {exercise.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-around">
                <Button
                  className="bg-aqua text-dark-teal hover:bg-aqua/80 hover:text-dark-teal disabled:opacity-50"
                  onClick={dayAppointmentDone}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <Spinner size="sm" />
                  ) : (
                    <CircleCheckBig className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={dayAppointmentCancel}
                  className="bg-red-500 text-dark-teal hover:bg-red-500/80 hover:text-dark-teal disabled:opacity-50"
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <Spinner size="sm" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
