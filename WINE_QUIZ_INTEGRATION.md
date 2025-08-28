# Integração do Módulo Vinhonarios - Vinhos & Visões

## Resumo das Mudanças Implementadas

Este documento detalha as modificações realizadas para integrar o projeto WineQuizMobile_new como um submenu no sistema Carvion_Master.

### 1. Menu Lateral Esquerdo (LTR) ✅

- **Arquivo modificado**: `client/src/store/layout.ts`
- **Mudança**: Layout padrão alterado de `'top-navigation'` para `'left-sidebar'`
- **Resultado**: O menu agora fica fixo na lateral esquerda da tela

### 2. Menu Vinhonarios com Submenu ✅

- **Arquivo modificado**: `client/src/components/layout/LeftSidebar.tsx`
- **Funcionalidades adicionadas**:
  - Suporte a menus com submenus (hierárquicos)
  - Menu "Vinhonarios" com submenu "Vinhos & Visões"
  - Função `toggleMenu()` para expandir/recolher submenus
  - Função `renderMenuItem()` para renderização recursiva
  - Ícones de expansão (ChevronDown/ChevronUp)

### 3. Integração do WineQuizMobile ✅

- **Nova página criada**: `client/src/pages/vinhonarios/VinhosVisoes.tsx`
- **Rota adicionada**: `/vinhonarios/vinhos-visoes`
- **Funcionalidades**:
  - Interface principal do módulo Vinhonarios
  - Tabs para diferentes funcionalidades (Jogar, Sessões, Resultados, Admin)
  - Links para as funcionalidades do WineQuiz original
  - Cards informativos sobre recursos e temas

### 4. Sistema de Proxy ✅

- **Arquivo modificado**: `server/index.ts`
- **Proxy configurado**: `/vinhonarios/quiz` → `http://localhost:3001`
- **Funcionalidades**:
  - Redirecionamento transparente para o WineQuiz
  - Tratamento de erros com mensagens amigáveis
  - Reescrita de paths para integração seamless

### 5. Sistema de Whitelabel ✅

- **Arquivo modificado**: `client/src/types/tenant.ts`
- **Módulo adicionado**: "Vinhonarios" na lista `AVAILABLE_MODULES`
- **Características**:
  - ID: `'vinhonarios'`
  - Categoria: `'learning'`
  - Preço: R$ 35/mês ou R$ 350/ano + R$ 150 setup
  - Badge "Popular" ativado
  - 7 features principais listadas

### 6. Scripts de Desenvolvimento ✅

- **Novos scripts adicionados ao package.json**:
  - `dev:full`: Inicia ambos os serviços (Carvion + WineQuiz)
  - `wine-quiz:dev`: Inicia apenas o WineQuiz na porta 3001
- **Script helper criado**: `scripts/start-wine-quiz.js`
- **Dependência adicionada**: `concurrently` para execução simultânea

## Como Usar

### Desenvolvimento

1. **Iniciar apenas o Carvion Master**:
   ```bash
   npm run dev
   ```

2. **Iniciar ambos os serviços** (recomendado):
   ```bash
   npm run dev:full
   ```

3. **Iniciar apenas o WineQuiz**:
   ```bash
   npm run wine-quiz:dev
   ```

### Acessar o Módulo

1. Faça login no sistema
2. No menu lateral esquerdo, procure por "Vinhonarios"
3. Clique para expandir e depois em "Vinhos & Visões"
4. Utilize os botões para acessar diferentes funcionalidades do quiz

### Rotas Disponíveis

- `/vinhonarios/vinhos-visoes` - Página principal do módulo
- `/vinhonarios/quiz/*` - Proxy para todas as rotas do WineQuiz original

## Estrutura de Arquivos

```
Carvion_Master/
├── client/src/
│   ├── pages/vinhonarios/
│   │   └── VinhosVisoes.tsx          # Página principal do módulo
│   ├── components/layout/
│   │   └── LeftSidebar.tsx           # Menu lateral com submenus
│   ├── store/
│   │   └── layout.ts                 # Configuração do layout LTR
│   └── types/
│       └── tenant.ts                 # Definições do sistema whitelabel
├── server/
│   ├── index.ts                      # Servidor com proxy configurado
│   └── wine-quiz-proxy.ts            # Configuração específica do proxy
└── scripts/
    └── start-wine-quiz.js            # Script para iniciar WineQuiz
```

## Recursos Implementados

### Menu Hierárquico
- ✅ Suporte a submenus
- ✅ Animações de expansão/recolhimento
- ✅ Indicadores visuais (ícones de seta)
- ✅ Estados ativos para submenus

### Sistema de Proxy
- ✅ Redirecionamento transparente
- ✅ Tratamento de erros
- ✅ Reescrita de URLs
- ✅ Integração com desenvolvimento

### Whitelabel
- ✅ Módulo registrado no sistema
- ✅ Preços e features definidos
- ✅ Categoria de aprendizado
- ✅ Badge de popular

### Interface de Usuário
- ✅ Design consistente com o sistema
- ✅ Cards informativos
- ✅ Tabs organizadas
- ✅ Botões de ação diretos
- ✅ Badges e indicadores visuais

## Dependências Adicionadas

```json
{
  "http-proxy-middleware": "^3.0.5",
  "concurrently": "^9.2.1"
}
```

## Próximos Passos Sugeridos

1. **Configurar variáveis de ambiente** para a URL do WineQuiz em produção
2. **Implementar autenticação compartilhada** entre os sistemas
3. **Adicionar logs de auditoria** para uso do módulo
4. **Implementar cache** para melhorar performance do proxy
5. **Configurar SSL** para o proxy em produção

## Notas Importantes

- O WineQuiz deve estar rodando na porta 3001 para o proxy funcionar
- As rotas do WineQuiz original continuam funcionando normalmente
- O módulo aparece no sistema de whitelabel para contratação
- O layout padrão agora é sidebar esquerda para todos os novos usuários

---

✅ **Status**: Implementação concluída com sucesso  
🎯 **Objetivo**: Menu LTR + Submenu Vinhonarios + Integração WineQuiz + Whitelabel  
📅 **Data**: 2025-01-28