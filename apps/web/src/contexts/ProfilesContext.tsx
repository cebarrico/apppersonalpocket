"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  userService,
  type User,
  type UserFilters,
  type UserUpdate,
} from "@pocket-trainer-hub/supabase-client";
import { useAuth } from "./AuthContext";

interface ProfilesContextType {
  // Estados
  users: User[];
  loading: boolean;
  error: string | null;

  // Métodos para usuários
  refreshUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<User | null>;
  updateUser: (
    id: string,
    data: UserUpdate
  ) => Promise<{ error: string | null }>;
  searchUsers: (filters: UserFilters) => Promise<User[]>;

  // Métodos específicos
  getStudentsByTeacher: (teacherId: string) => Promise<User[]>;
  getMyStudents: () => Promise<User[]>;
  getAllTeachers: () => Promise<User[]>;

  // Utilitários
  clearError: () => void;
  isUserStudent: (user: User) => boolean;
  isUserTeacher: (user: User) => boolean;
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined
);

export const ProfilesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: currentUser, isTeacher, isStudent } = useAuth();

  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (currentUser) {
      if (isTeacher) {
        loadMyStudents();
      }
    }
  }, [currentUser, isTeacher, isStudent]);

  // Método para limpar erro
  const clearError = () => setError(null);

  // Método para definir erro
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  // Refresh geral dos usuários
  const refreshUsers = async () => {
    setLoading(true);
    clearError();

    try {
      const { data: usersData, error: usersError } = await userService.getAll();

      if (usersError) {
        handleError(usersError);
        return;
      }

      if (usersData) {
        setUsers(usersData);
      }
    } catch (err) {
      handleError("Erro inesperado ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuário por ID
  const getUserById = async (id: string): Promise<User | null> => {
    clearError();

    try {
      const { data: userData, error: userError } = await userService.getById(
        id
      );

      if (userError) {
        setError(userError);
        return null;
      }

      return userData;
    } catch (err) {
      setError("Erro inesperado ao buscar usuário");
      return null;
    }
  };

  // Atualizar usuário
  const updateUser = async (id: string, data: UserUpdate) => {
    clearError();

    try {
      const { error: updateError } = await userService.update(id, data);

      if (updateError) {
        setError(updateError);
        return { error: updateError };
      }

      // Atualizar localmente
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...data } : u))
      );

      return { error: null };
    } catch (err) {
      const errorMsg = "Erro inesperado ao atualizar usuário";
      setError(errorMsg);
      return { error: errorMsg };
    }
  };

  // Buscar usuários com filtros
  const searchUsers = async (filters: UserFilters): Promise<User[]> => {
    clearError();

    try {
      const { data: usersData, error: searchError } = await userService.getAll(
        filters
      );

      if (searchError) {
        setError(searchError);
        return [];
      }

      return usersData || [];
    } catch (err) {
      setError("Erro inesperado na busca");
      return [];
    }
  };

  // Buscar estudantes de um professor específico
  const getStudentsByTeacher = async (teacherId: string): Promise<User[]> => {
    clearError();

    try {
      const { data: studentsData, error: studentsError } =
        await userService.getStudentsByTeacher(teacherId);

      if (studentsError) {
        setError(studentsError);
        return [];
      }

      return (studentsData || []) as unknown as User[];
    } catch (err) {
      setError("Erro inesperado ao buscar estudantes");
      return [];
    }
  };

  // Buscar meus estudantes (professor logado)
  const getMyStudents = async (): Promise<User[]> => {
    if (!currentUser || !isTeacher) {
      return [];
    }

    return getStudentsByTeacher(currentUser.id);
  };

  // Carregar meus estudantes (para professores)
  const loadMyStudents = async () => {
    if (!currentUser || !isTeacher) return;

    setLoading(true);
    const studentsData = await getMyStudents();
    setUsers(studentsData);
    setLoading(false);
  };

  // Buscar todos os professores
  const getAllTeachers = async (): Promise<User[]> => {
    clearError();

    try {
      const { data: teachersData, error: teachersError } =
        await userService.getTeachers();

      if (teachersError) {
        setError(teachersError);
        return [];
      }

      return (teachersData || []) as unknown as User[];
    } catch (err) {
      setError("Erro inesperado ao buscar professores");
      return [];
    }
  };

  // Type guards simples
  const isUserStudent = (user: User): boolean => {
    return user.role === "student";
  };

  const isUserTeacher = (user: User): boolean => {
    return user.role === "teacher";
  };

  const value: ProfilesContextType = {
    // Estados
    users,
    loading,
    error,

    // Métodos
    refreshUsers,
    getUserById,
    updateUser,
    searchUsers,
    getStudentsByTeacher,
    getMyStudents,
    getAllTeachers,
    clearError,
    isUserStudent,
    isUserTeacher,
  };

  return (
    <ProfilesContext.Provider value={value}>
      {children}
    </ProfilesContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfilesContext);
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfilesProvider");
  }
  return context;
};

export default ProfilesContext;
