import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Search,
  Plus,
  Clock,
  Dumbbell,
  Target,
  Info,
  X,
  Save,
  Zap,
} from "lucide-react";

// Importar o database de workouts
import {
  exerciseDatabase,
  workoutTemplateService,
} from "../../../../packages/database/workout";

import { useWorkout } from "../hooks/use-workout";

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  dayOfWeek: string;
  selectedDate: string;
  onSave?: () => void; // Callback para notificar quando o treino é salvo
}

// Tipos locais para evitar erros de import
interface ExerciseExtended {
  id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
  instructions?: string;
  video_url?: string;
  image_url?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  primary_muscles: string[];
  secondary_muscles: string[];
  tips: string[];
}

interface SelectedExercise {
  exercise: ExerciseExtended;
  sets: number;
  reps: string;
  weight: number;
  rest_seconds: number;
  notes: string;
  isExisting?: boolean; // Indica se o exercício já existia
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({
  isOpen,
  onClose,
  studentId,
  dayOfWeek,
  selectedDate,
  onSave,
}) => {
  // Hook para gerenciar workouts
  const workoutHook = useWorkout();

  // Estados para filtros
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");

  // Estados para exercícios
  const [availableExercises, setAvailableExercises] = useState<
    ExerciseExtended[]
  >([]);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExercise[]
  >([]);
  const [activeTab, setActiveTab] = useState("select");

  // Estado para carregamento (usando do hook quando disponível)
  const [isLoading, setIsLoading] = useState(false);

  // Referência para controlar se os exercícios foram carregados
  const loadedDateRef = useRef<string | null>(null);

  // Carregar exercícios disponíveis
  useEffect(() => {
    const loadExercises = () => {
      try {
        let exercises = exerciseDatabase.getAll();

        // Aplicar filtros
        if (selectedMuscleGroup !== "all") {
          exercises = exercises.filter(
            (ex) => ex.muscle_group === selectedMuscleGroup
          );
        }

        if (selectedDifficulty !== "all") {
          exercises = exercises.filter(
            (ex) => ex.difficulty === selectedDifficulty
          );
        }

        if (selectedEquipment !== "all") {
          exercises = exercises.filter((ex) =>
            ex.equipment
              ?.toLowerCase()
              .includes(selectedEquipment.toLowerCase())
          );
        }

        if (searchTerm) {
          exercises = exercises.filter(
            (ex) =>
              ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setAvailableExercises(exercises);
      } catch (error) {
        console.error("Erro ao carregar exercícios:", error);
        setAvailableExercises([]);
      }
    };

    loadExercises();
  }, [selectedMuscleGroup, selectedDifficulty, selectedEquipment, searchTerm]);

  // Função para adicionar exercício
  const addExercise = (exercise: ExerciseExtended) => {
    const newSelectedExercise: SelectedExercise = {
      exercise,
      sets: 3,
      reps: "8-12",
      weight: 0,
      rest_seconds: 90,
      notes: "",
      isExisting: false, // Marca como novo exercício
    };

    setSelectedExercises((prev) => [...prev, newSelectedExercise]);
    setActiveTab("configure");
  };

  // Função para remover exercício
  const removeExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Função para atualizar exercício
  const updateExercise = (
    index: number,
    field: keyof SelectedExercise,
    value: string | number
  ) => {
    setSelectedExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    );
  };

  // Função para gerar treino automático
  const generateAutomaticWorkout = () => {
    try {
      const muscleGroups: (
        | "Peito"
        | "Costas"
        | "Pernas"
        | "Ombros"
        | "Braços"
        | "Abdômen"
      )[] =
        selectedMuscleGroup !== "all"
          ? [
              selectedMuscleGroup as
                | "Peito"
                | "Costas"
                | "Pernas"
                | "Ombros"
                | "Braços"
                | "Abdômen",
            ]
          : ["Peito", "Costas", "Pernas"];
      const difficulty: "beginner" | "intermediate" | "advanced" =
        selectedDifficulty !== "all"
          ? (selectedDifficulty as "beginner" | "intermediate" | "advanced")
          : "intermediate";

      const template = workoutTemplateService.generateWorkout(
        muscleGroups,
        difficulty,
        4
      );

      if (template) {
        const exercises = template.exercises
          .map((ex) => {
            const exercise = exerciseDatabase.getById(ex.exercise_id);
            if (exercise) {
              return {
                exercise,
                sets: ex.sets,
                reps: ex.reps,
                weight: 0,
                rest_seconds: ex.rest_seconds,
                notes: ex.notes || "",
                isExisting: false, // Treino automático sempre cria exercícios novos
              };
            }
            return null;
          })
          .filter(Boolean) as SelectedExercise[];

        setSelectedExercises(exercises);
        setActiveTab("configure");
        console.log("Treino automático gerado!");
      }
    } catch (error) {
      console.error("Erro ao gerar treino automático:", error);
    }
  };

  // Função para salvar treino usando o hook
  const saveWorkout = async () => {
    if (selectedExercises.length === 0) {
      alert("Selecione pelo menos um exercício");
      return;
    }

    setIsLoading(true);

    try {
      // Usar a função do hook para adicionar treino ao dia
      const result = await workoutHook.addWorkoutToDay(
        studentId,
        selectedDate,
        dayOfWeek,
        selectedExercises,
        selectedDifficulty
      );

      if (result.error) {
        console.error("Erro ao salvar treino:", result.error);
        alert(`Erro ao salvar treino: ${result.error}`);
        return;
      }

      console.log("✅ Treino salvo com sucesso!");

      // Notificar o parent que o treino foi salvo
      if (onSave) {
        console.log("🔔 Chamando callback onSave...");
        onSave();
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      alert("Erro ao salvar treino");
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar exercícios existentes quando modal abrir
  useEffect(() => {
    let isMounted = true;

    const loadExistingWorkouts = async () => {
      try {
        const existingWorkouts = await workoutHook.getWorkoutsByDayQuiet(
          studentId,
          selectedDate
        );

        // Verificar se o componente ainda está montado
        if (!isMounted) return;

        if (existingWorkouts.length > 0) {
          const workoutData =
            typeof existingWorkouts[0].workout === "string"
              ? JSON.parse(existingWorkouts[0].workout)
              : existingWorkouts[0].workout;

          if (workoutData.exercises && isMounted) {
            const loadedExercises: SelectedExercise[] =
              workoutData.exercises.map(
                (ex: {
                  exercise: ExerciseExtended;
                  sets?: {
                    reps: number;
                    weight: number;
                    rest_time: number;
                  }[];
                  notes?: string;
                }) => ({
                  exercise: ex.exercise,
                  sets: ex.sets?.length || 3,
                  reps: ex.sets?.[0]?.reps ? `${ex.sets[0].reps}` : "10-12",
                  weight: ex.sets?.[0]?.weight || 0,
                  rest_seconds: ex.sets?.[0]?.rest_time || 60,
                  notes: ex.notes || "",
                  isExisting: true, // Marca como exercício existente
                })
              );

            setSelectedExercises(loadedExercises);
          }
        }

        // Marcar como carregado para esta data
        if (isMounted) {
          loadedDateRef.current = selectedDate;
        }
      } catch (error) {
        console.error("Erro ao carregar exercícios existentes:", error);
      }
    };

    // Só carregar se o modal estiver aberto e ainda não foi carregado para esta data
    if (
      isOpen &&
      studentId &&
      selectedDate &&
      loadedDateRef.current !== selectedDate
    ) {
      loadExistingWorkouts();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isOpen, studentId, selectedDate]); // Removido workoutHook das dependências

  // Reset quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setSelectedExercises([]);
      setActiveTab("select");
      setSearchTerm("");
      setSelectedMuscleGroup("all");
      setSelectedDifficulty("all");
      setSelectedEquipment("all");
      // Reset da referência de carregamento
      loadedDateRef.current = null;
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] sm:h-[85vh] w-[95vw] sm:w-auto bg-dark-teal border-aqua overflow-hidden flex flex-col mx-2 sm:mx-6 p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-ice-white text-xl">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-aqua" />
              <span>Criar Treino - {dayOfWeek}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 min-h-0 flex flex-col space-y-3 px-6 pb-0"
        >
          <TabsList className="bg-medium-blue-gray border-light-gray flex-shrink-0">
            <TabsTrigger
              value="select"
              className="data-[state=active]:bg-aqua data-[state=active]:text-dark-teal"
            >
              <Search className="h-4 w-4 mr-2" />
              Selecionar Exercícios
            </TabsTrigger>
            <TabsTrigger
              value="configure"
              className="data-[state=active]:bg-aqua data-[state=active]:text-dark-teal"
            >
              <Target className="h-4 w-4 mr-2" />
              Configurar ({selectedExercises.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="select"
            className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden"
          >
            {/* Filtros Responsivos */}
            <div className="bg-light-gray/50 border border-light-gray rounded-lg p-2 space-y-2 flex-shrink-0">
              {/* Mobile: 3 linhas | Desktop: 2 linhas */}
              <div className="space-y-2">
                {/* Linha 1: Busca (Mobile) | Busca + Filtros (Desktop) */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Busca */}
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-light-gray-text text-xs">
                      Buscar
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-light-gray-text" />
                      <Input
                        placeholder="Nome do exercício..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Filtros (visíveis apenas em telas maiores) */}
                  <div className="hidden sm:flex gap-2">
                    {/* Grupo Muscular */}
                    <div className="min-w-[120px]">
                      <Label className="text-light-gray-text text-xs">
                        Grupo Muscular
                      </Label>
                      <Select
                        value={selectedMuscleGroup}
                        onValueChange={setSelectedMuscleGroup}
                      >
                        <SelectTrigger className="h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-medium-blue-gray border-light-gray">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Peito">Peito</SelectItem>
                          <SelectItem value="Costas">Costas</SelectItem>
                          <SelectItem value="Ombros">Ombros</SelectItem>
                          <SelectItem value="Braços">Braços</SelectItem>
                          <SelectItem value="Pernas">Pernas</SelectItem>
                          <SelectItem value="Abdômen">Abdômen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dificuldade */}
                    <div className="min-w-[100px]">
                      <Label className="text-light-gray-text text-xs">
                        Dificuldade
                      </Label>
                      <Select
                        value={selectedDifficulty}
                        onValueChange={setSelectedDifficulty}
                      >
                        <SelectTrigger className="h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm">
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent className="bg-medium-blue-gray border-light-gray">
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="beginner">Iniciante</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediário
                          </SelectItem>
                          <SelectItem value="advanced">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Equipamento */}
                    <div className="min-w-[100px]">
                      <Label className="text-light-gray-text text-xs">
                        Equipamento
                      </Label>
                      <Select
                        value={selectedEquipment}
                        onValueChange={setSelectedEquipment}
                      >
                        <SelectTrigger className="h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-medium-blue-gray border-light-gray">
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Peso corporal">
                            Peso corporal
                          </SelectItem>
                          <SelectItem value="Halteres">Halteres</SelectItem>
                          <SelectItem value="Barra">Barra</SelectItem>
                          <SelectItem value="Máquina">Máquina</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Linha 2: Filtros (Mobile apenas) */}
                <div className="sm:hidden flex gap-2">
                  {/* Grupo Muscular */}
                  <div className="flex-1 min-w-[100px]">
                    <Label className="text-light-gray-text text-xs">
                      Grupo
                    </Label>
                    <Select
                      value={selectedMuscleGroup}
                      onValueChange={setSelectedMuscleGroup}
                    >
                      <SelectTrigger className="h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent className="bg-medium-blue-gray border-light-gray">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Peito">Peito</SelectItem>
                        <SelectItem value="Costas">Costas</SelectItem>
                        <SelectItem value="Ombros">Ombros</SelectItem>
                        <SelectItem value="Braços">Braços</SelectItem>
                        <SelectItem value="Pernas">Pernas</SelectItem>
                        <SelectItem value="Abdômen">Abdômen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dificuldade */}
                  <div className="flex-1 min-w-[90px]">
                    <Label className="text-light-gray-text text-xs">
                      Dificuldade
                    </Label>
                    <Select
                      value={selectedDifficulty}
                      onValueChange={setSelectedDifficulty}
                    >
                      <SelectTrigger className="h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent className="bg-medium-blue-gray border-light-gray">
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediário
                        </SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Equipamento */}
                  <div className="flex-1 min-w-[90px]">
                    <Label className="text-light-gray-text text-xs">
                      Equipamento
                    </Label>
                    <Select
                      value={selectedEquipment}
                      onValueChange={setSelectedEquipment}
                    >
                      <SelectTrigger className="h-7 bg-medium-blue-gray border-light-gray text-ice-white text-sm">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent className="bg-medium-blue-gray border-light-gray">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Peso corporal">
                          Peso corporal
                        </SelectItem>
                        <SelectItem value="Halteres">Halteres</SelectItem>
                        <SelectItem value="Barra">Barra</SelectItem>
                        <SelectItem value="Máquina">Máquina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Linha 3: Botão de treino automático */}
                <div className="flex justify-center">
                  <Button
                    onClick={generateAutomaticWorkout}
                    size="sm"
                    className="bg-aqua text-dark-teal hover:bg-aqua-dark"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Gerar Treino Automático
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de exercícios */}
            <div className="flex-1 min-h-1 overflow-auto">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border border-light-gray/20 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 ">
                  {availableExercises.map((exercise) => (
                    <Card
                      key={exercise.id}
                      className="bg-light-gray border-light-gray hover:border-aqua transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-ice-white font-medium">
                              {exercise.name}
                            </h3>
                            <p className="text-light-gray-text text-sm">
                              {exercise.muscle_group}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addExercise(exercise)}
                            className="bg-aqua text-dark-teal hover:bg-aqua-dark"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {exercise.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {exercise.equipment}
                          </Badge>
                        </div>

                        <p className="text-light-gray-text text-sm line-clamp-2">
                          {exercise.instructions}
                        </p>

                        {exercise.tips && exercise.tips.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-1 text-aqua text-xs">
                              <Info className="h-3 w-3" />
                              <span>{exercise.tips[0]}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="configure"
            className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden"
          >
            {selectedExercises.length === 0 ? (
              <Card className="bg-light-gray border-light-gray">
                <CardContent className="p-8 text-center">
                  <Dumbbell className="h-12 w-12 text-light-gray-text mx-auto mb-4" />
                  <p className="text-light-gray-text">
                    Nenhum exercício selecionado ainda
                  </p>
                  <Button
                    onClick={() => setActiveTab("select")}
                    className="mt-4 bg-aqua text-dark-teal hover:bg-aqua-dark"
                  >
                    Selecionar Exercícios
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <div className="mb-3 p-3 bg-light-gray/10 rounded-lg flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <p className="text-ice-white text-sm font-medium">
                        Total: {selectedExercises.length} exercícios
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                        >
                          {
                            selectedExercises.filter((ex) => ex.isExisting)
                              .length
                          }{" "}
                          Existentes
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-500/20 text-green-400 border-green-400/30"
                        >
                          {
                            selectedExercises.filter(
                              (ex) => ex.isExisting === false
                            ).length
                          }{" "}
                          Novos
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border border-light-gray/20 rounded-lg">
                  <div className="space-y-3 p-4">
                    {selectedExercises.map((selectedEx, index) => (
                      <Card
                        key={index}
                        className="bg-light-gray border-light-gray"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <CardTitle className="text-ice-white text-sm">
                                  {selectedEx.exercise.name}
                                </CardTitle>
                                {selectedEx.isExisting && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                                  >
                                    Existente
                                  </Badge>
                                )}
                                {selectedEx.isExisting === false && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs bg-green-500/20 text-green-400 border-green-400/30"
                                  >
                                    Novo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-light-gray-text text-xs">
                                {selectedEx.exercise.muscle_group} -{" "}
                                {selectedEx.exercise.equipment}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeExercise(index)}
                              className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-2">
                              <Label className="text-light-gray-text text-xs">
                                Séries
                              </Label>
                              <Input
                                type="number"
                                value={selectedEx.sets}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "sets",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="h-8 bg-medium-blue-gray border-light-gray text-ice-white text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-light-gray-text text-xs">
                                Repetições
                              </Label>
                              <Input
                                value={selectedEx.reps}
                                onChange={(e) =>
                                  updateExercise(index, "reps", e.target.value)
                                }
                                placeholder="8-12"
                                className="h-8 bg-medium-blue-gray border-light-gray text-ice-white text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-light-gray-text text-xs">
                                Peso (kg)
                              </Label>
                              <Input
                                type="number"
                                value={selectedEx.weight}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "weight",
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="h-8 bg-medium-blue-gray border-light-gray text-ice-white text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-light-gray-text text-xs">
                                Descanso (s)
                              </Label>
                              <Input
                                type="number"
                                value={selectedEx.rest_seconds}
                                onChange={(e) =>
                                  updateExercise(
                                    index,
                                    "rest_seconds",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="h-8 bg-medium-blue-gray border-light-gray text-ice-white text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label className="text-light-gray-text text-xs">
                              Observações
                            </Label>
                            <Input
                              value={selectedEx.notes}
                              onChange={(e) =>
                                updateExercise(index, "notes", e.target.value)
                              }
                              placeholder="Observações adicionais..."
                              className="mt-1 h-8 bg-medium-blue-gray border-light-gray text-ice-white text-sm"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-6 pt-4 border-t border-light-gray/20 flex-shrink-0">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2 text-light-gray-text text-xs">
              <Clock className="h-3 w-3" />
              <span>Duração estimada: {selectedExercises.length * 10} min</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                size="sm"
                className="border-light-gray text-light-gray-text hover:text-ice-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={saveWorkout}
                disabled={
                  selectedExercises.length === 0 ||
                  isLoading ||
                  workoutHook.isLoading
                }
                size="sm"
                className="bg-aqua text-dark-teal hover:bg-aqua-dark"
              >
                {isLoading || workoutHook.isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-1" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Salvar Treino
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
