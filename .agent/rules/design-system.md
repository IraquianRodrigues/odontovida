---
trigger: always_on
glob:
description: Design System Fresh Health para OdontoVida
---

# Design System — OdontoVida (Tema: Fresh Health)

## 1. Visão Geral

O **OdontoVida** adota uma identidade visual **"Fresh Health"**. A interface prioriza a clareza, a higiene e a tecnologia. O uso abundante de espaço em branco (`White Space`) transmite limpeza, enquanto o **Verde Limão** atua como um guia visual energético, destacando ações e progressos sem causar ansiedade.

**Filosofia Visual:**

- **Clean & Clinical:** Fundos claros para máxima legibilidade.
- **Acessibilidade:** Alto contraste entre texto (cinza chumbo) e fundo.
- **Energia:** O Verde Limão é usado estritamente para ações, status positivo e brand.

---

## 2. Paleta de Cores & Tokens

### 2.1. Brand (Identidade)

_A cor principal que define a marca._

| Token               | Valor (Hex) | Aplicação                                  |
| :------------------ | :---------- | :----------------------------------------- |
| **`brand-primary`** | `#84CC16`   | Cor da marca (Lime-500), Ícones principais |
| **`brand-dark`**    | `#3F6212`   | Texto sobre fundos verde-limão (Lime-800)  |
| **`brand-light`**   | `#ECFCCB`   | Fundos decorativos sutis (Lime-100)        |

### 2.2. Texto (Typography Colors)

_Preto puro (#000000) é evitado para reduzir o cansaço visual._

| Token                | Valor (Hex) | Aplicação                                                                |
| :------------------- | :---------- | :----------------------------------------------------------------------- |
| **`text-primary`**   | `#18181B`   | Títulos, Números de KPI, Texto corrido (Zinc-900)                        |
| **`text-secondary`** | `#71717A`   | Legendas, datas, labels de inputs (Zinc-500)                             |
| **`text-muted`**     | `#A1A1AA`   | Placeholders, ícones inativos (Zinc-400)                                 |
| **`text-on-dark`**   | `#FFFFFF`   | Texto sobre botões escuros ou tooltips                                   |
| **`text-on-brand`**  | `#FFFFFF`   | Texto dentro de botões Primary (se o contraste permitir) ou `brand-dark` |

### 2.3. Superfícies (Backgrounds)

| Token                  | Valor (Hex) | Aplicação                                      |
| :--------------------- | :---------- | :--------------------------------------------- |
| **`surface-page`**     | `#F8FAFC`   | Fundo da tela inteira (Slate-50 - branco frio) |
| **`surface-section`**  | `#FFFFFF`   | Menu lateral (Sidebar)                         |
| **`surface-card`**     | `#FFFFFF`   | Cards e Widgets (Branco puro)                  |
| **`surface-subtle`**   | `#F4F4F5`   | Hover em linhas de tabelas, áreas secundárias  |
| **`surface-elevated`** | `#FFFFFF`   | Modais e Popovers (com sombra forte)           |

### 2.4. Ações (Botões e Links)

| Token                       | Valor (Hex) | Aplicação                                       |
| :-------------------------- | :---------- | :---------------------------------------------- |
| **`action-primary`**        | `#84CC16`   | Botões principais (Salvar, Novo)                |
| **`action-primary-hover`**  | `#65A30D`   | Hover do botão principal (escurece levemente)   |
| **`action-primary-active`** | `#4D7C0F`   | Click do botão principal                        |
| **`action-secondary`**      | `#F4F4F5`   | Botões de Cancelar ou Voltar                    |
| **`action-strong`**         | `#18181B`   | CTAs alternativos (Preto para contraste máximo) |

### 2.5. Bordas (Borders)

| Token                | Valor (Hex) | Aplicação                             |
| :------------------- | :---------- | :------------------------------------ |
| **`border-default`** | `#E4E4E7`   | Bordas de cards e inputs padrão       |
| **`border-subtle`**  | `#F4F4F5`   | Divisórias muito leves                |
| **`border-focus`**   | `#84CC16`   | Ring ao focar no input (Cor da marca) |

### 2.6. Status (Feedback)

| Token                | Valor (Hex) | Aplicação                         |
| :------------------- | :---------- | :-------------------------------- |
| **`status-success`** | `#84CC16`   | Confirmações (Usa a cor da marca) |
| **`status-warning`** | `#F59E0B`   | Alertas, pacientes aguardando     |
| **`status-error`**   | `#EF4444`   | Erros, faltas, cancelamentos      |

---

## 3. Tipografia

| Token           | Tamanho | Peso            | Uso                              |
| :-------------- | :------ | :-------------- | :------------------------------- |
| **`text-xs`**   | 12px    | `font-medium`   | Badges, legendas de gráficos     |
| **`text-sm`**   | 14px    | `font-normal`   | Corpo de tabelas, texto de apoio |
| **`text-base`** | 16px    | `font-normal`   | Corpo padrão, Inputs             |
| **`text-lg`**   | 18px    | `font-semibold` | Destaques em cards               |
| **`text-xl`**   | 20px    | `font-semibold` | Subtítulos de seção              |
| **`text-2xl`**  | 24px    | `font-bold`     | Títulos de página                |
| **`text-3xl`**  | 30px    | `font-bold`     | KPIs (Números grandes)           |
| **`text-4xl`**  | 36px    | `font-bold`     | Headlines                        |

---

## 4. Espaçamento & Layout

_Escala de 4px grid system._

- **`space-1`**: 4px
- **`space-2`**: 8px
- **`space-3`**: 12px
- **`space-4`**: 16px (Padding padrão de células)
- **`space-6`**: 24px (Padding interno de Cards)
- **`space-8`**: 32px (Gap entre seções)

---

## 5. Componentes Principais

### 5.1. Botão Primário (Action)

O botão principal da interface.

- **Background:** `action-primary`
- **Texto:** `text-on-brand` (Branco) _ou_ `brand-dark` (para maior acessibilidade)
- **Radius:** `radius-md` (8px) ou `radius-full` (Pill shape)
- **Shadow:** `shadow-button-primary` (Sombra suave esverdeada)

### 5.2. Dashboard Card (Widget)

- **Background:** `surface-card` (Branco)
- **Borda:** `border-default` (1px sólido #E4E4E7)
- **Radius:** `radius-xl`
- **Shadow:** `shadow-sm`
- **Comportamento:** Ícones devem usar `brand-primary` como cor, talvez com um fundo circular em `brand-light`.

### 5.3. Sidebar Navigation Item

- **Default:** Texto `text-secondary`, Fundo Transparente.
- **Hover:** Texto `text-primary`, Fundo `surface-subtle`.
- **Active:** Texto `brand-dark`, Fundo `brand-light` (Verde muito claro), Borda lateral direita em `brand-primary`.

### 5.4. Inputs (Formulários)

- **Background:** `surface-card`
- **Borda:** `border-default`
- **Focus:** Borda muda para `border-focus` (`brand-primary`) e adiciona `ring` externo difuso.
