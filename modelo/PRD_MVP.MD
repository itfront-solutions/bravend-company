Visão rápida

Dois modos de pontuação

NPS Clássico (recomendado): 1 pergunta padrão “Qual a probabilidade de nos recomendar?” (0–10). Resultado = %Promotores (9–10) − %Detratores (0–6).

Índice Ponderado (opcional): além do NPS clássico, você pode atribuir pesos a perguntas/alternativas diagnósticas e gerar um “NPS Ajustado” (para uso interno). Obs.: não compare externamente — só o NPS clássico é benchmarkável.

Funcionalidades-chave

Criar questionários (builder drag-and-drop simples).

Atribuir pesos a perguntas e pesos por alternativa (quando fizer sentido).

Enviar por e-mail/WhatsApp/QR-code, com links únicos por contato.

Coletar respostas anonimizadas ou identificadas.

Calcular NPS, NPS por segmento, erro amostral, tendência ao longo do tempo.

Dashboard com funil detrator/neutral/promotor (como nas imagens) e comentários abertos.

Exportar CSV/Excel, webhooks e API.

Estrutura de Menu / Opções

Questionários

Criar novo

Modelos (NPS curto, NPS + diagnóstico, Pós-suporte, Pós-compra)

Editar

Lógica de exibição (pular/ramificar)

Biblioteca de Perguntas

Pergunta NPS (bloqueada como obrigatória no modo clássico)

Escala Likert (1–5 / 0–10)

Múltipla escolha (única/múltipla) — com peso por alternativa

Nota/estrelas/slider

Texto aberto

Pesos & Cálculo

Ativar Índice Ponderado (on/off)

Peso da pergunta (0–1, default 1)

Peso por alternativa (−1 a +1, default 0) — opcional

Fórmula do índice (pré-visualização)

Envio

Lista de contatos / import CSV

Canal (e-mail/WhatsApp/Link/QR)

Reminders (X dias)

Janela de coleta (data fim)

Resultados

NPS geral (com erro amostral)

NPS por pergunta filtro/segmento

Índice Ponderado (se ativado)

Comentários (nuvem de temas + sentimentos)

Exportar / Conectar (Webhook/API)

Configurações

Identificação (anônimo vs identificado)

Consentimento & LGPD

Idiomas/branding

Tokens anti-fraude

Regras do NPS (essencial)

Classificação:

0–6 = Detrator

7–8 = Neutro

9–10 = Promotor

Fórmula do NPS:
NPS = (%Promotores − %Detratores) × 100 (intervalo: −100 a +100)

Erro amostral do NPS (95%):
Seja p = frac_promotores, d = frac_detratores, n = total.
Variância: Var(NPS_decimal) = (p + d − (p − d)^2) / n
Erro 95% em pontos de NPS: ME = 1.96 × sqrt(Var) × 100
Exibir como: NPS = 42 ± 6 pts (n=320)

Como lidar com “pesos” sem quebrar o NPS

Sempre calcule e exiba o NPS clássico.

Em paralelo, calcule um Índice Ponderado (0–100) para sua análise interna:

Para cada pergunta diagnóstica q, defina peso da pergunta w_q (0–1).

Para cada resposta/alternativa, mapear peso de alternativa a ∈ [−1, +1] (impacto relativo).

Para cada respondente i, compute a pontuação diagnóstica:
score_i = Σ_q ( w_q × média_das_alternativas_escolhidas(a) )

Normalize para 0–100:
Indice_i = (score_i + W) / (2W) × 100, onde W = Σ_q w_q

NPS Ajustado (opcional): combine NPS decimal com o índice:
NPS_Ajustado = α × NPS_decimal + (1−α) × (Indice_médio/100 − 0.5)
(α padrão 0.8). Exiba com rótulo “interno/experimental”.

Modelo de dados (SQL simples)
-- questionários
CREATE TABLE surveys (
  id UUID PRIMARY KEY,
  name TEXT, status TEXT, language TEXT,
  has_weighted_index BOOLEAN DEFAULT false,
  alpha_weight NUMERIC DEFAULT 0.8, -- para NPS ajustado
  created_at TIMESTAMP, updated_at TIMESTAMP
);

-- perguntas
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  type TEXT, -- nps|likert|single|multi|rating|text
  title TEXT, required BOOLEAN DEFAULT true,
  weight NUMERIC DEFAULT 1.0, -- peso da pergunta
  order_idx INT
);

