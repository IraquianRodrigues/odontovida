import type { TreatmentPlanWithItems } from "@/types/treatment-plan";
import { PLAN_STATUS_LABELS, ITEM_STATUS_LABELS } from "@/types/treatment-plan";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

export const TreatmentPlanPDFService = {
  async generateAndDownload(plan: TreatmentPlanWithItems, patientName: string) {
    const { default: JsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new JsPDF();
    const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "Clínica Odontológica";
    const pageWidth = doc.internal.pageSize.width;

    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(clinicName, pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Orçamento — Plano de Tratamento", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Patient + Plan Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Paciente:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(patientName, 40, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Plano:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(plan.title, 40, y);
    y += 7;

    doc.setFont("helvetica", "bold");
    doc.text("Data:", 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(plan.created_at), 40, y);

    if (plan.professional?.name) {
      doc.setFont("helvetica", "bold");
      doc.text("Profissional:", 100, y);
      doc.setFont("helvetica", "normal");
      doc.text(plan.professional.name, 130, y);
    }

    doc.setFont("helvetica", "bold");
    doc.text("Status:", 100, y - 7);
    doc.setFont("helvetica", "normal");
    doc.text(PLAN_STATUS_LABELS[plan.status], 120, y - 7);

    y += 12;

    // Divider
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    // Items Table
    const tableData = plan.items.map((item, index) => [
      (index + 1).toString(),
      item.procedure_name,
      item.tooth_number ? `Dente ${item.tooth_number}` : "—",
      ITEM_STATUS_LABELS[item.status],
      formatCurrency(item.price),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      startY: y,
      head: [["#", "Procedimento", "Dente", "Status", "Valor"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [41, 41, 41],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 70 },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 30, halign: "center" },
        4: { cellWidth: 35, halign: "right" },
      },
      margin: { left: 14, right: 14 },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;

    // Totals
    const subtotal = plan.items.reduce((sum, item) => sum + item.price, 0);
    const total = Math.max(0, subtotal - plan.discount);

    doc.setFontSize(10);

    doc.text("Subtotal:", pageWidth - 80, y);
    doc.text(formatCurrency(subtotal), pageWidth - 14, y, { align: "right" });
    y += 7;

    if (plan.discount > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text("Desconto:", pageWidth - 80, y);
      doc.text(`-${formatCurrency(plan.discount)}`, pageWidth - 14, y, { align: "right" });
      doc.setTextColor(0);
      y += 7;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", pageWidth - 80, y);
    doc.text(formatCurrency(total), pageWidth - 14, y, { align: "right" });
    y += 15;

    // Notes
    if (plan.notes) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Observações: ${plan.notes}`, 14, y);
      y += 10;
    }

    // Signature lines
    y = Math.max(y + 20, 240);
    doc.setDrawColor(150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.line(14, y, 90, y);
    doc.text("Assinatura do Paciente", 14, y + 5);

    doc.line(pageWidth - 90, y, pageWidth - 14, y);
    doc.text("Assinatura do Profissional", pageWidth - 90, y + 5);

    y += 15;
    doc.text(`Data: ____/____/________`, 14, y);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Documento gerado em ${new Date().toLocaleString("pt-BR")} — ${clinicName}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    // Download
    const fileName = `orcamento_${patientName.replace(/\s+/g, "_").toLowerCase()}_${formatDate(plan.created_at).replace(/\//g, "-")}.pdf`;
    doc.save(fileName);
  },
};
