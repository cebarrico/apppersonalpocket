import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  User,
  Mail,
  Plus,
  UserMinus,
  MessageCircle,
  PhoneCall,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import { useStudent, useUnlinkStudent } from "../hooks/use-student";
import { useStudentStats } from "../hooks/use-student-stats";
import { useAuth } from "../contexts/AuthContext";
import { AddStudentsModal } from "./addStudents";
import { toast } from "../hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useSubscription } from "../hooks/use-subscription";

interface StudentsListProps {
  onSelectStudent: (studentId: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  onSelectStudent,
}) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { student, loading } = useStudent(userId || "");
  const { currentPlan } = useSubscription(userId || "");
  // Estado para mês selecionado
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { getStudentStats, loading: statsLoading } = useStudentStats(
    userId || "",
    selectedMonth,
    selectedYear
  );
  const { unlinkStudent } = useUnlinkStudent();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [unlinkingStudentId, setUnlinkingStudentId] = useState<string | null>(
    null
  );

  const filteredStudents = student?.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      default:
        return "Desconhecido";
    }
  };

  const handleUnlinkStudent = async (studentId: string) => {
    if (!userId) return;

    setUnlinkingStudentId(studentId);

    try {
      const result = await unlinkStudent(userId, studentId);

      if (result.success) {
        toast({
          title: "Aluno desvinculado",
          description: "O aluno foi desvinculado com sucesso!",
        });

        // Atualizar a lista recarregando os dados
        window.location.reload();
      } else {
        toast({
          title: "Erro ao desvincular",
          description: "Não foi possível desvincular o aluno. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao desvincular aluno:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUnlinkingStudentId(null);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-ice-white mb-2"
            onClick={() => console.log(student)}
          >
            Meus Alunos{" "}
            <span className="text-sm text-aqua/50">
              {student?.length}/{currentPlan.maxStudents}
            </span>
          </h1>
          <p className="text-light-gray-text max-w-[80%]">
            Gerencie seus alunos e acompanhe o progresso
          </p>
          <div className="flex sm:gap-4  sm:flex-row flex-col sm:max-w-full max-w-[75%] space-y-2 sm:space-y-0">
            <Button
              className="mt-4"
              disabled={student!.length >= currentPlan.maxStudents}
              onClick={() => setIsAddStudentsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {student!.length >= currentPlan.maxStudents
                ? "Limite de alunos atingido"
                : "Adicionar aluno"}
            </Button>
            <Button
              className="mt-4"
              disabled={student!.length >= currentPlan.maxStudents}
              onClick={() => setIsAddStudentsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {student!.length >= currentPlan.maxStudents
                ? "Limite de alunos atingido"
                : "Criar Usuário de Aluno"}
            </Button>
          </div>
        </div>
        <Badge className="bg-aqua/20 text-aqua border-aqua/50 flex gap-1 sm:flex-row flex-col items-center justify-center">
          {student!.length} <span className="text-xs">alunos</span>
        </Badge>
      </div>

      {/* Search Bar */}
      <Card className="bg-light-gray border-light-gray">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-gray-text" />
            <Input
              placeholder="Buscar alunos por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dark-teal border-light-gray text-ice-white placeholder:text-light-gray-text"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {student!.map((student) => (
            <Card
              key={student.id}
              className="bg-light-gray border-light-gray hover:border-aqua/50 transition-all duration-200"
            >
              <CardContent className="p-4">
                {/* Topo: foto ao lado do nome, status no cantinho superior */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-aqua text-dark-teal">
                        {student.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-ice-white text-base ">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-light-gray-text flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(student.status || "")}>
                    {getStatusText(student.status || "")}
                  </Badge>
                </div>

                {/* Meio: objetivos, aulas concluídas, agendadas, faltas */}
                <div className="space-y-3 mb-4">
                  {/* Objetivo */}
                  <div className="bg-medium-blue-gray p-3 rounded-lg">
                    <p className="text-xs text-aqua font-medium mb-1">
                      Objetivo:
                    </p>
                    <p className="text-sm text-light-gray-text">
                      {student.goal || "Não informado"}
                    </p>
                  </div>
                  {/* Mes referencia */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="bg-medium-blue-gray p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-medium-blue-gray/80 transition-colors">
                        <div>
                          <p className="text-xs text-aqua font-medium mb-1">
                            Mês referência:
                          </p>
                          <span className="text-sm text-light-gray-text">
                            {new Date(
                              selectedYear,
                              selectedMonth
                            ).toLocaleString("pt-BR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <CalendarDays className="h-4 w-4 text-aqua" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-medium-blue-gray border-light-gray">
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="font-medium text-ice-white">
                            Selecionar Mês
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Seletor de Mês */}
                          <div className="space-y-2">
                            <label className="text-sm text-aqua font-medium">
                              Mês
                            </label>
                            <Select
                              value={selectedMonth.toString()}
                              onValueChange={(value: string) =>
                                setSelectedMonth(parseInt(value))
                              }
                            >
                              <SelectTrigger className="bg-dark-teal border-light-gray text-ice-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-medium-blue-gray border-light-gray">
                                {[
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
                                ].map((month, index) => (
                                  <SelectItem
                                    key={index}
                                    value={index.toString()}
                                  >
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Seletor de Ano */}
                          <div className="space-y-2">
                            <label className="text-sm text-aqua font-medium">
                              Ano
                            </label>
                            <Select
                              value={selectedYear.toString()}
                              onValueChange={(value: string) =>
                                setSelectedYear(parseInt(value))
                              }
                            >
                              <SelectTrigger className="bg-dark-teal border-light-gray text-ice-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-medium-blue-gray border-light-gray">
                                {Array.from({ length: 5 }, (_, i) => {
                                  const year = new Date().getFullYear() - 2 + i;
                                  return (
                                    <SelectItem
                                      key={year}
                                      value={year.toString()}
                                    >
                                      {year}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="bg-aqua text-dark-teal hover:bg-aqua/80"
                            onClick={() => {
                              // O popover fecha automaticamente
                            }}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {/* Estatísticas das aulas */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-medium-blue-gray p-2 rounded">
                      <p className="text-xs text-light-gray-text">Concluídas</p>
                      <p className="text-sm font-semibold text-green-400">
                        {statsLoading
                          ? "..."
                          : getStudentStats(student.id).concluidas}
                      </p>
                    </div>
                    <div className="bg-medium-blue-gray p-2 rounded">
                      <p className="text-xs text-light-gray-text">Agendadas</p>
                      <p className="text-sm font-semibold text-aqua">
                        {statsLoading
                          ? "..."
                          : getStudentStats(student.id).agendadas}
                      </p>
                    </div>
                    <div className="bg-medium-blue-gray p-2 rounded">
                      <p className="text-xs text-light-gray-text">Faltas</p>
                      <p className="text-sm font-semibold text-red-400">
                        {statsLoading
                          ? "..."
                          : getStudentStats(student.id).faltas}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: botões de ação */}
                <div className="flex gap-2 pt-3 border-t border-light-gray">
                  <Button
                    size="sm"
                    className="bg-aqua hover:bg-aqua/80 text-dark-teal flex-1"
                    onClick={() => onSelectStudent(student.id)}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Perfil
                  </Button>

                  {student.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-aqua/50 text-aqua hover:bg-aqua/10"
                      onClick={() => handleCall(student.phone!)}
                    >
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                  )}

                  {student.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                      onClick={() => handleWhatsApp(student.phone!)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
                        disabled={unlinkingStudentId === student.id}
                      >
                        {unlinkingStudentId === student.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <UserMinus className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você está prestes a desvincular o aluno{" "}
                          {student.full_name}. Esta ação removerá apenas o
                          vínculo entre vocês, mas não afetará o histórico de
                          treinos, agendamentos ou outros dados do aluno.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleUnlinkStudent(student.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Sim, desvincular
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {filteredStudents!.length === 0 && !loading && (
        <Card className="bg-light-gray border-light-gray">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-light-gray-text mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ice-white mb-2">
              {searchTerm
                ? "Nenhum aluno encontrado"
                : "Nenhum aluno cadastrado"}
            </h3>
            <p className="text-light-gray-text">
              {searchTerm
                ? "Tente ajustar os termos de busca"
                : "Você ainda não tem alunos cadastrados"}
            </p>
          </CardContent>
        </Card>
      )}
      <AddStudentsModal
        isOpen={isAddStudentsModalOpen}
        onClose={() => setIsAddStudentsModalOpen(false)}
      />
      <Toaster />
    </div>
  );
};
