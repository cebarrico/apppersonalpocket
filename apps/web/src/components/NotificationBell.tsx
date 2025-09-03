import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { useTrainerRequests } from "@/hooks/use-trainer-requests";
import { useAcceptRequest } from "@/hooks/use-student";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "../../supabase";
import {
  User,
  StudentTrainerRequest,
} from "../../../../packages/supabase-client/types";

interface NotificationBellProps {
  userRole: "student" | "teacher";
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userRole,
}) => {
  const { user } = useAuth();
  const { receivedRequests, sentRequests, respondRequest, refetch } =
    useTrainerRequests(user?.id || "");
  const { acceptRequest } = useAcceptRequest();
  const [loading, setLoading] = useState<string | null>(null);
  const [requestUsers, setRequestUsers] = useState<{ [key: string]: User }>({});
  const [isOpen, setIsOpen] = useState(false);

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const requests = userRole === "student" ? receivedRequests : sentRequests;
  const pendingRequests = requests.filter(
    (req: StudentTrainerRequest) => req.status === "pending"
  );
  const hasNotifications = pendingRequests.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-light-gray-text hover:text-ice-white hover:bg-light-gray/50"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-dark-teal border-light-gray"
        align="start"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-ice-white text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {userRole === "student"
                ? "Solicitações Recebidas"
                : "Solicitações Enviadas"}
              {requests.length > 0 && (
                <Badge className="bg-aqua/20 text-aqua border-aqua/50">
                  {requests.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-light-gray-text mx-auto mb-2" />
                <p className="text-light-gray-text text-sm">
                  {userRole === "student"
                    ? "Nenhuma solicitação recebida"
                    : "Nenhuma solicitação enviada"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
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
                      className="bg-light-gray border-light-gray"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className="bg-aqua text-dark-teal text-xs">
                              {otherUser.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-ice-white text-sm truncate">
                                {otherUser.full_name}
                              </h4>
                              <Badge
                                className={`text-xs ${getStatusColor(
                                  request.status || "pending"
                                )}`}
                              >
                                {getStatusText(request.status || "pending")}
                              </Badge>
                            </div>
                            <p className="text-xs text-light-gray-text truncate">
                              {otherUser.email}
                            </p>
                            <p className="text-xs text-light-gray-text mt-1">
                              {request.created_at &&
                                formatDate(request.created_at)}
                            </p>

                            {userRole === "student" &&
                              request.status === "pending" && (
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
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
                                      <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Aceitar
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="h-7 px-2 text-xs"
                                    onClick={() =>
                                      handleRejectRequest(request.id)
                                    }
                                    disabled={loading === request.id}
                                  >
                                    {loading === request.id ? (
                                      <Spinner size="sm" />
                                    ) : (
                                      <>
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Recusar
                                      </>
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
      </PopoverContent>
    </Popover>
  );
};
