import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export interface StudentStats {
  studentId: string;
  concluidas: number;
  agendadas: number;
  faltas: number;
}

export const useStudentStats = (
  teacherId: string,
  month?: number,
  year?: number
) => {
  const [studentStats, setStudentStats] = useState<{
    [key: string]: StudentStats;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;

    const fetchStudentStats = async () => {
      try {
        setLoading(true);

        // Buscar appointments do professor
        let query = supabase
          .from("appointments")
          .select("*")
          .eq("teacher_id", teacherId);

        // Filtrar por mês/ano se fornecidos
        if (month !== undefined && year !== undefined) {
          const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
          const endDate = new Date(year, month + 1, 0)
            .toISOString()
            .split("T")[0]; // Último dia do mês
          query = query.gte("date", startDate).lte("date", endDate);
        }

        const { data: appointments, error } = await query;

        if (error) {
          console.error("Erro ao buscar appointments:", error);
          return;
        }

        // Calcular estatísticas por aluno
        const stats: { [key: string]: StudentStats } = {};

        appointments?.forEach((appointment) => {
          const studentId = appointment.student_id;
          if (!studentId) return; // Pular se student_id for null

          if (!stats[studentId]) {
            stats[studentId] = {
              studentId,
              concluidas: 0,
              agendadas: 0,
              faltas: 0,
            };
          }

          // Contar APENAS pelo status, sem considerar a data
          switch (appointment.status) {
            case "completed":
              stats[studentId].concluidas++;
              break;
            case "scheduled":
              stats[studentId].agendadas++;
              break;
            case "missed":
              stats[studentId].faltas++;
              break;
            default:
              // Status desconhecido ou null - considerar como agendado
              stats[studentId].agendadas++;
              break;
          }
        });

        setStudentStats(stats);
      } catch (error) {
        console.error("Erro ao calcular estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentStats();
  }, [teacherId, month, year]);

  const getStudentStats = (studentId: string): StudentStats => {
    return (
      studentStats[studentId] || {
        studentId,
        concluidas: 0,
        agendadas: 0,
        faltas: 0,
      }
    );
  };

  return {
    studentStats,
    loading,
    getStudentStats,
  };
};
