import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import { StudentTrainerRequest } from "@pocket-trainer-hub/supabase-client";

export function useTrainerRequests(userId: string) {
  const [sentRequests, setSentRequests] = useState<StudentTrainerRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<
    StudentTrainerRequest[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    const [sent, received] = await Promise.all([
      supabase
        .from("student_trainer_requests")
        .select("*")
        .eq("requester_id", userId),

      supabase
        .from("student_trainer_requests")
        .select("*")
        .eq("target_id", userId),
    ]);

    if (sent.data) setSentRequests(sent.data);
    if (received.data) setReceivedRequests(received.data);
    setLoading(false);
  }, [userId]);

  const sendRequest = async (targetId: string, role: "student" | "trainer") => {
    return await supabase.from("student_trainer_requests").insert([
      {
        requester_id: userId,
        target_id: targetId,
        requester_role: role,
      },
    ]);
  };

  const respondRequest = async (
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    return await supabase
      .from("student_trainer_requests")
      .update({ status })
      .eq("id", requestId)
      .eq("target_id", userId);
  };

  const cancelRequest = async (requestId: string) => {
    return await supabase
      .from("student_trainer_requests")
      .delete()
      .eq("id", requestId)
      .eq("requester_id", userId);
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    sentRequests,
    receivedRequests,
    loading,
    sendRequest,
    respondRequest,
    cancelRequest,
    refetch: fetchRequests,
  };
}
