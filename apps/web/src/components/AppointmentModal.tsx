import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Copy, AlertCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/hooks/use-student";
import { useAppointments } from "@/hooks/use-appointments";
import { toast } from "@/hooks/use-toast";
import { AppointmentInsert } from "../../../../packages/supabase-client/types";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReplicatedAppointment {
  date: string;
  time: string;
  weekday: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { student: students, loading: studentsLoading } = useStudent(
    user?.id || ""
  );
  const {
    createAppointment,
    createMultipleAppointments,
    loading,
    error,
    clearError,
  } = useAppointments();

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [studentType, setStudentType] = useState<"presencial" | "remoto">(
    "presencial"
  );
  const [notes, setNotes] = useState<string>("");
  const [shouldReplicate, setShouldReplicate] = useState<boolean>(false);
  const [replicationWeeks, setReplicationWeeks] = useState<number>(1);
  const [sameTimeForAll, setSameTimeForAll] = useState<boolean>(true);
  const [replicateToMultipleDays, setReplicateToMultipleDays] =
    useState<boolean>(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [replicatedAppointments, setReplicatedAppointments] = useState<
    ReplicatedAppointment[]
  >([]);

  // Limpar form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (clearError) {
        clearError();
      }
      setSelectedStudentId("");
      setSelectedDate(null);
      setSelectedTime("");
      setStudentType("presencial");
      setNotes("");
      setShouldReplicate(false);
      setReplicationWeeks(1);
      setSameTimeForAll(true);
      setReplicateToMultipleDays(false);
      setSelectedWeekdays([]);
      setReplicatedAppointments([]);
    }
  }, [isOpen]);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const generateReplicatedAppointments = useCallback(() => {
    if (!selectedDate || !selectedTime) return;

    const appointments: ReplicatedAppointment[] = [];

    // Usar a data selecionada diretamente (já é um objeto Date)
    const startDate = new Date(selectedDate);

    const weekdays = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    if (replicateToMultipleDays && selectedWeekdays.length > 0) {
      // Replicar para múltiplos dias da semana
      const maxWeeks = shouldReplicate ? replicationWeeks : 0;

      for (let week = 0; week <= maxWeeks; week++) {
        for (const weekday of selectedWeekdays) {
          const currentDate = new Date(startDate);

          // Calcular quantos dias até o próximo dia da semana desejado
          const daysUntilWeekday = (weekday - startDate.getDay() + 7) % 7;

          // Se for week 0 e o dia é o mesmo da data inicial, pular (será criado como agendamento inicial)
          if (week === 0 && daysUntilWeekday === 0) continue;

          // Adicionar os dias para chegar no dia da semana desejado + semanas
          currentDate.setDate(
            startDate.getDate() + daysUntilWeekday + week * 7
          );

          appointments.push({
            date: currentDate.toISOString().split("T")[0],
            time: selectedTime,
            weekday: weekdays[currentDate.getDay()],
          });
        }
      }
    } else {
      // Replicar apenas para o mesmo dia da semana (comportamento original)
      for (let i = 1; i <= replicationWeeks; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i * 7);

        appointments.push({
          date: currentDate.toISOString().split("T")[0],
          time: selectedTime,
          weekday: weekdays[currentDate.getDay()],
        });
      }
    }

    setReplicatedAppointments(appointments);
  }, [
    selectedDate,
    selectedTime,
    replicationWeeks,
    sameTimeForAll,
    replicateToMultipleDays,
    selectedWeekdays,
  ]);

  // Atualizar agendamentos replicados quando mudarem parâmetros
  useEffect(() => {
    if (
      selectedDate &&
      selectedTime &&
      ((shouldReplicate && replicationWeeks > 0) ||
        (replicateToMultipleDays && selectedWeekdays.length > 0))
    ) {
      generateReplicatedAppointments();
    } else {
      setReplicatedAppointments([]);
    }
  }, [
    shouldReplicate,
    selectedDate,
    selectedTime,
    replicationWeeks,
    sameTimeForAll,
    replicateToMultipleDays,
    selectedWeekdays,
    generateReplicatedAppointments,
  ]);

  // Sincronizar horários quando sameTimeForAll mudar para true
  useEffect(() => {
    if (sameTimeForAll && replicatedAppointments.length > 0) {
      const firstTime = replicatedAppointments[0].time;
      const needsSync = replicatedAppointments.some(
        (appt) => appt.time !== firstTime
      );

      if (needsSync) {
        const updated = replicatedAppointments.map((appt) => ({
          ...appt,
          time: firstTime,
        }));
        setReplicatedAppointments(updated);
      }
    }
  }, [sameTimeForAll]); // Removido replicatedAppointments das dependências para evitar loop

  const updateReplicatedAppointmentTime = (index: number, newTime: string) => {
    if (sameTimeForAll) {
      // Se todos devem ter o mesmo horário, atualiza todos
      const updated = replicatedAppointments.map((appt) => ({
        ...appt,
        time: newTime,
      }));
      setReplicatedAppointments(updated);
      // Também atualiza o horário principal
      setSelectedTime(newTime);
    } else {
      // Se pode ter horários diferentes, atualiza apenas o específico
      const updated = [...replicatedAppointments];
      updated[index] = { ...updated[index], time: newTime };
      setReplicatedAppointments(updated);
    }
  };

  const removeReplicatedAppointment = (index: number) => {
    const updated = replicatedAppointments.filter((_, i) => i !== index);
    setReplicatedAppointments(updated);
  };

  const validateForm = () => {
    if (!selectedStudentId) {
      toast({
        title: "Erro",
        description: "Selecione um aluno",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecione uma data",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedTime) {
      toast({
        title: "Erro",
        description: "Selecione um horário",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const baseAppointmentData: AppointmentInsert = {
      student_id: selectedStudentId,
      teacher_id: user?.id || "",
      date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      time: selectedTime,
      student_type: studentType,
      status: "scheduled",
      notes: notes || null,
    };

    try {
      if (
        (shouldReplicate || replicateToMultipleDays) &&
        replicatedAppointments.length > 0
      ) {
        // Criar múltiplos agendamentos (incluindo o agendamento inicial)
        const appointmentsData = [
          // Agendamento inicial
          baseAppointmentData,
          // Agendamentos replicados
          ...replicatedAppointments.map((appt) => ({
            ...baseAppointmentData,
            date: appt.date,
            time: appt.time,
          })),
        ];

        const results = await createMultipleAppointments(appointmentsData);

        const successCount = results.filter((r) => r.success).length;
        const errorCount = results.filter((r) => !r.success).length;

        if (successCount > 0) {
          const message =
            replicateToMultipleDays && !shouldReplicate
              ? `${successCount} agendamento(s) criado(s) para os dias selecionados`
              : `${successCount} agendamento(s) criado(s) com sucesso (incluindo o agendamento inicial)`;

          toast({
            title: "Sucesso!",
            description: `${message}${
              errorCount > 0 ? `, ${errorCount} falharam` : ""
            }`,
          });
        }

        if (errorCount > 0) {
          const errors = results
            .filter((r) => !r.success)
            .map((r) => r.error)
            .join(", ");
          toast({
            title: "Alguns agendamentos falharam",
            description: errors,
            variant: "destructive",
          });
        }

        if (successCount > 0) {
          onSuccess();
          onClose();
        }
      } else {
        // Criar agendamento único
        const result = await createAppointment(baseAppointmentData);

        if (result.success) {
          toast({
            title: "Sucesso!",
            description: "Agendamento criado com sucesso",
          });
          onSuccess();
          onClose();
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar agendamento",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar agendamento",
        variant: "destructive",
      });
    }
  };

  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-teal border-aqua">
        <DialogHeader>
          <DialogTitle className="text-ice-white text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-aqua" />
            Criar Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Aluno */}
          <div className="space-y-2">
            <Label htmlFor="student" className="text-ice-white">
              Aluno
            </Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
            >
              <SelectTrigger className="bg-light-gray border-aqua/30 text-ice-white">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent className="bg-dark-teal border-aqua/30">
                {studentsLoading ? (
                  <SelectItem value="loading" disabled>
                    Carregando alunos...
                  </SelectItem>
                ) : (
                  students?.map((student) => (
                    <SelectItem
                      key={student.id}
                      value={student.id}
                      className="text-ice-white"
                    >
                      {student.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-ice-white">
                Data
              </Label>
              <DatePicker
                selected={selectedDate}
                closeOnScroll={true}
                onChange={(date: Date | null) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                className="w-full px-3 py-2 bg-light-gray border border-aqua/30 rounded-md text-ice-white placeholder:text-light-gray-text focus:border-aqua focus:outline-none"
                calendarClassName="!bg-dark-teal text-ice-white border !border-aqua/40 rounded-lg shadow-lg "
                dayClassName={() =>
                  "text-ice-white hover:bg-aqua hover:text-black rounded"
                }
                popperClassName="z-50"
                popperPlacement="bottom"
                withPortal={isMobile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-ice-white">
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="bg-light-gray border-aqua/30 text-ice-white"
              />
            </div>
          </div>

          {/* Tipo de Atendimento */}
          <div className="space-y-2">
            <Label className="text-ice-white">Tipo de Atendimento</Label>
            <Select
              value={studentType}
              onValueChange={(value: "presencial" | "remoto") =>
                setStudentType(value)
              }
            >
              <SelectTrigger className="bg-light-gray border-aqua/30 text-ice-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-teal border-aqua/30">
                <SelectItem value="presencial" className="text-ice-white">
                  Presencial
                </SelectItem>
                <SelectItem value="remoto" className="text-ice-white">
                  Remoto
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Replicação */}
          <div className="space-y-4">
            {/* Replicação para múltiplos dias */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multipleDays"
                  checked={replicateToMultipleDays}
                  onCheckedChange={(checked: boolean) => {
                    setReplicateToMultipleDays(checked);
                    if (!checked) {
                      setSelectedWeekdays([]);
                    }
                  }}
                />
                <Label htmlFor="multipleDays" className="text-ice-white">
                  Replicar para outros dias da semana
                </Label>
              </div>

              {replicateToMultipleDays && (
                <div className="space-y-2">
                  <Label className="text-ice-white text-sm">
                    Selecione os dias da semana:
                  </Label>
                  <div className="text-xs text-light-gray-text mb-2">
                    💡 Serão criados agendamentos para todos os dias
                    selecionados{" "}
                    {shouldReplicate
                      ? "durante as semanas escolhidas"
                      : "na semana atual"}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 1, label: "Seg" },
                      { value: 2, label: "Ter" },
                      { value: 3, label: "Qua" },
                      { value: 4, label: "Qui" },
                      { value: 5, label: "Sex" },
                      { value: 6, label: "Sáb" },
                      { value: 0, label: "Dom" },
                    ].map((day) => (
                      <div
                        key={day.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={selectedWeekdays.includes(day.value)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedWeekdays([
                                ...selectedWeekdays,
                                day.value,
                              ]);
                            } else {
                              setSelectedWeekdays(
                                selectedWeekdays.filter((d) => d !== day.value)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`day-${day.value}`}
                          className="text-ice-white text-sm"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="replicate"
                checked={shouldReplicate}
                onCheckedChange={(checked: boolean) =>
                  setShouldReplicate(checked)
                }
              />
              <Label
                htmlFor="replicate"
                className="text-ice-white flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Replicar para as próximas semanas
              </Label>
            </div>

            {shouldReplicate && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="weeks" className="text-ice-white">
                    Quantas semanas seguintes:
                  </Label>
                  <Input
                    id="weeks"
                    type="number"
                    min="1"
                    max="12"
                    value={replicationWeeks || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setReplicationWeeks(1);
                      } else {
                        setReplicationWeeks(parseInt(value) || 1);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="w-20 bg-light-gray border-aqua/30 text-ice-white"
                  />
                </div>

                {/* Opção para horários */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameTime"
                    checked={sameTimeForAll}
                    onCheckedChange={(checked: boolean) =>
                      setSameTimeForAll(checked)
                    }
                  />
                  <Label htmlFor="sameTime" className="text-ice-white">
                    Usar o mesmo horário para todos os agendamentos
                  </Label>
                </div>

                {replicatedAppointments.length > 0 && (
                  <Card className="bg-light-gray border-aqua/30">
                    <CardHeader>
                      <CardTitle className="text-ice-white text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Agendamentos que serão criados:
                      </CardTitle>
                      {sameTimeForAll && (
                        <p className="text-light-gray-text text-xs">
                          Altere o horário do primeiro agendamento para alterar
                          todos
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {replicatedAppointments.map((appt, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-dark-teal rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-aqua border-aqua/50"
                            >
                              {appt.weekday}
                            </Badge>
                            <span className="text-ice-white text-sm">
                              {new Date(appt.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={appt.time}
                              onChange={(e) =>
                                updateReplicatedAppointmentTime(
                                  index,
                                  e.target.value
                                )
                              }
                              disabled={sameTimeForAll && index > 0}
                              className={`w-20 h-8 bg-light-gray border-aqua/30 text-ice-white text-sm ${
                                sameTimeForAll && index > 0 ? "opacity-50" : ""
                              }`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeReplicatedAppointment(index)}
                              className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-ice-white">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o agendamento..."
              className="bg-light-gray border-aqua/30 text-ice-white"
              rows={3}
            />
          </div>

          {/* Informações do Aluno Selecionado */}
          {selectedStudent && (
            <Card className="bg-light-gray border-aqua/30">
              <CardHeader>
                <CardTitle className="text-ice-white text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Aluno Selecionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-ice-white text-sm">
                  <p>
                    <strong>Nome:</strong> {selectedStudent.full_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedStudent.email}
                  </p>
                  {selectedStudent.phone && (
                    <p>
                      <strong>Telefone:</strong> {selectedStudent.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <Separator className="bg-aqua/30" />

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-aqua/30 text-ice-white hover:bg-aqua/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-aqua hover:bg-aqua/80 text-dark-teal"
            >
              {loading
                ? "Criando..."
                : shouldReplicate || replicateToMultipleDays
                ? "Criar Agendamentos"
                : "Criar Agendamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
