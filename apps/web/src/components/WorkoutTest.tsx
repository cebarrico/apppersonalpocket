import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";

// Exemplo de uso do modal de workout
export const WorkoutTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekDays = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];

  const openModal = (day: string) => {
    console.log(`Abrindo modal para ${day}`);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold text-ice-white">
        Teste do Modal de Workout
      </h2>

      <div className="grid gap-4">
        {weekDays.map((day) => (
          <Card key={day} className="bg-light-gray border-light-gray">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-ice-white">{day}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-aqua hover:text-aqua-dark"
                  onClick={() => openModal(day)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-light-gray-text">
                Clique no botão para criar treino para {day}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aqui seria o modal quando funcionando */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-teal p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-ice-white mb-4">
              Modal de Workout (Teste)
            </h3>
            <p className="text-light-gray-text mb-4">
              Aqui seria o modal completo de criação de workout.
            </p>
            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-aqua text-dark-teal hover:bg-aqua-dark"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
