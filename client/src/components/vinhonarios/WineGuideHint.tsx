import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HelpCircle, 
  X, 
  Search,
  Wine,
  Grape,
  MapPin,
  Info,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface GlossaryTerm {
  id: number;
  term: string;
  category: string;
  definition: string;
  aliases: string[];
}

interface WineGuideHintProps {
  position?: 'bottom-right' | 'bottom-left';
}

export default function WineGuideHint({ position = 'bottom-right' }: WineGuideHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Wine knowledge categories
  const categories = [
    { id: 'all', label: 'Todos', icon: BookOpen },
    { id: 'uva', label: 'Uvas', icon: Grape },
    { id: 'regiao', label: 'Regiões', icon: MapPin },
    { id: 'conceito', label: 'Conceitos', icon: Lightbulb },
    { id: 'componente', label: 'Componentes', icon: Wine },
  ];

  // Sample wine knowledge data (should come from API in production)
  const sampleWineKnowledge: GlossaryTerm[] = [
    {
      id: 1,
      term: 'Terroir',
      category: 'conceito',
      definition: 'Conjunto de fatores naturais (solo, clima, topografia) que influenciam o caráter de um vinho e o tornam único de sua região.',
      aliases: ['teroir', 'terruar']
    },
    {
      id: 2,
      term: 'Tanino',
      category: 'componente',
      definition: 'Substância natural encontrada em cascas de uvas, sementes e madeira que confere estrutura, adstringência e capacidade de envelhecimento aos vinhos tintos.',
      aliases: ['taninos', 'tannin']
    },
    {
      id: 3,
      term: 'Cabernet Sauvignon',
      category: 'uva',
      definition: 'Variedade de uva tinta de origem francesa, conhecida por produzir vinhos encorpados, com notas de cassis, pimentão verde e boa capacidade de envelhecimento.',
      aliases: ['cabernet']
    },
    {
      id: 4,
      term: 'Chardonnay',
      category: 'uva',
      definition: 'Variedade de uva branca originária da Borgonha, França. Produz vinhos elegantes que podem variar de frescos e minerais a cremosos e amadeirados.',
      aliases: ['chardonay']
    },
    {
      id: 5,
      term: 'Bordeaux',
      category: 'regiao',
      definition: 'Famosa região vinícola francesa, conhecida por seus vinhos tintos de qualidade baseados em Cabernet Sauvignon e Merlot, e brancos de Sauvignon Blanc e Sémillon.',
      aliases: ['bordô', 'bordo']
    },
    {
      id: 6,
      term: 'Champagne',
      category: 'regiao',
      definition: 'Região da França que produz o verdadeiro Champagne, espumante feito pelo método tradicional com uvas Chardonnay, Pinot Noir e Pinot Meunier.',
      aliases: ['champanhe']
    },
    {
      id: 7,
      term: 'Malolática',
      category: 'conceito',
      definition: 'Fermentação secundária que converte ácido málico em ácido lático, suavizando a acidez e adicionando complexidade cremosa ao vinho.',
      aliases: ['fermentação malolática', 'malo']
    },
    {
      id: 8,
      term: 'Pinot Noir',
      category: 'uva',
      definition: 'Uva tinta delicada e exigente, originária da Borgonha. Produz vinhos elegantes com aromas de frutas vermelhas, especiarias e notas terrosas.',
      aliases: ['pinot']
    },
    {
      id: 9,
      term: 'Decantação',
      category: 'conceito',
      definition: 'Processo de transferir vinho de uma garrafa para um decanter para separar sedimentos e permitir aeração, melhorando aromas e sabores.',
      aliases: ['decantar']
    },
    {
      id: 10,
      term: 'Sauvignon Blanc',
      category: 'uva',
      definition: 'Uva branca aromática que produz vinhos frescos e vibrantes com notas herbáceas, cítricas e de frutas tropicais.',
      aliases: ['sauvignon']
    },
    {
      id: 11,
      term: 'Barrique',
      category: 'conceito',
      definition: 'Barril de carvalho francês de 225 litros usado para fermentação e envelhecimento de vinhos, conferindo complexidade e estrutura.',
      aliases: ['barrica']
    },
    {
      id: 12,
      term: 'Douro',
      category: 'regiao',
      definition: 'Região vinícola portuguesa famosa pelo Vinho do Porto e também por excelentes vinhos tintos secos, com paisagem em socalcos patrimônio da UNESCO.',
      aliases: ['vale do douro']
    }
  ];

  useEffect(() => {
    setGlossaryTerms(sampleWineKnowledge);
  }, []);

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = !searchTerm || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || term.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const positionClasses = position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6';

  return (
    <>
      {/* Floating Hint Button */}
      <div className={`fixed ${positionClasses} z-50`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-200"
          size="sm"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>

      {/* Hint Panel */}
      {isOpen && (
        <div className={`fixed ${position === 'bottom-right' ? 'bottom-20 right-6' : 'bottom-20 left-6'} z-40`}>
          <Card className="w-96 h-96 shadow-xl border-purple-200">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wine className="h-5 w-5" />
                  <CardTitle className="text-lg">Guia do Vinho</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-purple-500 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative mt-3">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-200" />
                <Input
                  placeholder="Buscar conhecimento sobre vinho..."
                  className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full">
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="h-full">
                <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className="flex flex-col items-center py-2 text-xs"
                      >
                        <Icon className="h-3 w-3 mb-1" />
                        {category.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value={activeCategory} className="mt-0 h-full">
                  <ScrollArea className="h-64 p-4">
                    {filteredTerms.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum termo encontrado</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredTerms.map((term) => (
                          <div key={term.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-sm text-purple-800">
                                {term.term}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {term.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                              {term.definition}
                            </p>
                            {term.aliases.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {term.aliases.map((alias, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {alias}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Hint - How to use */}
          <div className="mt-2 text-xs text-center text-purple-600 bg-white px-2 py-1 rounded shadow">
            💡 Dica: Use durante o quiz para esclarecer termos sobre vinhos
          </div>
        </div>
      )}
    </>
  );
}