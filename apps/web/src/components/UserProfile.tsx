"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Crown,
  CheckCircle,
  Leaf,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import type { User } from "@pocket-trainer-hub/supabase-client";
import { useSubscription } from "@/hooks/use-subscription";

export const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentPlan } = useSubscription(authUser?.id || "");
  useEffect(() => {
    if (authUser?.id) {
      fetchFullUser(authUser.id);
    }
  }, [authUser?.id]);

  const fetchFullUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar usuário:", error);
        return;
      }

      setFullUser(data);
    } catch (error) {
      console.error("Erro inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !fullUser) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Spinner size="md" />
        <p className="text-light-gray-text">Carregando perfil...</p>
      </div>
    );
  }

  const isTeacher = fullUser.role === "teacher";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-ice-white">Meu Perfil</h1>
          <p className="text-light-gray-text">
            Gerencie suas informações pessoais
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "destructive" : "default"}
          className={
            isEditing
              ? "bg-coral-red hover:bg-coral-red/90"
              : "bg-aqua hover:bg-aqua-dark text-dark-teal"
          }
        >
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Pessoais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Básicos */}
          <Card className="bg-light-gray border-light-gray">
            <CardHeader>
              <CardTitle className="text-ice-white flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-light-gray-text">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    defaultValue={fullUser.full_name || ""}
                    disabled={!isEditing}
                    className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-light-gray-text">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={fullUser.email || ""}
                    disabled={!isEditing}
                    className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-light-gray-text">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    defaultValue={fullUser.phone || ""}
                    disabled={!isEditing}
                    className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date" className="text-light-gray-text">
                    Data de Nascimento
                  </Label>
                  <DatePicker
                    selected={
                      fullUser.birth_date ? new Date(fullUser.birth_date) : null
                    }
                    onChange={(date: Date | null) => {
                      // Handle the date change if editing is enabled
                      if (date && isEditing) {
                        // Update the user data - this would need proper implementation
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selecione a data de nascimento"
                    maxDate={new Date()}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 bg-medium-blue-gray border border-medium-blue-gray rounded-md text-ice-white placeholder:text-light-gray-text focus:border-aqua focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Campos específicos para professores */}
              {isTeacher && (
                <div className="space-y-2">
                  <Label htmlFor="cref" className="text-light-gray-text">
                    CREF
                  </Label>
                  <Input
                    id="cref"
                    defaultValue={fullUser.cref || ""}
                    disabled={!isEditing}
                    className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                  />
                </div>
              )}

              {/* Campos específicos para estudantes */}
              {!isTeacher && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-light-gray-text">
                      Objetivo
                    </Label>
                    <Input
                      id="goal"
                      defaultValue={fullUser.goal || ""}
                      disabled={!isEditing}
                      className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-light-gray-text">
                      Altura (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      defaultValue={fullUser.height_cm || ""}
                      disabled={!isEditing}
                      className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-light-gray-text">
                      Peso (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      defaultValue={fullUser.weight_kg || ""}
                      disabled={!isEditing}
                      className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body_fat" className="text-light-gray-text">
                      Gordura Corporal (%)
                    </Label>
                    <Input
                      id="body_fat"
                      type="number"
                      defaultValue={fullUser.body_fat_percent || ""}
                      disabled={!isEditing}
                      className="bg-medium-blue-gray border-medium-blue-gray text-ice-white"
                    />
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button className="bg-aqua hover:bg-aqua-dark text-dark-teal">
                    Salvar Alterações
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="text-light-gray-text hover:text-ice-white"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Área de Planos - Apenas para Professores */}
          {isTeacher && (
            <Card className="bg-light-gray border-light-gray">
              <CardHeader>
                <CardTitle className="text-ice-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Planos e Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Plano Atual */}
                  <div className="flex items-center justify-between p-4 bg-medium-blue-gray rounded-lg">
                    <div className="flex items-center space-x-3">
                      {currentPlan.name === "free" ? (
                        <Leaf className="h-6 w-6 text-aqua" />
                      ) : currentPlan.name === "basic" ? (
                        <Star className="h-6 w-6 text-aqua" />
                      ) : (
                        <Crown className="h-6 w-6 text-aqua" />
                      )}

                      <div>
                        <h3 className="font-semibold text-ice-white">
                          Plano {currentPlan.displayName}
                        </h3>
                        <p className="text-sm text-light-gray-text">
                          Até {currentPlan.maxStudents} alunos
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-aqua/10 text-aqua">
                      Ativo
                    </Badge>
                  </div>

                  {/* Benefícios do Plano Atual */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-ice-white">
                      Benefícios inclusos:
                    </p>
                    {currentPlan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-light-gray-text">
                          {feature}
                        </span>
                      </div>
                    ))}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />

                        <span className="text-sm text-light-gray-text">
                          Até {currentPlan.maxStudents} alunos
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-medium-blue-gray" />

                  {/* Upgrade */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-light-gray-text">
                      Precisa de mais recursos?
                    </p>
                    <Button className="bg-aqua hover:bg-aqua-dark text-dark-teal">
                      Fazer Upgrade
                    </Button>
                    <p className="text-xs text-light-gray-text">
                      Funcionalidade disponível em breve
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar com Avatar e Status */}
        <div className="space-y-6">
          {/* Avatar e Status */}
          <Card className="bg-light-gray border-light-gray">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="bg-aqua text-dark-teal text-2xl font-bold">
                    {fullUser.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-ice-white">
                    {fullUser.full_name || "Usuário"}
                  </h3>
                  <p className="text-light-gray-text">{fullUser.email}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    isTeacher
                      ? "bg-aqua/10 text-aqua"
                      : "bg-green-500/10 text-green-500"
                  }`}
                >
                  {isTeacher ? "Professor" : "Aluno"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Informações Rápidas */}
          <Card className="bg-light-gray border-light-gray">
            <CardHeader>
              <CardTitle className="text-ice-white text-sm">
                Informações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-aqua" />
                <div>
                  <p className="text-xs text-light-gray-text">Email</p>
                  <p className="text-sm text-ice-white">{fullUser.email}</p>
                </div>
              </div>
              {fullUser.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-aqua" />
                  <div>
                    <p className="text-xs text-light-gray-text">Telefone</p>
                    <p className="text-sm text-ice-white">{fullUser.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-aqua" />
                <div>
                  <p className="text-xs text-light-gray-text">Membro desde</p>
                  <p className="text-sm text-ice-white">
                    {fullUser.created_at
                      ? new Date(fullUser.created_at).toLocaleDateString(
                          "pt-BR"
                        )
                      : "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
