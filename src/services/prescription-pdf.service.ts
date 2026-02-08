import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PrescriptionData {
  id: string;
  medication: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity?: string;
  instructions?: string;
}

export interface ProfessionalData {
  name: string;
  registration_number: string; // CRM/CRO
  specialty?: string;
}

export interface PatientData {
  name: string;
  birthdate?: string;
  age?: number;
}

export interface ClinicData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export class PrescriptionPDFService {
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_HEIGHT = 297; // A4 height in mm
  private static readonly MARGIN = 20;
  private static readonly LINE_HEIGHT = 7;

  /**
   * Generate a professional prescription PDF
   */
  static async generatePrescriptionPDF(
    prescriptions: PrescriptionData[],
    professional: ProfessionalData,
    patient: PatientData,
    clinic?: ClinicData
  ): Promise<Blob> {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let yPosition = this.MARGIN;

    // Header - Clinic Information
    yPosition = this.addClinicHeader(doc, clinic, yPosition);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(this.MARGIN, yPosition, this.PAGE_WIDTH - this.MARGIN, yPosition);
    yPosition += 10;

    // Professional Information
    yPosition = this.addProfessionalInfo(doc, professional, yPosition);

    // Patient Information
    yPosition = this.addPatientInfo(doc, patient, yPosition);

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(this.MARGIN, yPosition, this.PAGE_WIDTH - this.MARGIN, yPosition);
    yPosition += 10;

    // Prescription Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PRESCRIÇÃO MÉDICA", this.PAGE_WIDTH / 2, yPosition, {
      align: "center",
    });
    yPosition += 10;

    // Prescriptions List
    yPosition = this.addPrescriptions(doc, prescriptions, yPosition);

    // Footer - Date and Signature
    yPosition = this.addFooter(doc, yPosition);

    // Convert to Blob
    const pdfBlob = doc.output("blob");
    return pdfBlob;
  }

  /**
   * Add clinic header to PDF
   */
  private static addClinicHeader(
    doc: jsPDF,
    clinic: ClinicData | undefined,
    yPosition: number
  ): number {
    if (!clinic) {
      clinic = {
        name: "CLÍNICA ODONTOVIDA",
        address: "Endereço da Clínica",
        phone: "(00) 0000-0000",
        email: "contato@odontovida.com.br",
      };
    }

    // Clinic name
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(clinic.name.toUpperCase(), this.PAGE_WIDTH / 2, yPosition, {
      align: "center",
    });
    yPosition += this.LINE_HEIGHT;

    // Clinic details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const details = [clinic.address, clinic.phone, clinic.email]
      .filter(Boolean)
      .join(" • ");
    doc.text(details, this.PAGE_WIDTH / 2, yPosition, { align: "center" });
    yPosition += this.LINE_HEIGHT + 3;

    return yPosition;
  }

  /**
   * Add professional information
   */
  private static addProfessionalInfo(
    doc: jsPDF,
    professional: ProfessionalData,
    yPosition: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Dr(a). ${professional.name}`, this.MARGIN, yPosition);
    yPosition += this.LINE_HEIGHT;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const registration = `CRM/CRO: ${professional.registration_number}`;
    const specialty = professional.specialty
      ? ` - ${professional.specialty}`
      : "";
    doc.text(registration + specialty, this.MARGIN, yPosition);
    yPosition += this.LINE_HEIGHT + 3;

    return yPosition;
  }

  /**
   * Add patient information
   */
  private static addPatientInfo(
    doc: jsPDF,
    patient: PatientData,
    yPosition: number
  ): number {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Paciente: ${patient.name}`, this.MARGIN, yPosition);
    yPosition += this.LINE_HEIGHT;

    if (patient.age) {
      doc.text(`Idade: ${patient.age} anos`, this.MARGIN, yPosition);
      yPosition += this.LINE_HEIGHT;
    }

    const today = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
    doc.text(`Data: ${today}`, this.MARGIN, yPosition);
    yPosition += this.LINE_HEIGHT + 3;

    return yPosition;
  }

  /**
   * Add prescriptions list
   */
  private static addPrescriptions(
    doc: jsPDF,
    prescriptions: PrescriptionData[],
    yPosition: number
  ): number {
    doc.setFontSize(10);

    prescriptions.forEach((prescription, index) => {
      // Check if we need a new page
      if (yPosition > this.PAGE_HEIGHT - 60) {
        doc.addPage();
        yPosition = this.MARGIN;
      }

      // Medication number and name
      doc.setFont("helvetica", "bold");
      doc.text(
        `${index + 1}. ${prescription.medication}`,
        this.MARGIN,
        yPosition
      );
      yPosition += this.LINE_HEIGHT;

      doc.setFont("helvetica", "normal");

      // Dosage
      doc.text(`   Dose: ${prescription.dosage}`, this.MARGIN, yPosition);
      yPosition += this.LINE_HEIGHT;

      // Route
      doc.text(`   Via: ${prescription.route}`, this.MARGIN, yPosition);
      yPosition += this.LINE_HEIGHT;

      // Frequency
      doc.text(
        `   Frequência: ${prescription.frequency}`,
        this.MARGIN,
        yPosition
      );
      yPosition += this.LINE_HEIGHT;

      // Duration
      doc.text(`   Duração: ${prescription.duration}`, this.MARGIN, yPosition);
      yPosition += this.LINE_HEIGHT;

      // Quantity (optional)
      if (prescription.quantity) {
        doc.text(
          `   Quantidade: ${prescription.quantity}`,
          this.MARGIN,
          yPosition
        );
        yPosition += this.LINE_HEIGHT;
      }

      // Instructions (optional)
      if (prescription.instructions) {
        doc.text(
          `   Obs: ${prescription.instructions}`,
          this.MARGIN,
          yPosition
        );
        yPosition += this.LINE_HEIGHT;
      }

      yPosition += 3; // Space between prescriptions
    });

    return yPosition;
  }

  /**
   * Add footer with date and signature space
   */
  private static addFooter(doc: jsPDF, yPosition: number): number {
    // Ensure footer is at bottom of page
    yPosition = Math.max(yPosition + 20, this.PAGE_HEIGHT - 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Date and location
    const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    });
    const location = "São Paulo"; // TODO: Get from clinic data
    doc.text(`${location}, ${today}`, this.MARGIN, yPosition);
    yPosition += 20;

    // Signature line
    const signatureLineStart = this.MARGIN;
    const signatureLineEnd = this.PAGE_WIDTH / 2;
    doc.line(signatureLineStart, yPosition, signatureLineEnd, yPosition);
    yPosition += this.LINE_HEIGHT;

    // Signature label
    doc.setFontSize(9);
    doc.text("Assinatura e Carimbo do Profissional", this.MARGIN, yPosition);

    return yPosition;
  }

  /**
   * Download PDF file
   */
  static downloadPDF(blob: Blob, patientName: string): void {
    const today = format(new Date(), "yyyy-MM-dd");
    const fileName = `receita_${patientName.replace(/\s+/g, "_")}_${today}.pdf`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Print PDF directly
   */
  static printPDF(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 100);
    };
  }
}
