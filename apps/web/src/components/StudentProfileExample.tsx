import React, { useState } from "react";
import { StudentProfile } from "./StudentProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar } from "lucide-react";

// Exemplo de estudantes mockados
const mockStudents = [
  {
    id: "student-001",
    name: "João Silva",
    goal: "Ganho de massa muscular",
    email: "joao@email.com",
  },
  {
    id: "student-002",
    name: "Maria Santos",
    goal: "Perda de peso",
    email: "maria@email.com",
  },
  {
    id: "student-003",
    name: "Pedro Oliveira",
    goal: "Condicionamento físico",
    email: "pedro@email.com",
  },
];

export const StudentProfileExample: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  if (selectedStudent) {
    return (
      <StudentProfile
        studentId={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-ice-white">
          Perfis de Estudantes - Treinos Dinâmicos
        </h1>
        <p className="text-light-gray-text">
          Demonstração do sistema de workouts dinâmicos por dia da semana
        </p>
      </div>

      <Card className="bg-light-gray border-light-gray">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ice-white">
            <Users className="w-5 h-5" />
            Selecione um Estudante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-light-gray-text space-y-2">
              <p>
                <strong>Funcionalidades implementadas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Renderização dinâmica de exercícios por dia da semana</li>
                <li>
                  Integração com banco de dados Supabase (tabela daily_workouts)
                </li>
                <li>
                  Agrupamento automático por grupos musculares (Peito, Braços,
                  etc.)
                </li>
                <li>
                  Exibição de &quot;Dia de descanso&quot; quando não há
                  exercícios
                </li>
                <li>Contagem de exercícios e duração estimada</li>
                <li>Modal para adicionar/editar treinos</li>
                <li>Atualização automática após criar treinos</li>
              </ul>
            </div>

            <div className="grid gap-3">
              {mockStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-medium-blue-gray rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-ice-white">
                      {student.name}
                    </h3>
                    <p className="text-sm text-light-gray-text">
                      {student.goal}
                    </p>
                    <p className="text-xs text-light-gray-text">
                      {student.email}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedStudent(student.id)}
                    className="bg-aqua text-dark-teal hover:bg-aqua-dark"
                  >
                    Ver Perfil
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-light-gray border-light-gray">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ice-white">
            <Calendar className="w-5 h-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-light-gray-text">
            <div>
              <h4 className="font-medium text-ice-white mb-2">
                1. Busca Dinâmica por Dia
              </h4>
              <p>
                O sistema usa o hook `useWorkout()` para buscar treinos
                específicos do banco de dados por aluno e data. Cada dia da
                semana é calculado automaticamente.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-ice-white mb-2">
                2. Agrupamento por Músculo
              </h4>
              <p>
                Os exercícios são agrupados automaticamente por grupo muscular
                (chest → &quot;Peito&quot;, arms → &quot;Braços&quot;, etc.) e
                exibidos como badges coloridas.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-ice-white mb-2">
                3. Dia de Descanso
              </h4>
              <p>
                Quando não há exercícios programados para um dia específico, o
                sistema exibe automaticamente &quot;Dia de descanso&quot; com um
                ícone de café.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-ice-white mb-2">
                4. Integração com Modal
              </h4>
              <p>
                Ao clicar em &quot;Editar&quot; em qualquer dia, o modal de
                workout é aberto para adicionar exercícios. Após salvar, a
                visualização é atualizada automaticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-light-gray border-light-gray">
        <CardHeader>
          <CardTitle className="text-ice-white">
            Exemplo de Dados no Banco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-light-gray-text">
              <p className="font-medium text-ice-white mb-1">
                Tabela: daily_workouts
              </p>
              <pre className="bg-dark-teal/20 p-3 rounded text-xs overflow-x-auto">
                {`{
  "id": "workout-123",
  "student_id": "student-001", 
  "date": "2024-01-15",
  "workout": {
    "name": "Treino de Peito e Braços",
    "exercises": [
      {
        "exercise": {
          "name": "Supino Reto",
          "muscle_group": "chest"
        },
        "sets": [...]
      },
      {
        "exercise": {
          "name": "Rosca Bíceps",
          "muscle_group": "arms"
        },
        "sets": [...]
      }
    ],
    "estimated_duration": 45
  }
}`}
              </pre>
            </div>
            <p className="text-xs text-light-gray-text">
              O sistema busca por `student_id` e `date` para renderizar os
              treinos de cada dia da semana dinamicamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfileExample;
