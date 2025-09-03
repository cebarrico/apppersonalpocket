"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Appointment,
  AppointmentStatus,
} from "@pocket-trainer-hub/supabase-client";
import { Checkbox } from "@/components/ui/checkbox";

export interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  schoolLogoUrl?: string;
  schoolName?: string;
  defaultLessonPrice?: number; // fallback por aula
  onGenerate: (opts: {
    startDate: string;
    endDate: string;
    lessonPrice: number;
    items: { date: string; status: "Presente" | "Falta"; price: number }[];
  }) => void;
}

const formatDateInput = (d: Date) => d.toISOString().split("T")[0];

const mapStatus = (status: AppointmentStatus | null): "Presente" | "Falta" => {
  if (status === "completed" || status === "confirmed") return "Presente";
  if (status === "missed" || status === "cancelled") return "Falta";
  // "scheduled" ou null não contam como cobrança
  return "Falta";
};

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  defaultLessonPrice = 0,
  onGenerate,
}) => {
  const [startDate, setStartDate] = useState<string>(
    formatDateInput(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    )
  );
  const [endDate, setEndDate] = useState<string>(formatDateInput(new Date()));
  const [lessonPrice, setLessonPrice] = useState<number>(defaultLessonPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedById, setSelectedById] = useState<Record<string, boolean>>({});

  const totals = useMemo(() => {
    const periodAppointments = appointments.filter(
      (a) => a.date >= startDate && a.date <= endDate
    );

    const selected = periodAppointments.filter((a) => selectedById[a.id]);

    const items = selected.map((a) => ({
      date: a.date,
      status: mapStatus(a.status as AppointmentStatus | null),
    }));

    const present = items.filter((i) => i.status === "Presente").length;
    const absent = items.filter((i) => i.status === "Falta").length;
    const amount = (present + absent) * lessonPrice; // cobrar presentes e faltas selecionadas
    return {
      present,
      absent,
      amount,
      items,
      totalAppointments: periodAppointments.length,
      selectedCount: selected.length,
    };
  }, [appointments, startDate, endDate, lessonPrice, selectedById]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("student_id", studentId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) {
        setError(error.message);
        setAppointments([]);
      } else {
        const fetched = data || [];
        setAppointments(fetched);
        // Seleciona por padrão: completed/confirmed/missed/cancelled = true; scheduled = false
        const nextSelected: Record<string, boolean> = {};
        for (const a of fetched) {
          const st = (a.status as AppointmentStatus | null) || null;
          nextSelected[a.id] =
            st === "completed" ||
            st === "confirmed" ||
            st === "missed" ||
            st === "cancelled";
        }
        setSelectedById(nextSelected);
      }
    } catch (err) {
      setError("Erro inesperado ao carregar agendamentos");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    const items = totals.items.map((i) => ({
      date: i.date,
      status: i.status,
      // cobrar tanto Presente quanto Falta quando selecionados
      price: lessonPrice,
    }));
    onGenerate({ startDate, endDate, lessonPrice, items });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? undefined : onClose())}
    >
      <DialogContent className="bg-light-gray border-light-gray p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-ice-white">
            Gerar PDF de cobrança
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-ice-white">Período</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-light-gray-text" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-medium-blue-gray border-light-gray text-ice-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-light-gray-text" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-medium-blue-gray border-light-gray text-ice-white"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-ice-white">Valor por aula (R$)</Label>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={Number.isNaN(lessonPrice) ? "" : lessonPrice}
              onChange={(e) => setLessonPrice(parseFloat(e.target.value))}
              className="bg-medium-blue-gray border-light-gray text-ice-white"
              placeholder="Ex.: 60.00"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadAppointments}
              disabled={loading}
              className="bg-aqua hover:bg-aqua/80 text-dark-teal"
            >
              {loading ? "Carregando..." : "Listar aulas"}
            </Button>
            <div className="text-sm text-light-gray-text">
              {appointments.length > 0 &&
                `${totals.totalAppointments} aulas no período • ${totals.selectedCount} selecionadas`}
            </div>
          </div>

          {/* Lista de aulas com seleção */}
          {appointments.length > 0 && (
            <div className="max-h-[45vh] sm:max-h-60 overflow-auto rounded-lg border border-light-gray/40">
              {appointments
                .filter((a) => a.date >= startDate && a.date <= endDate)
                .map((a) => {
                  const status = mapStatus(
                    a.status as AppointmentStatus | null
                  );
                  const checked = !!selectedById[a.id];
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between px-3 py-2 border-b border-light-gray/20 last:border-none"
                    >
                      <div className="text-sm">
                        <div className="text-ice-white">
                          {new Date(a.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div
                          className={
                            status === "Presente"
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-light-gray-text">
                          Incluir na cobrança
                        </span>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(val) =>
                            setSelectedById((prev) => ({
                              ...prev,
                              [a.id]: Boolean(val),
                            }))
                          }
                          className="border-light-gray"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-medium-blue-gray/60">
              <div className="text-light-gray-text">Aulas</div>
              <div className="text-ice-white font-semibold">
                {totals.items.length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-medium-blue-gray/60">
              <div className="text-light-gray-text">Presentes</div>
              <div className="text-green-400 font-semibold">
                {totals.present}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-medium-blue-gray/60">
              <div className="text-light-gray-text">Faltas</div>
              <div className="text-red-400 font-semibold">{totals.absent}</div>
            </div>
            <div className="p-3 rounded-lg bg-medium-blue-gray/60">
              <div className="text-light-gray-text">Total</div>
              <div className="text-ice-white font-semibold">
                {formatCurrency(totals.amount)}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-light-gray-text"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={appointments.length === 0 || lessonPrice <= 0}
              className="bg-aqua hover:bg-aqua/80 text-dark-teal"
            >
              Gerar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillingModal;
