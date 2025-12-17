import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Lock,
  Phone,
  Target,
  Ruler,
  Weight,
  Calendar,
  IdCard,
  UserPlus,
} from "lucide-react";
import { type Gender } from "@pocket-trainer-hub/supabase-client";

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface StudentFormData {
  email: string;
  password: string;
  full_name: string;
  cpf: string;
  phone: string;
  birth_date: string;
  gender?: Gender;
  goal?: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_percent?: number;
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState<StudentFormData>({
    email: "",
    password: "",
    full_name: "",
    cpf: "",
    phone: "",
    birth_date: "",
  });

  // Estado separado para o DatePicker
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      cpf: "",
      phone: "",
      birth_date: "",
    });
    setConfirmPassword("");
    setBirthDate(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implementar lógica de criação do aluno
    console.log("Dados do aluno:", formData);

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    // handleClose();
    // onSuccess?.();
  };

  const handleInputChange = (field: keyof StudentFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-600">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl text-ice-white flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-aqua" />
            Criar Usuário de Aluno
          </DialogTitle>
          <DialogDescription className="text-light-gray-text">
            Cadastre um novo aluno que será automaticamente vinculado a você
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-slate-800 border-slate-600">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-ice-white font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-aqua" />
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name" className="text-ice-white">
                    Nome Completo *
                  </Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Nome do aluno"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                    className="bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-ice-white">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="aluno@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-ice-white">
                    Senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-ice-white">
                    Confirmar Senha *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cpf" className="text-ice-white">
                    CPF
                  </Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf || ""}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-ice-white">
                    Telefone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="phone"
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender" className="text-ice-white">
                    Gênero
                  </Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value: Gender) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger className="bg-medium-blue-gray border-light-gray text-ice-white focus:border-aqua">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="male" className="text-ice-white">
                        Masculino
                      </SelectItem>
                      <SelectItem value="female" className="text-ice-white">
                        Feminino
                      </SelectItem>
                      <SelectItem value="other" className="text-ice-white">
                        Outro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="birth_date" className="text-ice-white">
                    Data de Nascimento
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-light-gray-text z-10" />
                    <DatePicker
                      selected={birthDate}
                      onChange={(date: Date | null) => {
                        setBirthDate(date);
                        if (date) {
                          handleInputChange(
                            "birth_date",
                            date.toISOString().split("T")[0]
                          );
                        } else {
                          handleInputChange("birth_date", "");
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Selecione a data de nascimento"
                      maxDate={new Date()}
                      showYearDropdown
                      yearDropdownItemNumber={100}
                      scrollableYearDropdown
                      className="w-full pl-10 pr-3 py-2 bg-medium-blue-gray border border-light-gray rounded-md text-ice-white placeholder:text-light-gray-text focus:border-aqua focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Treino */}
          <Card className="bg-slate-800 border-slate-600">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-ice-white font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-aqua" />
                Informações de Treino (Opcional)
              </h3>

              <div>
                <Label htmlFor="goal" className="text-ice-white">
                  Objetivo
                </Label>
                <Textarea
                  id="goal"
                  placeholder="Descreva o objetivo do aluno com os treinos..."
                  value={formData.goal || ""}
                  onChange={(e) => handleInputChange("goal", e.target.value)}
                  className="bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height_cm" className="text-ice-white">
                    Altura (cm)
                  </Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="height_cm"
                      type="number"
                      placeholder="170"
                      min="100"
                      max="250"
                      value={formData.height_cm || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "height_cm",
                          parseInt(e.target.value) || undefined
                        )
                      }
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight_kg" className="text-ice-white">
                    Peso (kg)
                  </Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="weight_kg"
                      type="number"
                      placeholder="70"
                      min="20"
                      max="300"
                      step="0.1"
                      value={formData.weight_kg || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "weight_kg",
                          parseFloat(e.target.value) || undefined
                        )
                      }
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="body_fat_percent" className="text-ice-white">
                    % Gordura
                  </Label>
                  <Input
                    id="body_fat_percent"
                    type="number"
                    placeholder="15"
                    min="0"
                    max="50"
                    step="0.1"
                    value={formData.body_fat_percent || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "body_fat_percent",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    className="bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informação */}
          <div className="bg-aqua/10 border border-aqua/30 p-3 rounded-lg">
            <p className="text-sm text-aqua">
              <span className="font-medium">Nota:</span> O aluno será criado com
              as credenciais informadas e automaticamente vinculado a você como
              professor.
            </p>
          </div>

          <Separator className="bg-slate-600" />

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-600 text-ice-white hover:bg-slate-800"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-aqua hover:bg-aqua-dark text-dark-teal font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Criando aluno..." : "Criar Aluno"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

