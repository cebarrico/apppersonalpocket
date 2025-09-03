import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAvailableStudents } from "@/hooks/use-student";
import { useTrainerRequests } from "@/hooks/use-trainer-requests";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { User } from "../../../../packages/supabase-client/types";

interface AddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentsModal: React.FC<AddStudentsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  // Usar o hook apenas quando o modal estiver aberto
  const { student: availableStudents, loading } = useAvailableStudents(
    user?.id || "",
    isOpen
  );
  const { sendRequest, refetch } = useTrainerRequests(user?.id || "");

  // Filtrar alunos baseado no nome digitado
  useEffect(() => {
    if (!availableStudents) {
      setFilteredStudents([]);
      return;
    }

    if (!name.trim()) {
      setFilteredStudents(availableStudents);
    } else {
      const filtered = availableStudents.filter((student) =>
        student.full_name?.toLowerCase().includes(name.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [name, availableStudents]);

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setFilteredStudents([]);
      setSendingRequest(null);
    }
  }, [isOpen]);

  const handleSendRequest = async (studentId: string, studentName: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setSendingRequest(studentId);

    try {
      const { error } = await sendRequest(studentId, "trainer");

      if (error) {
        console.error("Erro ao enviar solicitação:", error);
        toast({
          title: "Erro",
          description: "Erro ao enviar solicitação",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: `Solicitação enviada para ${studentName}`,
      });

      // Remover o aluno da lista local
      setFilteredStudents((prev) => prev.filter((s) => s.id !== studentId));

      // Atualizar dados
      await refetch();

      // Fechar modal se não há mais alunos
      if (filteredStudents.length === 1) {
        onClose();
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar solicitação",
        variant: "destructive",
      });
    } finally {
      setSendingRequest(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-teal max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-ice-white">Adicionar Aluno</DialogTitle>
          <DialogDescription className="text-light-gray-text">
            Envie uma solicitação para alunos que você gostaria de treinar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search" className="text-ice-white">
              Buscar por nome
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Nome do aluno"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-medium-blue-gray border-light-gray text-ice-white"
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {name === "" ? (
              <div className="text-center py-8">
                <p className="text-light-gray-text">
                  Digite o nome do aluno para buscar
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="md" />
                <span className="ml-2 text-light-gray-text">
                  Carregando alunos...
                </span>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-3">
                {filteredStudents.map((student) => (
                  <Card
                    key={student.id}
                    className="bg-light-gray border-light-gray"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-ice-white">
                            {student.full_name}
                          </h3>
                          <p className="text-sm text-light-gray-text">
                            {student.email}
                          </p>
                          {student.phone && (
                            <p className="text-sm text-light-gray-text">
                              {student.phone}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-aqua hover:bg-aqua-dark text-dark-teal"
                          onClick={() =>
                            handleSendRequest(
                              student.id,
                              student.full_name || "Aluno"
                            )
                          }
                          disabled={sendingRequest === student.id}
                        >
                          {sendingRequest === student.id ? (
                            <div className="flex items-center">
                              <Spinner size="sm" className="mr-2" />
                              Enviando...
                            </div>
                          ) : (
                            "Enviar Solicitação"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-light-gray-text">
                  {name.trim()
                    ? "Nenhum aluno encontrado com esse nome"
                    : "Nenhum aluno disponível"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-light-gray text-light-gray-text hover:bg-light-gray"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
