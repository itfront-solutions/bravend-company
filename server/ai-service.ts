import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIResponse {
  message: string;
  provider: 'openai' | 'gemini';
  timestamp: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

class AIService {
  private openaiClient: any;
  private geminiClient: any;

  constructor() {
    // Initialize OpenAI client
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialize Gemini client
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    context: string = "Você é um mentor especializado em governança corporativa, conselho de administração e estratégia empresarial. Forneça respostas precisas, práticas e baseadas em melhores práticas do mercado.",
    preferredProvider: 'openai' | 'gemini' = 'openai'
  ): Promise<AIResponse> {
    try {
      if (preferredProvider === 'openai' && this.openaiClient) {
        return await this.callOpenAI(messages, context);
      } else if (preferredProvider === 'gemini' && this.geminiClient) {
        return await this.callGemini(messages, context);
      } else {
        // Fallback to the available provider
        if (this.openaiClient) {
          return await this.callOpenAI(messages, context);
        } else if (this.geminiClient) {
          return await this.callGemini(messages, context);
        } else {
          throw new Error('Nenhum provedor de IA configurado');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      return {
        message: 'Desculpe, houve um erro ao processar sua solicitação. Tente novamente em alguns instantes.',
        provider: preferredProvider,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async callOpenAI(messages: ChatMessage[], context: string): Promise<AIResponse> {
    const systemMessage = { role: 'system' as const, content: context };
    const chatMessages = [
      systemMessage,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: chatMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return {
      message: response.choices[0].message.content || 'Resposta não disponível',
      provider: 'openai',
      timestamp: new Date().toISOString()
    };
  }

  private async callGemini(messages: ChatMessage[], context: string): Promise<AIResponse> {
    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    
    // Construir prompt combinado
    let prompt = context + '\n\n';
    messages.forEach(msg => {
      if (msg.role === 'user') {
        prompt += `Usuário: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistente: ${msg.content}\n`;
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      message: response.text() || 'Resposta não disponível',
      provider: 'gemini',
      timestamp: new Date().toISOString()
    };
  }

  // Specialized prompts for governance topics
  getGovernanceContext(topic: string): string {
    const contexts = {
      esg: `Você é um especialista em ESG (Environmental, Social and Governance) com ampla experiência em sustentabilidade corporativa, 
            responsabilidade social e boas práticas de governança. Forneça orientações práticas e baseadas em frameworks reconhecidos como GRI, SASB e TCFD.`,
      
      board: `Você é um consultor experiente em conselhos de administração, com conhecimento profundo sobre estrutura, composição, 
             funcionamento e melhores práticas de conselhos eficazes. Base suas respostas nas diretrizes do IBGC e práticas internacionais.`,
      
      strategy: `Você é um estrategista corporativo sênior, especializado em planejamento estratégico, gestão de riscos e tomada de decisões 
                executivas. Forneça insights baseados em frameworks como Porter's Five Forces, SWOT, OKRs e balanced scorecard.`,
      
      compliance: `Você é um especialista em compliance e auditoria corporativa, com profundo conhecimento em regulamentações, 
                  controles internos, gestão de riscos e frameworks de compliance como COSO e ISO 31000.`,
      
      leadership: `Você é um coach executivo experiente, especializado em desenvolvimento de liderança, gestão de equipes de alta performance 
                  e dinâmicas de conselho. Base suas recomendações em pesquisas atuais sobre liderança e neurociência aplicada aos negócios.`
    };

    return contexts[topic as keyof typeof contexts] || contexts.board;
  }
}

export const aiService = new AIService();