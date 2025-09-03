import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase";
import {
  Appointment,
  AppointmentInsert,
} from "../../../../packages/supabase-client/types";

export interface AppointmentWithStudent extends Appointment {
  student?: {
    id: string;
    full_name: string;
    email: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

export const useTodayAppointments = (teacherId: string) => {
  const [appointments, setAppointments] = useState<AppointmentWithStudent[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;

    const fetchTodayAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pegar a data atual no formato YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
            *,
            student:users!appointments_student_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              phone
            )
          `
          )
          .eq("teacher_id", teacherId)
          .eq("date", today)
          .order("time", { ascending: true });

        if (error) {
          console.error("Erro ao buscar agendamentos:", error);
          setError(error.message);
        } else {
          setAppointments(data || []);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        setError("Erro inesperado ao buscar agendamentos");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAppointments();
  }, [teacherId]);

  const refreshAppointments = useCallback(async () => {
    if (!teacherId) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          student:users!appointments_student_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            phone
          )
        `
        )
        .eq("teacher_id", teacherId)
        .eq("date", today)
        .order("time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
        setError(error.message);
      } else {
        setAppointments(data || []);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  return { appointments, loading, error, refreshAppointments };
};

export const useMonthlyAppointments = (
  teacherId: string,
  year: number,
  month: number
) => {
  const [appointments, setAppointments] = useState<AppointmentWithStudent[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;

    const fetchMonthlyAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calcular primeiro e último dia do mês
        const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
        const lastDay = new Date(year, month + 1, 0)
          .toISOString()
          .split("T")[0];

        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
            *,
            student:users!appointments_student_id_fkey(
              id,
              full_name,
              email,
              avatar_url,
              phone
            )
          `
          )
          .eq("teacher_id", teacherId)
          .gte("date", firstDay)
          .lte("date", lastDay)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        if (error) {
          console.error("Erro ao buscar agendamentos do mês:", error);
          setError(error.message);
        } else {
          setAppointments(data || []);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        setError("Erro inesperado ao buscar agendamentos");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyAppointments();
  }, [teacherId, year, month]);

  const refreshAppointments = useCallback(async () => {
    if (!teacherId) return;

    try {
      setLoading(true);

      const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          student:users!appointments_student_id_fkey(
            id,
            full_name,
            email,
            avatar_url,
            phone
          )
        `
        )
        .eq("teacher_id", teacherId)
        .gte("date", firstDay)
        .lte("date", lastDay)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar agendamentos do mês:", error);
        setError(error.message);
      } else {
        setAppointments(data || []);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [teacherId, year, month]);

  return { appointments, loading, error, refreshAppointments };
};

export const useAppointments = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkTimeConflict = async (
    teacherId: string,
    date: string,
    time: string,
    studentType: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("date", date)
        .eq("time", time)
        .eq("student_type", "presencial");

      if (error) {
        console.error("Erro ao verificar conflitos:", error);
        return false;
      }

      // Se for presencial, não pode ter nenhum outro agendamento presencial no mesmo horário
      if (studentType === "presencial") {
        return (data || []).length === 0;
      }

      // Se for remoto, pode ter outros remotos, mas não presenciais
      return true;
    } catch (err) {
      console.error("Erro inesperado ao verificar conflitos:", err);
      return false;
    }
  };

  const createAppointment = async (appointmentData: AppointmentInsert) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar conflito de horário
      const canCreate = await checkTimeConflict(
        appointmentData.teacher_id!,
        appointmentData.date,
        appointmentData.time!,
        appointmentData.student_type!
      );

      if (!canCreate) {
        setError("Já existe um agendamento presencial neste horário");
        return { success: false, data: null };
      }

      const { data, error } = await supabase
        .from("appointments")
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar agendamento:", error);
        setError(error.message);
        return { success: false, data: null };
      }

      return { success: true, data };
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao criar agendamento");
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  const createMultipleAppointments = async (
    appointmentsData: AppointmentInsert[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      const results = [];

      for (const appointmentData of appointmentsData) {
        // Verificar conflito de horário para cada agendamento
        const canCreate = await checkTimeConflict(
          appointmentData.teacher_id!,
          appointmentData.date,
          appointmentData.time!,
          appointmentData.student_type!
        );

        if (!canCreate) {
          results.push({
            success: false,
            error: `Conflito de horário em ${appointmentData.date} às ${appointmentData.time}`,
            data: null,
          });
          continue;
        }

        const { data, error } = await supabase
          .from("appointments")
          .insert(appointmentData)
          .select()
          .single();

        if (error) {
          results.push({
            success: false,
            error: error.message,
            data: null,
          });
        } else {
          results.push({
            success: true,
            error: null,
            data,
          });
        }
      }

      return results;
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao criar agendamentos");
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createAppointment,
    createMultipleAppointments,
    checkTimeConflict,
    clearError,
  };
};
