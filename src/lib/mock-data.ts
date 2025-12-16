// Mock data for appointments, services, and professionals

export interface Service {
  id: number;
  name: string;
  duration: number; // in minutes
  color: string;
}

export interface Professional {
  id: number;
  name: string;
  specialty: string;
  color: string;
}

export interface Appointment {
  id: string;
  created_at: string;
  service_code: number;
  professional_code: number;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

export const services: Service[] = [
  { id: 1, name: "Consulta Geral", duration: 30, color: "bg-blue-500" },
  { id: 2, name: "Exame de Rotina", duration: 45, color: "bg-green-500" },
  { id: 3, name: "Retorno", duration: 20, color: "bg-purple-500" },
  {
    id: 4,
    name: "Procedimento Especial",
    duration: 60,
    color: "bg-orange-500",
  },
  { id: 5, name: "Avaliação", duration: 40, color: "bg-pink-500" },
];

export const professionals: Professional[] = [
  {
    id: 1,
    name: "Dr. João Silva",
    specialty: "Clínico Geral",
    color: "bg-blue-600",
  },
  {
    id: 2,
    name: "Dra. Maria Santos",
    specialty: "Cardiologista",
    color: "bg-green-600",
  },
  {
    id: 3,
    name: "Dr. Pedro Costa",
    specialty: "Ortopedista",
    color: "bg-purple-600",
  },
  {
    id: 4,
    name: "Dra. Ana Oliveira",
    specialty: "Dermatologista",
    color: "bg-orange-600",
  },
];

// Generate mock appointments for the next 7 days
export function generateMockAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  const today = new Date();

  // Generate appointments for 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    // Generate 5-8 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 4) + 5;

    for (let i = 0; i < appointmentsPerDay; i++) {
      const hour = 8 + Math.floor(Math.random() * 9); // 8am to 5pm
      const minute = Math.random() > 0.5 ? 0 : 30;

      const startTime = new Date(currentDate);
      startTime.setHours(hour, minute, 0, 0);

      const service = services[Math.floor(Math.random() * services.length)];
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + service.duration);

      const statuses: Appointment["status"][] = [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
      ];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      appointments.push({
        id: `apt-${day}-${i}`,
        created_at: new Date().toISOString(),
        service_code: service.id,
        professional_code:
          professionals[Math.floor(Math.random() * professionals.length)].id,
        customer_name: getRandomName(),
        customer_phone: getRandomPhone(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status,
      });
    }
  }

  return appointments.sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}

const firstNames = [
  "João",
  "Maria",
  "Pedro",
  "Ana",
  "Carlos",
  "Juliana",
  "Ricardo",
  "Fernanda",
  "Lucas",
  "Beatriz",
  "Rafael",
  "Camila",
  "Bruno",
  "Larissa",
  "Felipe",
];
const lastNames = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Costa",
  "Ferreira",
  "Rodrigues",
  "Almeida",
  "Nascimento",
  "Lima",
  "Araújo",
  "Fernandes",
  "Carvalho",
  "Gomes",
  "Martins",
];

function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomPhone(): string {
  const ddd = Math.floor(Math.random() * 20) + 11; // DDDs from 11 to 30
  const firstPart = Math.floor(Math.random() * 90000) + 10000;
  const secondPart = Math.floor(Math.random() * 9000) + 1000;
  return `(${ddd}) 9${firstPart}-${secondPart}`;
}
