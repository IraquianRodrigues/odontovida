import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/types/financial";

interface ReportFilters {
  type?: "receita" | "despesa" | "all";
  professionalId?: number | "all";
  professionalName?: string;
  startDate?: string;
  endDate?: string;
}

interface ReportData {
  transactions: Transaction[];
  filters: ReportFilters;
  totalReceitas: number;
  totalDespesas: number;
  lucroLiquido: number;
}

export class PDFReportService {
  static generateFinancialReport(data: ReportData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Configurações de cores premium
    const gradientStart: [number, number, number] = [37, 99, 235]; // Blue-600
    const gradientEnd: [number, number, number] = [79, 70, 229]; // Indigo-600
    const accentColor: [number, number, number] = [59, 130, 246]; // Blue-500
    const textColor: [number, number, number] = [31, 41, 55]; // Gray-800
    const lightGray: [number, number, number] = [249, 250, 251]; // Gray-50
    
    let yPosition = 0;

    // ==================== CABEÇALHO PREMIUM COM GRADIENTE ====================
    // Simular gradiente com retângulos sobrepostos
    for (let i = 0; i < 50; i++) {
      const ratio = i / 50;
      const r = gradientStart[0] + (gradientEnd[0] - gradientStart[0]) * ratio;
      const g = gradientStart[1] + (gradientEnd[1] - gradientStart[1]) * ratio;
      const b = gradientStart[2] + (gradientEnd[2] - gradientStart[2]) * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(0, i * 1.2, pageWidth, 1.2, "F");
    }
    
    // Logo/Ícone (simulado com círculo)
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth / 2, 25, 8, "F");
    doc.setFillColor(...accentColor);
    doc.circle(pageWidth / 2, 25, 6, "F");
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("OdontoVida", pageWidth / 2, 45, { align: "center" });
    
    // Subtítulo
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Relatório Financeiro Detalhado", pageWidth / 2, 53, { align: "center" });
    
    // Badges de features (CRM + Automação + IA)
    yPosition = 62;
    const badgeWidth = 50;
    const badgeSpacing = 4;
    const totalBadgesWidth = (badgeWidth * 3) + (badgeSpacing * 2);
    let badgeX = (pageWidth - totalBadgesWidth) / 2;
    
    // Badge CRM
    doc.setFillColor(255, 255, 255, 0.2);
    doc.rect(badgeX, yPosition, badgeWidth, 8, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("🏢 CRM", badgeX + badgeWidth / 2, yPosition + 5.5, { align: "center" });
    
    // Badge Automação
    badgeX += badgeWidth + badgeSpacing;
    doc.rect(badgeX, yPosition, badgeWidth, 8, "F");
    doc.text("⚡ Automação", badgeX + badgeWidth / 2, yPosition + 5.5, { align: "center" });
    
    // Badge IA
    badgeX += badgeWidth + badgeSpacing;
    doc.rect(badgeX, yPosition, badgeWidth, 8, "F");
    doc.text("🤖 IA Integrada", badgeX + badgeWidth / 2, yPosition + 5.5, { align: "center" });
    
    // Data de geração
    yPosition = 73;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const reportDate = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Gerado automaticamente em: ${reportDate}`, pageWidth / 2, yPosition, { align: "center" });
    
    yPosition = 85;

    // ==================== FILTROS APLICADOS (CARD STYLE) ====================
    doc.setFillColor(...lightGray);
    doc.rect(14, yPosition, pageWidth - 28, 25, "F");
    
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("📋 Filtros Aplicados", 18, yPosition + 6);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    let filterY = yPosition + 12;
    
    // Tipo
    const tipoLabel = data.filters.type === "receita" 
      ? "Receitas" 
      : data.filters.type === "despesa" 
      ? "Despesas" 
      : "Todas as Transações";
    doc.text(`Tipo: ${tipoLabel}`, 18, filterY);
    
    // Profissional
    if (data.filters.professionalId && data.filters.professionalId !== "all") {
      doc.text(`Profissional: ${data.filters.professionalName || "N/A"}`, 80, filterY);
    }
    
    filterY += 5;
    
    // Período
    if (data.filters.startDate || data.filters.endDate) {
      const start = data.filters.startDate 
        ? new Date(data.filters.startDate).toLocaleDateString("pt-BR")
        : "Início";
      const end = data.filters.endDate 
        ? new Date(data.filters.endDate).toLocaleDateString("pt-BR")
        : "Hoje";
      doc.text(`Período: ${start} até ${end}`, 18, filterY);
    }
    
    yPosition += 32;

    // ==================== RESUMO FINANCEIRO (CARDS PREMIUM) ====================
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("💰 Resumo Financeiro", 14, yPosition);
    yPosition += 8;
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    };
    
    const cardWidth = (pageWidth - 28 - 8) / 3; // 3 cards com espaçamento
    const cardHeight = 28;
    
    // Card Receitas
    doc.setFillColor(220, 252, 231); // Green-100
    doc.rect(14, yPosition, cardWidth, cardHeight, "F");
    doc.setDrawColor(34, 197, 94); // Green-500
    doc.setLineWidth(0.5);
    doc.rect(14, yPosition, cardWidth, cardHeight, "S");
    
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // Green-800
    doc.setFont("helvetica", "normal");
    doc.text("💵 Receitas", 18, yPosition + 6);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74); // Green-600
    doc.text(formatCurrency(data.totalReceitas), 18, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.transactions.filter(t => t.type === "receita").length} transações`, 18, yPosition + 22);
    