-- alternativas (quando aplicável)
CREATE TABLE options (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES questions(id),
  label TEXT,
  value_num NUMERIC, -- ex: 0..10 (para likert), 1..5, etc.
  alt_weight NUMERIC DEFAULT 0, -- peso da alternativa (-1..+1)
  order_idx INT
);

-- convites enviados
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  contact_id UUID,
  channel TEXT, token TEXT UNIQUE,
  sent_at TIMESTAMP, reminder_count INT DEFAULT 0
);

-- respostas
CREATE TABLE responses (
  id UUID PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id),
  invitation_id UUID REFERENCES invitations(id),
  respondent_id UUID, -- opcional/anon
  submitted_at TIMESTAMP
);

-- respostas por pergunta
CREATE TABLE answers (
  id UUID PRIMARY KEY,
  response_id UUID REFERENCES responses(id),
  question_id UUID REFERENCES questions(id),
  option_id UUID, -- null para texto aberto
  value_text TEXT,
  value_num NUMERIC
);

Cálculo (pseudocódigo)
function computeNPS(answersNps: number[]): {nps: number, margin: number} {
  const n = answersNps.length;
  const detr = answersNps.filter(v => v <= 6).length / n;
  const neut = answersNps.filter(v => v >= 7 && v <= 8).length / n; // só informativo
  const prom = answersNps.filter(v => v >= 9).length / n;

  const npsDecimal = prom - detr;        // −1..+1
  const nps = Math.round(npsDecimal * 100);

  // erro 95%
  const variance = (prom + detr - Math.pow(npsDecimal, 2)) / n;
  const margin = 1.96 * Math.sqrt(variance) * 100; // pontos NPS
  return { nps, margin: Math.round(margin) };
}


Índice Ponderado (opcional)

function computeWeightedIndex(survey, response): number {
  // soma ponderada por pergunta e por alternativa
  let W = 0, S = 0;
  for (const q of survey.questions) {
    if (!q.weight) continue;
    W += q.weight;

    // média de pesos das alternativas escolhidas (multi -> média; única -> valor direto; likert -> usar alt_weight associado ao value_num)
    const chosenAltWeights = getAltWeightsChosen(q, response);
    if (chosenAltWeights.length === 0) continue;

    const meanAlt = chosenAltWeights.reduce((a,b)=>a+b,0)/chosenAltWeights.length; // −1..+1
    S += q.weight * meanAlt;
  }
  if (W === 0) return 50; // neutro
  // normaliza para 0..100
  return ( (S + W) / (2*W) ) * 100;
}


NPS Ajustado (interno/experimental)

function computeAdjustedNPS(npsDecimal, weightedIndex0to100, alpha=0.8): number {
  const idxCentered = (weightedIndex0to100/100) - 0.5; // −0.5..+0.5
  const adjusted = alpha * npsDecimal + (1-alpha) * idxCentered; // −1..+1
  return Math.round(adjusted * 100); // pontos NPS
}

API (exemplo REST)

POST /surveys – cria questionário

POST /surveys/:id/questions – adiciona pergunta

POST /surveys/:id/questions/:qid/options – adiciona alternativa (com alt_weight)

POST /surveys/:id/publish – publica e gera link

POST /surveys/:id/invitations – envia convites (payload: contatos, canal, template)

GET /surveys/:id/results/nps – retorna {nps, margin, n, promoters, passives, detractors}

GET /surveys/:id/results/weighted – retorna {index0to100, adjustedNps}

GET /surveys/:id/responses?segment=... – segmentação

Webhook: POST /hooks/response-created

Especificação do Builder (o que seu time vai implementar)

Tela de Perguntas

Arrastar/soltar blocos.

Pergunta NPS vem pronta com escala 0–10 (bloquear edição da escala).

Para perguntas diagnósticas:

Campo Peso da pergunta (0–1).

Em cada alternativa, Peso da alternativa (−1..+1).

Mapear Likert para alternativas com alt_weight automático (ex.: −1, −0.5, 0, +0.5, +1) com opção de editar.

Pré-visualização do cálculo (mini-painel à direita mostra NPS clássico e Índice Ponderado dummy enquanto o usuário edita pesos).

Validações

Não publicar sem a pergunta NPS (modo clássico).

Somatório de pesos de perguntas > 0 quando índice ponderado estiver ativado.

Acessibilidade e mobile-first.

Fluxo de Envio

Importar contatos (CSV ou integração) com opt-in e campos de segmento.

Gerar tokens únicos por convite (/survey/:id?t=token).

