import { NpsStats, WeightedIndexResult, NpsQuestion, NpsOption, NpsAnswer, NpsResponse } from '@shared/nps-schema';

/**
 * Calcula NPS clássico a partir das notas 0-10
 * Baseado no PRD: NPS = (%Promotores - %Detratores) × 100
 * Margem de erro 95%: ME = 1.96 × √[(p + d - (p - d)²)/n] × 100
 */
export function calculateNpsFromScores(scores: number[]): NpsStats {
  const n = scores.length || 1;
  
  // Classificação NPS padrão
  const detractors = scores.filter(score => score <= 6).length;
  const passives = scores.filter(score => score >= 7 && score <= 8).length;
  const promoters = scores.filter(score => score >= 9).length;
  
  // Percentuais
  const detractorsPct = (detractors / n) * 100;
  const passivesPct = (passives / n) * 100;
  const promotersPct = (promoters / n) * 100;
  
  // Frações para cálculo de erro
  const d = detractors / n;  // fração de detratores
  const p = promoters / n;   // fração de promotores
  
  // NPS (-100 a +100)
  const npsDecimal = p - d;
  const nps = Math.round(npsDecimal * 100);
  
  // Margem de erro 95%
  const variance = (p + d - Math.pow(npsDecimal, 2)) / n;
  const margin95 = 1.96 * Math.sqrt(variance) * 100;
  
  return {
    nps,
    margin95: Math.round(margin95),
    totalResponses: n,
    promoters,
    passives,
    detractors,
    promotersPct: Math.round(promotersPct * 10) / 10,
    passivesPct: Math.round(passivesPct * 10) / 10,
    detractorsPct: Math.round(detractorsPct * 10) / 10
  };
}

/**
 * Calcula índice ponderado opcional (0-100)
 * Baseado no PRD: score_i = Σ(w_q × média das alternativas escolhidas)
 * Normalizado: (score_i + W) / (2W) × 100
 */
export function calculateWeightedIndex(
  questions: (NpsQuestion & { options: NpsOption[] })[],
  answers: NpsAnswer[]
): WeightedIndexResult {
  let totalWeight = 0;
  let totalScore = 0;
  
  for (const question of questions) {
    // Pular pergunta NPS principal
    if (question.type === 'nps') continue;
    
    const questionWeight = question.weight || 1.0;
    totalWeight += questionWeight;
    
    // Encontrar respostas para esta pergunta
    const questionAnswers = answers.filter(a => a.questionId === question.id);
    if (questionAnswers.length === 0) continue;
    
    // Calcular média dos pesos das alternativas escolhidas
    let altWeights: number[] = [];
    
    for (const answer of questionAnswers) {
      if (answer.optionId) {
        const option = question.options.find(o => o.id === answer.optionId);
        if (option && option.altWeight !== undefined) {
          altWeights.push(option.altWeight);
        }
      } else if (answer.valueNum !== undefined) {
        // Para perguntas de texto com valor numérico, mapear para peso
        // Ex: escala 1-5 -> pesos -1, -0.5, 0, 0.5, 1
        const normalized = mapScaleToWeight(answer.valueNum, 1, 5);
        altWeights.push(normalized);
      }
    }
    
    if (altWeights.length > 0) {
      const meanAltWeight = altWeights.reduce((sum, w) => sum + w, 0) / altWeights.length;
      totalScore += questionWeight * meanAltWeight;
    }
  }
  
  // Normalizar para 0-100
  if (totalWeight === 0) return { index: 50 }; // neutro
  
  const index = ((totalScore + totalWeight) / (2 * totalWeight)) * 100;
  return { index: Math.round(index * 10) / 10 };
}

/**
 * Mapeia valor numérico de escala para peso (-1 a +1)
 */
function mapScaleToWeight(value: number, min: number, max: number): number {
  const normalized = (value - min) / (max - min); // 0-1
  return (normalized * 2) - 1; // -1 a +1
}

