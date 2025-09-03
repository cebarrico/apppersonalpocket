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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  UserCheck,
  Target,
  Ruler,
  Weight,
  Calendar,
  IdCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import {
  type RegisterForm,
  type UserRole,
  type Gender,
  validationService,
} from "@pocket-trainer-hub/supabase-client";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    full_name: "",
    role: "student",
    cpf: "",
    phone: "",
    birth_date: "",
  });

  // Estado separado para o DatePicker
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");

  // Carregar professores quando o modal abrir e o role for student

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      role: "student",
      cpf: "",
      phone: "",
      birth_date: "",
    });
    setConfirmPassword("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    // Validações básicas
    if (!formData.email || !formData.password || !formData.full_name) {
      return "Preencha todos os campos obrigatórios";
    }

    if (!validationService.isValidEmail(formData.email)) {
      return "Email inválido";
    }

    if (formData.password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password !== confirmPassword) {
      return "As senhas não coincidem";
    }

    if (formData.cpf && !validationService.isValidCPF(formData.cpf)) {
      return "CPF inválido";
    }

    if (formData.phone && !validationService.isValidPhone(formData.phone)) {
      return "Telefone inválido";
    }

    // Validações específicas por role
    //if (formData.role === "teacher") {
    //if (!formData.cref) {
    //return "CREF é obrigatório para professores";
    //}
    //if (!validationService.isValidCREF(formData.cref)) {
    //return "CREF inválido";
    //}
    // }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    console.log("validationError:", validationError);
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Resultado do signUp:", formData);
      const result = await signUp(formData);
      if (!result.error) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Agora você pode fazer login com suas credenciais.",
        });
        handleClose();
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error("Erro no registro:", error);

      const errorMessage =
        error instanceof Error
          ? error.message.includes(
              "duplicate key value violates unique constraint"
            ) && error.message.includes("cpf")
            ? "Este CPF já está cadastrado."
            : error.message
          : "Algo deu errado. Tente novamente.";

      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterForm, value: unknown) => {
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
            <User className="h-6 w-6 text-aqua" />
            Criar Nova Conta
          </DialogTitle>
          <DialogDescription className="text-light-gray-text">
            Preencha as informações para criar sua conta no Personal Pocket
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Usuário */}
          <Card className="bg-slate-800 border-slate-600">
            <CardContent className="p-4">
              <Label className="text-ice-white text-base font-medium mb-3 block">
                Tipo de Conta
              </Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  handleInputChange("role", value)
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="student"
                    id="student"
                    className="border-aqua text-aqua"
                  />
                  <Label
                    htmlFor="student"
                    className="text-ice-white cursor-pointer"
                  >
                    Aluno
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="teacher"
                    id="teacher"
                    className="border-aqua text-aqua"
                  />
                  <Label
                    htmlFor="teacher"
                    className="text-ice-white cursor-pointer"
                  >
                    Professor
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

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
                    placeholder="Seu nome completo"
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
                      placeholder="seu@email.com"
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
                      placeholder="Confirme sua senha"
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
                      placeholderText="Selecione sua data de nascimento"
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

          {/* Campos específicos do Professor */}
          {formData.role === "teacher" && (
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-ice-white font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-aqua" />
                  Informações Profissionais
                </h3>

                <div>
                  <Label htmlFor="cref" className="text-ice-white">
                    CREF *
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-light-gray-text" />
                    <Input
                      id="cref"
                      type="text"
                      placeholder="Ex: 123456-G/SP"
                      value={formData.cref || ""}
                      onChange={(e) =>
                        handleInputChange("cref", e.target.value)
                      }
                      className="pl-10 bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campos específicos do Aluno */}
          {formData.role === "student" && (
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-ice-white font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-aqua" />
                  Informações de Treino (Opcional)
                </h3>

                <div>
                  <Label htmlFor="goal" className="text-ice-white">
                    Objetivo *
                  </Label>
                  <Textarea
                    id="goal"
                    placeholder="Descreva seu objetivo com os treinos..."
                    value={formData.goal || ""}
                    onChange={(e) => handleInputChange("goal", e.target.value)}
                    className="bg-medium-blue-gray border-light-gray text-ice-white placeholder:text-light-gray-text focus:border-aqua"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height_cm" className="text-ice-white">
                      Altura (cm) *
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
                      Peso (kg) *
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
                    <Label
                      htmlFor="body_fat_percent"
                      className="text-ice-white"
                    >
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
          )}

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
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