E-mail com CTA grande e tempo de resposta < 1 minuto (3–5 perguntas).

Lembrete automático após 3 e 7 dias se não respondeu.

Página de obrigado + link para comentário aberto (opcional).

LGPD: base legal, consentimento, opt-out claro, retenção configurável.

Dashboard (como nas imagens)

Header: “Quão provável…” (escala 0–10 com ícones).

Barras: % detratores, neutros, promotores.

Resultado: NPS = X ± Y (n=Z) com tooltip da fórmula e intervalo de confiança.

Filtros: período, canal, produto, equipe, CSM, região.

Tendência: linha de NPS semanal/mensal.

Tabela de comentários: tagueamento automático por tema/sentimento.

Botões: Exportar CSV/Excel, Copiar link, Reenviar lembrete.

Exemplo de Questionário (JSON)
{
  "id": "srv_123",
  "name": "NPS Pós-Entrega",
  "has_weighted_index": true,
  "alpha_weight": 0.8,
  "questions": [
    {
      "id": "q_nps",
      "type": "nps",
      "title": "Qual a probabilidade de recomendar nossa empresa a um amigo ou colega?",
      "required": true
    },
    {
      "id": "q_vel",
      "type": "likert",
      "title": "A velocidade de entrega atendeu às suas expectativas?",
      "weight": 1.0,
      "options": [
        {"label":"Muito abaixo", "value_num":1, "alt_weight":-1.0},
        {"label":"Abaixo",       "value_num":2, "alt_weight":-0.5},
        {"label":"Na média",     "value_num":3, "alt_weight":0.0},
        {"label":"Acima",        "value_num":4, "alt_weight":0.5},
        {"label":"Muito acima",  "value_num":5, "alt_weight":1.0}
      ]
    },
    {
      "id": "q_suporte",
      "type": "single",
      "title": "Como avalia o suporte?",
      "weight": 0.7,
      "options": [
        {"label":"Ruim",   "alt_weight":-1.0},
        {"label":"Médio",  "alt_weight":-0.2},
        {"label":"Bom",    "alt_weight":0.4},
        {"label":"Ótimo",  "alt_weight":1.0}
      ]
    },
    {
      "id": "q_aberto",
      "type": "text",
      "title": "O que poderíamos melhorar?",
      "required": false
    }
  ]
}

“Prompt” de criação da funcionalidade (para você colar na task do time)

Objetivo: Implementar um Criador de Questionários NPS com cálculo de NPS Clássico, Erro Amostral e Índice Ponderado (opcional), envio de convites e dashboard.
Requisitos indispensáveis:

Builder com pergunta NPS 0–10 obrigatória no modo clássico.

Permitir peso por pergunta (0–1) e peso por alternativa (−1..+1) para perguntas diagnósticas.

Cálculos:

NPS = (%Prom − %Det) × 100

ME95 = 1.96 × sqrt((p + d − (p − d)^2)/n) × 100

Índice Ponderado (0–100) conforme especificação, e NPS Ajustado opcional.

Envio com tokens únicos, lembretes, links rastreáveis, opt-out e LGPD.

Dashboard: distribuição Det/Neu/Prom, NPS ± erro, tendência temporal, filtros, exportação.

API REST conforme endpoints listados; webhooks para resposta criada.

Testes unitários dos cálculos com casos de borda (n pequeno, tudo 10, tudo 0).

Documentação de uso e aviso de que o índice ajustado é interno (não comparar externamente).

Exemplo de implementação (Node/TypeScript – cálculo)
type NpsStats = { nps: number; margin95: number; n: number; p: number; d: number; };
export function npsFromScores(scores0to10: number[]): NpsStats {
  const n = scores0to10.length || 1;
  const dN = scores0to10.filter(v => v <= 6).length;
  const pN = scores0to10.filter(v => v >= 9).length;
  const d = dN / n, p = pN / n;
  const npsDec = p - d;
  const variance = (p + d - Math.pow(npsDec, 2)) / n;
  const margin95 = 1.96 * Math.sqrt(variance) * 100;
  return { nps: Math.round(npsDec * 100), margin95: Math.round(margin95), n, p, d };
}





