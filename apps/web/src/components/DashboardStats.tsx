import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

interface DashboardStatsProps {
  agendados: number;
  concluidos: number;
  faltas: number;
}

export const DashboardStats = ({
  agendados,
  concluidos,
  faltas,
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "Agendados",
      value: agendados,
      icon: Calendar,
      bgColor: "bg-gradient-to-r from-aqua/30 to-aqua/20",
      iconBg: "bg-aqua/25",
      iconColor: "text-aqua",
      textColor: "text-aqua",
    },
    {
      title: "Concluídos",
      value: concluidos,
      icon: CheckCircle,
      bgColor: "bg-gradient-to-r from-green-600/30 to-green-700/20",
      iconBg: "bg-green-500/25",
      iconColor: "text-green-300",
      textColor: "text-green-300",
    },
    {
      title: "Faltas",
      value: faltas,
      icon: XCircle,
      bgColor: "bg-gradient-to-r from-coral-red/30 to-coral-red/20",
      iconBg: "bg-coral-red/25",
      iconColor: "text-coral-red",
      textColor: "text-coral-red",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`${stat.bgColor} border-0 text-white shadow-lg`}
        >
          <CardContent className="p-4 ">
            <div className="w-full flex items-center justify-between">
              <div className="w-full flex justify-between items-center space-x-3">
                <div>
                  <p className={`text-sm font-medium ${stat.textColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold text-white`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <div className="flex items-center justify-center">
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
