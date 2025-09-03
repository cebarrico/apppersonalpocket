"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, ChevronRight, Clock, User, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMonthlyAppointments } from "@/hooks/use-appointments";
import { AppointmentModal } from "@/components/AppointmentModal";

interface CalendarStudent {
  id: string;
  name: string;
  time: string;
  avatar?: string;
  status: "scheduled" | "completed" | "missed";
}

export const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Buscar agendamentos do mês atual
  const { appointments, loading, error, refreshAppointments } =
    useMonthlyAppointments(
      user?.id || "",
      currentDate.getFullYear(),
      currentDate.getMonth()
    );

  // Processar agendamentos para o formato do calendário
  const calendarData = appointments.reduce((acc, appointment) => {
    const date = appointment.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      id: appointment.id,
      name: appointment.student?.full_name || "Usuário",
      time: appointment.time || "00:00",
      avatar: appointment.student?.avatar_url || undefined,
      status:
        (appointment.status as "scheduled" | "completed" | "missed") ||
        "scheduled",
    });
    return acc;
  }, {} as Record<string, CalendarStudent[]>);

  // O hook useMonthlyAppointments já se encarrega de atualizar os dados
  // quando currentDate.getFullYear(), currentDate.getMonth() ou user?.id mudam

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  };

  const selectedStudents = calendarData[selectedDate] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "missed":
        return "bg-coral-red/20 text-coral-red border-coral-red/50";
      default:
        return "bg-aqua/20 text-aqua border-aqua/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "missed":
        return "Faltou";
      default:
        return "Agendado";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-ice-white mb-2 bg-gradient-to-r from-ice-white to-aqua bg-clip-text text-transparent">
          Calendário
        </h1>
        <p className="text-light-gray-text text-lg">
          Visualize e gerencie os horários dos seus alunos
        </p>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="xl:col-span-2 bg-gradient-to-br from-light-gray to-light-gray/80 border-light-gray aqua-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-ice-white text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="text-light-gray-text hover:text-ice-white hover:bg-aqua/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="text-light-gray-text hover:text-ice-white hover:bg-aqua/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-coral-red text-center">
                  <p className="font-semibold">Erro ao carregar agendamentos</p>
                  <p className="text-sm mt-1">{error}</p>
                  <Button
                    onClick={refreshAppointments}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-aqua hover:text-aqua hover:bg-aqua/20"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-aqua p-3"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="p-3" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentDate.getFullYear()}-${String(
                      currentDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const hasStudents = calendarData[dateStr]?.length > 0;
                    const studentCount = calendarData[dateStr]?.length || 0;
                    const isSelected = selectedDate === dateStr;
                    const isToday =
                      new Date().toISOString().split("T")[0] === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`p-3 text-sm rounded-xl transition-all duration-300 hover-scale relative group ${
                          isSelected
                            ? "bg-gradient-to-br from-aqua to-aqua/80 text-dark-teal font-bold shadow-lg shadow-aqua/30"
                            : hasStudents
                            ? "bg-gradient-to-br from-aqua/30 to-aqua/20 text-aqua hover:from-aqua/40 hover:to-aqua/30 font-semibold"
                            : isToday
                            ? "bg-gradient-to-br from-light-gray-text/20 to-light-gray-text/10 text-ice-white border border-light-gray-text/30"
                            : "text-light-gray-text hover:bg-medium-blue-gray hover:text-ice-white"
                        }`}
                      >
                        <span className="flex justify-center items-center relative z-10">
                          {day}
                        </span>
                        {hasStudents && (
                          <div className="absolute -top-1 -right-1 bg-coral-red/80 text-dark-teal text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold z-20">
                            {studentCount}
                          </div>
                        )}
                        {isToday && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-aqua rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Students */}
        <Card className="bg-gradient-to-br from-light-gray to-light-gray/80 border-light-gray aqua-glow">
          <CardHeader>
            <CardTitle className="text-ice-white">
              {/* Layout responsivo: stacked em telas até 1025px, flex em telas maiores */}
              <div className="flex items-center justify-between xl:flex-row flex-col xl:gap-0 gap-2">
                <span className="xl:order-1">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-aqua/80 xl:order-2 text-sm xl:text-base">
                    {selectedStudents.length} alunos agendados
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAppointmentModalOpen(true)}
                    className="text-aqua hover:text-aqua hover:bg-aqua/20 xl:order-3 border border-aqua/20 rounded-full p-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {selectedStudents.length > 0 ? (
              <div className="space-y-3">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="group p-3 bg-gradient-to-r from-medium-blue-gray to-medium-blue-gray/80 rounded-xl hover:from-medium-blue-gray/80 hover:to-medium-blue-gray/60 transition-all duration-300 hover-scale"
                  >
                    {/* Layout responsivo para cards dos alunos */}
                    <div className="flex items-start xl:items-center space-x-3">
                      <Avatar className="h-10 w-10 ring-2 ring-aqua/20 group-hover:ring-aqua/40 transition-all duration-300 flex-shrink-0">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-aqua/20 text-aqua">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ice-white truncate group-hover:text-aqua transition-colors duration-300">
                          {student.name}
                        </p>
                        {/* Layout responsivo para hora e badge */}
                        <div className="xl:flex xl:items-center xl:justify-between space-y-2 xl:space-y-0 mt-1">
                          <div className="flex items-center text-light-gray-text text-sm">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{student.time}</span>
                          </div>
                          <Badge
                            className={`${getStatusColor(
                              student.status
                            )} text-xs whitespace-nowrap flex-shrink-0 w-fit`}
                          >
                            {getStatusText(student.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-medium-blue-gray to-medium-blue-gray/80 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-light-gray-text" />
                </div>
                <p className="text-light-gray-text mb-4">
                  Nenhum aluno agendado
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAppointmentModalOpen(true)}
                  className="text-aqua hover:text-aqua hover:bg-aqua/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar aluno
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Criação de Agendamento */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={() => {
          refreshAppointments();
          setIsAppointmentModalOpen(false);
        }}
      />
    </div>
  );
};