Product Requirements Document (PRD) for NPS Survey Tool
1. Overview
1.1 Product Name
NPS Survey Platform
1.2 Product Description
The NPS Survey Platform is a web-based tool designed to create, distribute, and analyze Net Promoter Score (NPS) surveys. It supports two scoring modes: the classic NPS for benchmarking and an optional Weighted Index for internal analysis. The platform enables users to build customizable questionnaires, send surveys via multiple channels, collect responses, and visualize results through dashboards. It emphasizes ease of use, compliance (e.g., LGPD/GDPR), and accurate calculations with error margins.
1.3 Target Audience

Businesses and organizations conducting customer satisfaction surveys (e.g., e-commerce, support teams, product managers).
Users with varying technical skills, from marketers to data analysts.
Focus on small to medium enterprises initially, with scalability for larger ones.

1.4 Business Goals

Provide a simple, drag-and-drop builder for NPS surveys to reduce setup time.
Ensure accurate NPS calculations with statistical error margins for reliable insights.
Allow internal experimentation via Weighted Index without compromising standard NPS comparability.
Facilitate multi-channel distribution and response tracking for high response rates.
Enable data export and integration for seamless workflows.

1.5 Key Metrics for Success

User adoption: 100+ surveys created in the first month post-launch.
Response rate: Average >20% per survey.
NPS of the platform itself: Target >50.
Error-free calculations validated through unit tests.

1.6 Assumptions and Dependencies

Users have basic knowledge of NPS concepts.
Integration with email/WhatsApp services (e.g., via APIs like Twilio or SendGrid).
No external dependencies for core calculations (all handled server-side).
Compliance with data privacy laws (LGPD in Brazil, GDPR equivalent).

1.7 Scope

In Scope: Survey builder, distribution, response collection, NPS/Weighted Index calculations, basic dashboard, API/webhooks.
Out of Scope: Advanced AI analytics (beyond basic sentiment tagging), mobile app, real-time collaboration.

2. Features and Functional Requirements
2.1 Scoring Modes

Classic NPS (Recommended/Default): Single mandatory question: "Qual a probabilidade de nos recomendar?" (0-10 scale).

Classification: 0-6 = Detractor, 7-8 = Neutral, 9-10 = Promoter.
Formula: NPS = (%Promoters - %Detractors) × 100 (range: -100 to +100).
Error Margin (95% confidence): ME = 1.96 × √[(p + d - (p - d)²)/n] × 100, where p = %Promoters, d = %Detractors, n = sample size.
Display: e.g., "NPS = 42 ± 6 pts (n=320)".


Weighted Index (Optional, Internal Use Only): Activated via toggle; not benchmarkable externally.

Assign weights to diagnostic questions (0-1, default 1).
Assign weights to options (-1 to +1, default 0).
Per-respondent score: score_i = Σ (w_q × mean(alt_weights chosen)).
Normalized Index (0-100): (score_i + W) / (2W) × 100, where W = Σ w_q.
Adjusted NPS (Experimental): α × NPS_decimal + (1-α) × (Index/100 - 0.5), default α=0.8.
Always compute and display classic NPS in parallel.



2.2 Core Functionalities

Survey Builder:

Drag-and-drop interface for adding/ordering questions.
Mandatory NPS question in classic mode (locked 0-10 scale).
Question types: NPS, Likert (1-5/0-10), Multiple Choice (single/multi with weights), Rating/Stars/Slider, Open Text.
Logic: Skip/branching based on responses.
Weights: Per question (0-1) and per option (-1 to +1); auto-map for Likert (e.g., -1 for "Muito abaixo").
Preview: Real-time dummy NPS and Weighted Index visualization.
Templates: NPS Short, NPS + Diagnostic, Post-Support, Post-Purchase.
Validations: NPS question required; weights sum >0 if Weighted Index active.


Question Library:

Pre-built questions with types as above.
NPS question locked as mandatory in classic mode.


Distribution:

Channels: Email, WhatsApp, QR Code, Unique Links.
Contact Management: Import CSV, add segments (e.g., region, product).
Invitations: Unique tokens for tracking; anti-fraud measures.
Reminders: Auto-send after X days (e.g., 3/7 days).
Collection Window: Set end date.
Response Types: Anonymous or Identified (with consent).


Results and Analytics:

Calculations: NPS overall/by segment, error margin, trends over time.
Dashboard: Funnel (Detractor/Neutral/Promoter bars), open comments (word cloud + sentiment), filters (period, channel, segment).
Weighted Index: Display if activated; per-response and aggregate.
Exports: CSV/Excel.
Integrations: Webhooks (e.g., on response created), API for results.


Settings:

Anonymity toggle.
Consent/LGPD: Opt-in, opt-out, retention policies.
Branding/Languages: Custom logos, multi-language support.
Security: Anti-fraud tokens.