    // Card Despesas
    const cardX2 = 14 + cardWidth + 4;
    doc.setFillColor(254, 226, 226); // Red-100
    doc.rect(cardX2, yPosition, cardWidth, cardHeight, "F");
    doc.setDrawColor(239, 68, 68); // Red-500
    doc.rect(cardX2, yPosition, cardWidth, cardHeight, "S");
    
    doc.setFontSize(8);
    doc.setTextColor(127, 29, 29); // Red-900
    doc.setFont("helvetica", "normal");
    doc.text("💸 Despesas", cardX2 + 4, yPosition + 6);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red-600
    doc.text(formatCurrency(data.totalDespesas), cardX2 + 4, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.transactions.filter(t => t.type === "despesa").length} transações`, cardX2 + 4, yPosition + 22);
    
    // Card Lucro Líquido
    const cardX3 = cardX2 + cardWidth + 4;
    const isProfit = data.lucroLiquido >= 0;
    const fillR = isProfit ? 219 : 254;
    const fillG = isProfit ? 234 : 226;
    const fillB = isProfit ? 254 : 226;
    doc.setFillColor(fillR, fillG, fillB); // Blue-100 or Red-100
    doc.rect(cardX3, yPosition, cardWidth, cardHeight, "F");
    const strokeR = isProfit ? 59 : 239;
    const strokeG = isProfit ? 130 : 68;
    const strokeB = isProfit ? 246 : 68;
    doc.setDrawColor(strokeR, strokeG, strokeB);
    doc.rect(cardX3, yPosition, cardWidth, cardHeight, "S");
    
    doc.setFontSize(8);
    doc.setTextColor(isProfit ? 30 : 127, isProfit ? 58 : 29, isProfit ? 138 : 29);
    doc.setFont("helvetica", "normal");
    doc.text(isProfit ? "📈 Lucro Líquido" : "📉 Prejuízo", cardX3 + 4, yPosition + 6);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const textR = isProfit ? 37 : 220;
    const textG = isProfit ? 99 : 38;
    const textB = isProfit ? 235 : 38;
    doc.setTextColor(textR, textG, textB);
    doc.text(formatCurrency(Math.abs(data.lucroLiquido)), cardX3 + 4, yPosition + 16);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const margin = data.totalReceitas > 0 ? ((data.lucroLiquido / data.totalReceitas) * 100).toFixed(1) : "0.0";
    doc.text(`Margem: ${margin}%`, cardX3 + 4, yPosition + 22);
    
    yPosition += cardHeight + 12;

    // ==================== TABELA DE TRANSAÇÕES (ESTILO MODERNO) ====================
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📊 Detalhamento de Transações", 14, yPosition);
    yPosition += 5;
    
    const tableData = data.transactions.map((t) => [
      new Date(t.due_date).toLocaleDateString("pt-BR"),
      t.client?.nome || "N/A",
      t.professional?.name || "N/A",
      t.type === "receita" ? "Receita" : "Despesa",
      t.category,
      formatCurrency(t.amount),
      t.status === "pago" ? "Pago" : t.status === "pendente" ? "Pendente" : "Atrasado",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Cliente", "Profissional", "Tipo", "Categoria", "Valor", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: gradientStart,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: {
        0: { cellWidth: 22, halign: "center" },
        1: { cellWidth: 32 },
        2: { cellWidth: 28 },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 28 },
        5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
        6: { cellWidth: 22, halign: "center" },
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        // Colorir status
        if (data.column.index === 6 && data.cell.section === "body") {
          const status = data.cell.raw as string;
          if (status === "Pago") {
            doc.setTextColor(22, 163, 74); // Green
          } else if (status === "Atrasado") {
            doc.setTextColor(220, 38, 38); // Red
          } else {
            doc.setTextColor(234, 179, 8); // Yellow
          }
        }
      },
    });
    
    // ==================== RODAPÉ PREMIUM ====================
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Linha decorativa
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
      
      // Informações do sistema
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.setFont("helvetica", "normal");
      doc.text(
        "Sistema OdontoVida - CRM com Automação e IA Integrada",
        14,
        pageHeight - 14
      );
      
      // Paginação
      doc.setFont("helvetica", "bold");
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 14,
        pageHeight - 14,
        { align: "right" }
      );
      
      // Website/contato (opcional)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(
        "Relatório gerado automaticamente pelo sistema",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }
    
    // Salvar PDF
    const fileName = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  }
}
