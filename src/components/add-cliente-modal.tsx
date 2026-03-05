"use client";

import { logger } from "@/lib/logger";
import { useState, useEffect } from "react";
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
import { Loader2, User, Phone, MapPin, Calendar } from "lucide-react";
import { clientesService } from "@/services/clientes/clientes.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  calculateAge,
  maskDate,
  parseBirthDate,
  toISODate,
} from "@/lib/utils/date-utils";

interface AddClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddClienteModal({ isOpen, onClose }: AddClienteModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [idade, setIdade] = useState<number | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<{
    nome?: string;
    telefone?: string;
    dataNascimento?: string;
  }>({});

  // Calculate age when birth date changes
  useEffect(() => {
    if (dataNascimento.length === 10) {
      const parsedDate = parseBirthDate(dataNascimento);
      if (parsedDate) {
        const calculatedAge = calculateAge(parsedDate);
        setIdade(calculatedAge);
        setErrors((prev) => ({ ...prev, dataNascimento: undefined }));
      } else {
        setIdade(null);
        setErrors((prev) => ({
          ...prev,
          dataNascimento: "Data inválida",
        }));
      }
    } else {
      setIdade(null);
      if (dataNascimento.length > 0) {
        setErrors((prev) => ({
          ...prev,
          dataNascimento: undefined,
        }));
      }
    }
  }, [dataNascimento]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNome("");
      setTelefone("");
      setEndereco("");
      setBairro("");
      setCidade("");
      setDataNascimento("");
      setIdade(null);
      setErrors({});
    }
  }, [isOpen]);

  const handleTelefoneChange = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica máscara (XX) XXXXX-XXXX
    let masked = numbers;
    if (numbers.length > 0) {
      masked = `(${numbers.slice(0, 2)}`;
      if (numbers.length > 2) {
        masked += `) ${numbers.slice(2, 7)}`;
      }
      if (numbers.length > 7) {
        masked += `-${numbers.slice(7, 11)}`;
      }
    }

    setTelefone(masked);
  };

  const handleDataNascimentoChange = (value: string) => {
    const masked = maskDate(value);
    setDataNascimento(masked);
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (telefone.replace(/\D/g, "").length < 10) {
      newErrors.telefone = "Telefone inválido";
    }

    if (dataNascimento && dataNascimento.length === 10) {
      const parsedDate = parseBirthDate(dataNascimento);
      if (!parsedDate) {
        newErrors.dataNascimento = "Data inválida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      // Parse birth date if provided
      let birthDateISO: string | null = null;
      if (dataNascimento.length === 10) {
        const parsedDate = parseBirthDate(dataNascimento);
        if (parsedDate) {
          birthDateISO = toISODate(parsedDate);
        }
      }

      await clientesService.createCliente({
        nome: nome.trim(),
        telefone: telefone.replace(/\D/g, ""),
        trava: false,
        notes: null,
        endereco: endereco.trim() || null,
        bairro: bairro.trim() || null,
        cidade: cidade.trim() || null,
        data_nascimento: birthDateISO,
      });

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["clientes"] });

      toast.success("Cliente cadastrado com sucesso!");
      onClose();
    } catch (error) {
      logger.error("Erro ao criar cliente:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar cliente. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Cadastrar Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente. Campos marcados com * são
            obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações Básicas
            </h3>

            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Digite o nome completo"
                className={`h-11 ${errors.nome ? "border-red-500" : ""}`}
                disabled={isLoading}
              />
              {errors.nome && (
                <p className="text-xs text-red-500">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-sm font-medium">
                Telefone *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => handleTelefoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className={`h-11 pl-10 ${errors.telefone ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.telefone && (
                <p className="text-xs text-red-500">{errors.telefone}</p>
              )}
            </div>
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Nascimento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="text-sm font-medium">
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  value={dataNascimento}
                  onChange={(e) => handleDataNascimentoChange(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className={`h-11 ${errors.dataNascimento ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.dataNascimento && (
                  <p className="text-xs text-red-500">
                    {errors.dataNascimento}
                  </p>
                )}
              </div>

              {idade !== null && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Idade</Label>
                  <div className="h-11 px-4 rounded-md border border-input bg-muted/50 flex items-center">
                    <span className="text-sm font-semibold">
                      {idade} {idade === 1 ? "ano" : "anos"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </h3>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-sm font-medium">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, complemento"
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro" className="text-sm font-medium">
                  Bairro
                </Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Digite o bairro"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm font-medium">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite a cidade"
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar Cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