/**
 * Calcula NPS Ajustado (experimental, interno)
 * Fórmula: α × NPS_decimal + (1-α) × (Index/100 - 0.5)
 */
export function calculateAdjustedNps(
  npsDecimal: number,
  weightedIndex: number,
  alpha: number = 0.8
): number {
  const indexCentered = (weightedIndex / 100) - 0.5; // -0.5 a +0.5
  const adjusted = alpha * npsDecimal + (1 - alpha) * indexCentered;
  return Math.round(adjusted * 100);
}

/**
 * Extrai scores NPS de um array de respostas
 */
export function extractNpsScores(
  responses: (NpsResponse & { answers: NpsAnswer[] })[],
  npsQuestionId: string
): number[] {
  const scores: number[] = [];
  
  for (const response of responses) {
    const npsAnswer = response.answers.find(a => a.questionId === npsQuestionId);
    if (npsAnswer && npsAnswer.valueNum !== undefined && npsAnswer.valueNum !== null) {
      scores.push(npsAnswer.valueNum);
    }
  }
  
  return scores;
}

/**
 * Calcula tendência de NPS ao longo do tempo
 */
export function calculateNpsTrends(
  responses: (NpsResponse & { answers: NpsAnswer[] })[],
  npsQuestionId: string,
  periodType: 'daily' | 'weekly' | 'monthly' = 'weekly'
): Array<{ period: string; nps: number; responses: number }> {
  if (responses.length === 0) return [];
  
  // Agrupar por período
  const groups = groupResponsesByPeriod(responses, periodType);
  
  const trends = [];
  for (const [period, periodResponses] of groups.entries()) {
    const scores = extractNpsScores(periodResponses, npsQuestionId);
    if (scores.length > 0) {
      const stats = calculateNpsFromScores(scores);
      trends.push({
        period,
        nps: stats.nps,
        responses: stats.totalResponses
      });
    }
  }
  
  return trends.sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Agrupa respostas por período
 */
function groupResponsesByPeriod(
  responses: NpsResponse[],
  periodType: 'daily' | 'weekly' | 'monthly'
): Map<string, NpsResponse[]> {
  const groups = new Map<string, NpsResponse[]>();
  
  for (const response of responses) {
    if (!response.submittedAt) continue;
    
    let periodKey: string;
    const date = new Date(response.submittedAt);
    
    switch (periodType) {
      case 'daily':
        periodKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!groups.has(periodKey)) {
      groups.set(periodKey, []);
    }
    groups.get(periodKey)!.push(response);
  }
  
  return groups;
}

/**
 * Calcula NPS por segmento
 */
export function calculateNpsBySegment(
  responses: (NpsResponse & { answers: NpsAnswer[] })[],
  npsQuestionId: string,
  segmentKey: string,
  getSegmentValue: (response: NpsResponse) => string | null
): Record<string, NpsStats> {
  const segments = new Map<string, NpsResponse[]>();
  
  // Agrupar por segmento
  for (const response of responses) {
    const segmentValue = getSegmentValue(response);
    if (segmentValue) {
      if (!segments.has(segmentValue)) {
        segments.set(segmentValue, []);
      }
      segments.get(segmentValue)!.push(response);
    }
  }
  
  // Calcular NPS para cada segmento
  const results: Record<string, NpsStats> = {};
  for (const [segment, segmentResponses] of segments.entries()) {
    const scores = extractNpsScores(segmentResponses, npsQuestionId);
    if (scores.length > 0) {
      results[segment] = calculateNpsFromScores(scores);
    }
  }
  
  return results;
}

/**
 * Valida se scores NPS estão no range correto (0-10)
 */
export function validateNpsScores(scores: number[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (scores.length === 0) {
    errors.push('Nenhuma resposta encontrada');
  }
  
  for (const score of scores) {
    if (score < 0 || score > 10 || !Number.isInteger(score)) {
      errors.push(`Score inválido: ${score}. Deve ser um número inteiro entre 0 e 10`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}