# 🎯 EXEMPLO DE USO - API N8N

## Endpoint da API

```
GET /api/business-hours
```

## Parâmetros

| Parâmetro  | Tipo   | Obrigatório | Descrição                               |
| ---------- | ------ | ----------- | --------------------------------------- |
| `date`     | string | ✅ Sim      | Data no formato YYYY-MM-DD              |
| `duration` | number | ❌ Não      | Duração do slot em minutos (padrão: 30) |

## Exemplos de Requisição

### Exemplo 1: Consultar horários para hoje (slots de 30 min)

```bash
curl "http://localhost:3000/api/business-hours?date=2024-01-27"
```

### Exemplo 2: Consultar horários com slots de 60 minutos

```bash
curl "http://localhost:3000/api/business-hours?date=2024-01-27&duration=60"
```

## Exemplos de Resposta

### Resposta quando está aberto:

```json
{
  "date": "2024-01-27",
  "is_open": true,
  "business_hours": {
    "open": "09:00",
    "close": "18:00"
  },
  "available_slots": [
    { "start": "09:00", "end": "09:30" },
    { "start": "09:30", "end": "10:00" },
    { "start": "10:00", "end": "10:30" },
    { "start": "10:30", "end": "11:00" },
    { "start": "11:00", "end": "11:30" },
    { "start": "11:30", "end": "12:00" },
    { "start": "13:00", "end": "13:30" },
    { "start": "13:30", "end": "14:00" },
    { "start": "14:00", "end": "14:30" },
    { "start": "14:30", "end": "15:00" },
    { "start": "15:00", "end": "15:30" },
    { "start": "15:30", "end": "16:00" },
    { "start": "16:00", "end": "16:30" },
    { "start": "16:30", "end": "17:00" },
    { "start": "17:00", "end": "17:30" },
    { "start": "17:30", "end": "18:00" }
  ],
  "duration_minutes": 30
}
```

**Observação:** Note que não há slots entre 12:00 e 13:00 (horário de almoço configurado nos breaks).

### Resposta quando está fechado:

```json
{
  "date": "2024-01-28",
  "is_open": false,
  "available_slots": [],
  "message": "Estabelecimento fechado neste dia"
}
```

## Integração com N8N

### Node HTTP Request

1. **Method:** GET
2. **URL:** `{{$env.BASE_URL}}/api/business-hours`
3. **Query Parameters:**
   - `date`: `{{$json.date}}`
   - `duration`: `30`

### Processamento da Resposta

```javascript
// Verificar se está aberto
if ($json.is_open === false) {
  return {
    message: "Desculpe, não temos atendimento neste dia.",
  };
}

// Listar horários disponíveis
const slots = $json.available_slots;
const options = slots.map((slot) => `${slot.start} - ${slot.end}`).join("\n");

return {
  message: `Horários disponíveis:\n${options}`,
};
```

## Validações Automáticas

A API já considera automaticamente:

- ✅ Horários de funcionamento (abertura/fechamento)
- ✅ Intervalos (almoço, pausas)
- ✅ Feriados (únicos e recorrentes)
- ✅ Bloqueios pontuais (reuniões, manutenção)

## Códigos de Status

| Código | Descrição                      |
| ------ | ------------------------------ |
| `200`  | Sucesso                        |
| `400`  | Parâmetro `date` não fornecido |
| `500`  | Erro interno do servidor       |

## Dicas

1. **Cache:** Considere cachear a resposta por alguns minutos
2. **Timezone:** A API usa UTC, ajuste conforme necessário
3. **Validação:** Sempre verifique `is_open` antes de mostrar slots
4. **Duração:** Use a duração do serviço como parâmetro `duration`
