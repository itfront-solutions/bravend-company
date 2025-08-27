# BusinessQuest Integration Documentation

## Overview

O BusinessQuest foi integrado com sucesso ao sistema Carvion_Master como um submenu. Esta integração permite aos usuários acessar o simulador de negócios diretamente da plataforma principal.

## Arquivos Modificados

### 1. Navegação Principal
- **Arquivo**: `client/src/components/Navigation.tsx`
- **Mudanças**:
  - Adicionado ícone `Gamepad2` dos lucide-react
  - Adicionado item "Business Quest" na navegação principal
  - Rota: `/businessquest`

### 2. Roteamento Principal  
- **Arquivo**: `client/src/App.tsx`
- **Mudanças**:
  - Importação das páginas do BusinessQuest:
    - `BusinessQuestLanding` (Landing page)
    - `BusinessQuestHome` (Dashboard do jogo)
    - `BusinessQuestDecisionPhase2` (Fase de decisões estratégicas)
  - Adicionadas rotas:
    - `/businessquest` → Landing page
    - `/businessquest/home` → Dashboard principal
    - `/businessquest/phase2` → Decisões estratégicas

## Arquivos Criados

### 1. Páginas do BusinessQuest
```
client/src/pages/businessquest/
├── Landing.tsx          # Página inicial do BusinessQuest
├── Home.tsx             # Dashboard principal do simulador
└── DecisionPhase2.tsx   # Fase de decisões estratégicas
```

### 2. Componentes Específicos
```
client/src/components/businessquest/
└── BusinessDashboard.tsx # Dashboard adaptado do BusinessQuest original
```

## Funcionalidades Integradas

### 1. **Landing Page** (`/businessquest`)
- Apresenta o simulador "Nova Economia Simulator"
- Mostra features do jogo: decisões estratégicas, transformação progressiva, mentor virtual
- Informações sobre a empresa fictícia "MetalBrasil"
- Call-to-action para iniciar o simulador

### 2. **Dashboard Principal** (`/businessquest/home`)
- Indicadores de performance da empresa simulada
- Progresso da transformação digital
- Decisões do trimestre atual
- Estatísticas rápidas da empresa
- Integrado com o sistema de autenticação do Carvion_Master

### 3. **Fase de Decisões Estratégicas** (`/businessquest/phase2`)
- 4 categorias de decisões:
  - Parcerias Estratégicas
  - Expansão de Mercado
  - Sustentabilidade
  - Centro de Inovação
- Sistema de seleção de estratégias
- Cálculo de investimentos totais
- Resumo das decisões selecionadas

## Integração com Sistema Principal

### Autenticação
- O BusinessQuest usa o sistema de autenticação do Carvion_Master
- Redirecionamento automático para login se usuário não autenticado
- Integração com `useAuthStore` do Zustand

### Navegação
- Item "Business Quest" adicionado ao menu principal
- Ícone de gamepad para diferenciação visual
- Integração perfeita com a estrutura de navegação existente

### Roteamento
- Rotas aninhadas sob `/businessquest`
- Mantém a estrutura hierárquica do sistema
- Compatible com o sistema wouter existente

## Dependências

### Já Existentes no Sistema Principal
- React Query (@tanstack/react-query)
- Radix UI components
- Lucide React icons
- Tailwind CSS
- Wouter (roteamento)
- Zustand (gerenciamento de estado)

### Não Necessárias (removidas da integração)
- OpenAI (específica do BusinessQuest original)
- Memoizee (otimização específica)
- APIs externas específicas do BusinessQuest

## Como Usar

1. **Acesso ao BusinessQuest**:
   - Login no sistema principal
   - Clique em "Business Quest" no menu de navegação
   - Será direcionado para a landing page do simulador

2. **Iniciar Simulação**:
   - Na landing page, clique em "Iniciar Simulador"
   - Será direcionado para o dashboard principal do jogo

3. **Navegar pelas Fases**:
   - No dashboard, clique em "Fase 2 - Decisões Estratégicas"
   - Selecione estratégias para cada categoria
   - Confirme as decisões selecionadas

## Próximos Passos Sugeridos

### 1. **Integração Backend**
- Criar endpoints específicos para o BusinessQuest
- Implementar persistência dos dados do jogo
- Integrar com sistema de usuários existente

### 2. **Componentes Adicionais**
- Implementar componentes que estavam faltando (MentorChat, MarketData, etc.)
- Criar sistema de conquistas e badges
- Implementar eventos dinâmicos

### 3. **Melhorias de UX**
- Adicionar transições entre páginas
- Implementar estado persistente do jogo
- Melhorar responsividade mobile

### 4. **Integração com APIs**
- Conectar com APIs de dados de mercado (se necessário)
- Implementar IA para mentor virtual
- Integrar com sistema de analytics

## Estrutura de Dados

### Game Instance (Mock Data)
```typescript
interface GameInstance {
  currentStage: 'traditional' | 'digitized' | 'innovative';
  currentQuarter: number;
  currentYear: number;
  financialScore: number;
  transformationScore: number;
  leadershipScore: number;
}
```

### Decision Categories
```typescript
interface DecisionCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  options: DecisionOption[];
}
```

### Decision Options
```typescript
interface DecisionOption {
  value: string;
  label: string;
  description: string;
  shortTermImpact: string;
  longTermImpact: string;
  cost: number;
  benefit: string;
}
```

## Observações Importantes

1. **Sistema Mock**: Atualmente usa dados mock. Em produção, deve ser conectado a um backend real.

2. **Autenticação**: Totalmente integrada com o sistema principal. Usuários logados no Carvion_Master têm acesso automático.

3. **Roteamento**: Todas as rotas do BusinessQuest são prefixadas com `/businessquest` para evitar conflitos.

4. **Componentes**: Reutiliza componentes UI do sistema principal (botões, cards, etc.) para consistência visual.

5. **Estado**: Usa React Query para gerenciamento de estado das chamadas de API (preparado para integração backend).

A integração está funcional e pronta para uso, faltando apenas a implementação do backend para persistir dados do jogo.