"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function MedicalRecordModal({ isOpen, onClose }: { patientId: number; isOpen: boolean; onClose: () => void; recordId?: string }) { return <Dialog open={isOpen} onOpenChange={onClose}><DialogContent><DialogHeader><DialogTitle>Prontuário indisponível</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">O projeto Supabase conectado não possui tabelas de prontuário clínico.</p></DialogContent></Dialog>; }
