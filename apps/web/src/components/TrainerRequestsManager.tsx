import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, UserPlus, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useTrainerRequests } from "@/hooks/use-trainer-requests";
import { useAcceptRequest } from "@/hooks/use-student";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../../supabase";
import {
  User,
  StudentTrainerRequest,
} from "../../../../packages/supabase-client/types";

interface TrainerRequestsManagerProps {
  userRole: "student" | "teacher";
}

export const TrainerRequestsManager: React.FC<TrainerRequestsManagerProps> = ({
  userRole,
}) => {
  const { user } = useAuth();
  const { receivedRequests, sentRequests, respondRequest, refetch } =
    useTrainerRequests(user?.id || "");
  const { acceptRequest } = useAcceptRequest();
  const [loading, setLoading] = useState<string | null>(null);
  const [requestUsers, setRequestUsers] = useState<{ [key: string]: User }>({});

  // Fetch user data for requests
  useEffect(() => {
    const fetchUserData = async () => {
      const requests = userRole === "student" ? receivedRequests : sentRequests;
      const userIds = requests.map((req: StudentTrainerRequest) =>
        userRole === "student" ? req.requester_id : req.target_id
      );

      if (userIds.length === 0) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .in("id", userIds);

      if (error) {
        console.error("Erro ao buscar dados dos usuários:", error);
        return;
      }

      const usersMap: { [key: string]: User } = {};
      data?.forEach((user: User) => {
        usersMap[user.id] = user;
      });

      setRequestUsers(usersMap);
    };

    fetchUserData();
  }, [receivedRequests, sentRequests, userRole]);

  const handleAcceptRequest = async (requestId: string, trainerId: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(requestId);

    try {
      const { success } = await acceptRequest(requestId, trainerId, user.id);

      if (success) {
        toast({
          title: "Sucesso!",
          description: "Solicitação aceita com sucesso!",
        });

        // Atualizar dados
        await refetch();
      } else {
        toast({
          title: "Erro",
          description: "Erro ao aceitar solicitação",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao aceitar solicitação:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao aceitar solicitação",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setLoading(requestId);

    try {
      const { error } = await respondRequest(requestId, "rejected");

      if (error) {
        console.error("Erro ao rejeitar solicitação:", error);
        toast({
          title: "Erro",
          description: "Erro ao rejeitar solicitação",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Solicitação rejeitada",
      });

      // Atualizar dados
      await refetch();
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao rejeitar solicitação",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "accepted":
        return "Aceita";
      case "rejected":
        return "Rejeitada";
      default:
        return "Desconhecido";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const requests = userRole === "student" ? receivedRequests : sentRequests;
  const title =
    userRole === "student" ? "Solicitações Recebidas" : "Solicitações Enviadas";
  const emptyMessage =
    userRole === "student"
      ? "Nenhuma solicitação recebida"
      : "Nenhuma solicitação enviada";

  return (
    <Card className="bg-light-gray border-light-gray">
      <CardHeader>
        <CardTitle className="text-ice-white flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {title}
          {requests.length > 0 && (
            <Badge className="bg-aqua/20 text-aqua border-aqua/50">
              {requests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-light-gray-text mx-auto mb-4" />
            <p className="text-light-gray-text">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request: StudentTrainerRequest) => {
              const otherUserId =
                userRole === "student"
                  ? request.requester_id
                  : request.target_id;
              const otherUser = requestUsers[otherUserId];

              if (!otherUser) return null;

              return (
                <Card
                  key={request.id}
                  className="bg-dark-teal border-light-gray"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-aqua text-dark-teal">
                            {otherUser.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-ice-white">
                            {otherUser.full_name}
                          </h3>
                          <p className="text-sm text-light-gray-text">
                            {otherUser.email}
                          </p>
                          <p className="text-xs text-light-gray-text">
                            {request.created_at &&
                              formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={getStatusColor(
                            request.status || "pending"
                          )}
                        >
                          {getStatusText(request.status || "pending")}
                        </Badge>
                        {userRole === "student" &&
                          request.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  handleAcceptRequest(
                                    request.id,
                                    request.requester_id
                                  )
                                }
                                disabled={loading === request.id}
                              >
                                {loading === request.id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={loading === request.id}
                              >
                                {loading === request.id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