2.3 User Flows

Create Survey: Login → Questionários → Criar Novo → Add questions via builder → Set weights → Preview → Publish.
Distribute: Select survey → Envio → Import contacts → Choose channel → Schedule reminders → Send.
Respond: Receive link → Answer (mobile-first) → Submit → Thank you page with optional open comment.
Analyze: Resultados → View dashboard → Apply filters → Export.

2.4 Non-Functional Requirements

Performance: Response time <2s for calculations; handle 1,000 responses/survey.
Security: HTTPS, token-based auth, data encryption, LGPD compliance (consent, deletion).
Accessibility: WCAG 2.1 compliant; mobile-first design.
Scalability: Cloud-based (e.g., AWS); support 10,000+ users.
Reliability: 99.9% uptime; backups; error handling in calculations.
Tech Stack: Backend (Node/TypeScript), Database (SQL as provided), Frontend (React for builder/dashboard).

3. Data Model
Use the provided SQL schema:

Tables: surveys, questions, options, invitations, responses, answers.
Key Fields: Weights in questions/options, has_weighted_index in surveys.

4. Calculations

NPS: As pseudocode provided.
Error Margin: Integrated into NPS function.
Weighted Index: As pseudocode; normalize to 0-100.
Adjusted NPS: Optional combination.
Implement unit tests for edge cases (n=1, all 0s, all 10s).

5. API Specification
RESTful endpoints as listed:

POST /surveys
POST /surveys/:id/questions
POST /surveys/:id/questions/:qid/options
POST /surveys/:id/publish
POST /surveys/:id/invitations
GET /surveys/:id/results/nps
GET /surveys/:id/results/weighted
GET /surveys/:id/responses
Webhook: POST /hooks/response-created

6. UI/UX Specifications

Builder: Drag-and-drop blocks; right-side preview panel.
Dashboard: Header with NPS question, bars for distribution, trend line, comment table with auto-tagging.
Mobile-First: Responsive design; large CTAs for surveys.
Example JSON: Use as template for data exchange.

7. Risks and Mitigations

Risk: Misuse of Weighted Index for external benchmarks → Mitigation: Clear warnings/labels.
Risk: Low response rates → Mitigation: Reminders and easy links.
Risk: Calculation errors → Mitigation: Unit tests and formula tooltips.
Risk: Data privacy breaches → Mitigation: Consent flows and audits.

8. Timeline and Resources

Design: 2 weeks.
Development: 8 weeks (builder 3w, distribution 2w, analytics 3w).
Testing: 2 weeks.
Launch: MVP in 3 months.

9. Appendix

Example Implementation: Node/TypeScript NPS function as provided.
Prompt for Dev Team: Copy the provided "Prompt" for task creation.

Minimum Viable Product (MVP) Definition
The MVP focuses on core NPS functionality to validate the product idea with minimal features, targeting quick launch and user feedback. It includes only essential elements from the PRD, excluding advanced options like Weighted Index for simplicity.
MVP Scope

Scoring: Classic NPS only (no Weighted Index or Adjusted NPS).
Builder:

Drag-and-drop with mandatory NPS question and basic types (Likert, Multiple Choice, Open Text).
No weights, branching logic, or templates (add manually).
Basic preview (no dummy calculations).


Distribution:

Email and Link/QR only (no WhatsApp).
Manual contact import (CSV); unique tokens.
No reminders or collection windows.


Responses:

Anonymous only.
Basic collection and storage.


Analytics:

NPS calculation with error margin.
Simple dashboard: Overall NPS, distribution bars, comment list (no word cloud/sentiment).
No segments, trends, or filters.
Export: CSV only.


Settings:

Basic LGPD consent.
No branding/languages beyond default (Portuguese/English).


API: Limited to create survey, add questions, get NPS results (no webhooks).
Data Model: Simplified schema (surveys, questions, options, responses, answers).
Calculations: NPS and error margin only; use provided pseudocode.
UI/UX: Mobile-first builder and dashboard; accessibility basics.

MVP Exclusions

Weighted Index and all related weights/calculations.
Advanced distribution (WhatsApp, reminders).
Full dashboard (trends, filters, sentiment).
API/webhooks beyond basics.
Templates, logic, multi-language.

MVP Success Criteria

50 surveys created and 500 responses collected in first month.
Bug-free NPS calculations.
User feedback on builder ease (>70% satisfaction).