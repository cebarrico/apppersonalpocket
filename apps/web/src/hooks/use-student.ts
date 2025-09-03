import { User } from "./../../../../packages/supabase-client/types";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

// Hook para buscar alunos vinculados a um professor através da tabela trainer_students
export const useStudent = (teacherId: string) => {
  const [student, setStudent] = useState<User[] | null>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);

    const fetchStudents = async () => {
      try {
        // Buscar alunos vinculados através da tabela trainer_students
        const { data, error } = await supabase
          .from("trainer_students")
          .select("student_id")
          .eq("trainer_id", teacherId);

        if (error) {
          console.error("Erro ao buscar vínculos:", error);
          setStudent([]);
          return;
        }

        if (!data || data.length === 0) {
          setStudent([]);
          return;
        }

        // Buscar os dados dos alunos
        const studentIds = data.map((item) => item.student_id);
        const { data: studentsData, error: studentsError } = await supabase
          .from("users")
          .select("*")
          .in("id", studentIds);

        if (studentsError) {
          console.error("Erro ao buscar alunos:", studentsError);
          setStudent([]);
        } else {
          setStudent(studentsData || []);
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
        setStudent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [teacherId]);

  return { student, loading };
};

// Hook para buscar todos os alunos (sem filtro de professor)
export const useStudentWithoutTeacher = (shouldFetch = false) => {
  const [student, setStudent] = useState<User[] | null>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!shouldFetch) return;

    setLoading(true);

    const fetchAllStudents = async () => {
      try {
        console.log("🔍 Buscando todos os alunos...");
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "student");

        console.log("✅ Resultado da query:", data);
        console.log("Erro na query:", error);

        if (error) {
          console.error("Erro ao buscar alunos:", error);
          throw error;
        }

        setStudent(data || []);
      } catch (error) {
        console.error("Erro no try-catch:", error);
        setStudent([]);
      } finally {
        console.log("Finalizando loading...");
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, [shouldFetch]);

  return { student, loading };
};

// Hook para buscar alunos disponíveis para request (que não têm vínculo com o professor)
export const useAvailableStudents = (
  teacherId: string,
  shouldFetch = false
) => {
  const [student, setStudent] = useState<User[] | null>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!shouldFetch || !teacherId) return;

    setLoading(true);

    const fetchAvailableStudents = async () => {
      try {
        console.log("🔍 Buscando alunos disponíveis...");

        // Buscar todos os alunos
        const { data: allStudents, error: studentsError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "student");

        if (studentsError) {
          console.error("Erro ao buscar alunos:", studentsError);
          throw studentsError;
        }

        // Buscar alunos já vinculados ao professor
        const { data: linkedStudents, error: linkedError } = await supabase
          .from("trainer_students")
          .select("student_id")
          .eq("trainer_id", teacherId);

        if (linkedError) {
          console.error("Erro ao buscar vínculos:", linkedError);
          throw linkedError;
        }

        // Buscar requests pendentes enviados pelo professor
        const { data: pendingRequests, error: requestsError } = await supabase
          .from("student_trainer_requests")
          .select("target_id")
          .eq("requester_id", teacherId)
          .eq("status", "pending");

        if (requestsError) {
          console.error("Erro ao buscar requests:", requestsError);
          throw requestsError;
        }

        // Filtrar alunos que não estão vinculados e não têm request pendente
        const linkedStudentIds =
          linkedStudents?.map((link) => link.student_id) || [];
        const pendingRequestIds =
          pendingRequests?.map((req) => req.target_id) || [];
        const excludedIds = [...linkedStudentIds, ...pendingRequestIds];

        const availableStudents =
          allStudents?.filter((student) => !excludedIds.includes(student.id)) ||
          [];

        console.log("✅ Alunos disponíveis:", availableStudents);
        setStudent(availableStudents);
      } catch (error) {
        console.error("Erro no try-catch:", error);
        setStudent([]);
      } finally {
        console.log("Finalizando loading...");
        setLoading(false);
      }
    };

    fetchAvailableStudents();
  }, [shouldFetch, teacherId]);

  return { student, loading };
};

export const useStudentById = (studentId: string) => {
  const [student, setStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchStudent = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", studentId)
        .single();

      if (error) {
        console.error(error);
      } else {
        setStudent(data);
      }
      setLoading(false);
    };

    fetchStudent();
  }, [studentId]);

  return { student, loading };
};

// Hook para aceitar uma request e criar o vínculo
export const useAcceptRequest = () => {
  const [loading, setLoading] = useState(false);

  const acceptRequest = async (
    requestId: string,
    trainerId: string,
    studentId: string
  ) => {
    setLoading(true);

    try {
      // 1. Atualizar status da request para "accepted"
      const { error: updateError } = await supabase
        .from("student_trainer_requests")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (updateError) {
        console.error("Erro ao atualizar request:", updateError);
        throw updateError;
      }

      // 2. Criar vínculo na tabela trainer_students
      const { error: linkError } = await supabase
        .from("trainer_students")
        .insert([
          {
            trainer_id: trainerId,
            student_id: studentId,
            created_by: studentId, // Criado pelo aluno que aceitou
          },
        ]);

      if (linkError) {
        console.error("Erro ao criar vínculo:", linkError);
        throw linkError;
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao aceitar request:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { acceptRequest, loading };
};

// Hook para desvincular um aluno (deletar apenas o registro da tabela trainer_students)
export const useUnlinkStudent = () => {
  const [loading, setLoading] = useState(false);

  const unlinkStudent = async (trainerId: string, studentId: string) => {
    setLoading(true);

    try {
      // Deletar apenas o registro da tabela trainer_students
      const { error } = await supabase
        .from("trainer_students")
        .delete()
        .eq("trainer_id", trainerId)
        .eq("student_id", studentId);

      if (error) {
        console.error("Erro ao desvincular aluno:", error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao desvincular aluno:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { unlinkStudent, loading };
};
