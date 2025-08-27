import { useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, BarChart3, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AICoach() {
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [chatHistory] = useState([
    {
      type: "ai",
      message: "Olá! Sou seu mentor IA especializado em governança corporativa. Como posso ajudá-lo hoje?",
      timestamp: "10:00"
    },
    {
      type: "user", 
      message: "Como posso melhorar a performance da TechCorp?",
      timestamp: "10:01"
    },
    {
      type: "ai",
      message: "Baseado nos dados da TechCorp, recomendo focar em 3 áreas: 1) Implementar métricas ESG mais robustas, 2) Diversificar o conselho com especialistas em tecnologia, 3) Estabelecer um comitê de auditoria mais independente.",
      timestamp: "10:02"
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real implementation, this would send to the AI service
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/conselho-digital/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Brain className="w-8 h-8 text-primary mr-3" />
                  Mentor IA do CVO
                </h1>
                <p className="text-gray-600 mt-1">Assistente inteligente para decisões de governança</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat com IA
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Chat Interface */}
              <div className="lg:col-span-3">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-primary" />
                      Conversa com o Mentor IA
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${
                            msg.type === 'user' 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Digite sua pergunta sobre governança..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tópicos Sugeridos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full text-left text-xs h-auto p-2">
                      Como melhorar ESG na minha empresa?
                    </Button>
                    <Button variant="outline" className="w-full text-left text-xs h-auto p-2">
                      Estratégias para diversificar o conselho
                    </Button>
                    <Button variant="outline" className="w-full text-left text-xs h-auto p-2">
                      Métricas de performance do conselho
                    </Button>
                    <Button variant="outline" className="w-full text-left text-xs h-auto p-2">
                      Como conduzir uma reunião eficaz
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Insights Recentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-2 bg-blue-50 rounded text-xs">
                      <strong>TechCorp:</strong> Implementar comitê de sustentabilidade
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-xs">
                      <strong>InnovaSaaS:</strong> Revisar política de remuneração
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Conversas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-gray-600">Conversas este mês</div>
                  </div>
                  
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-gray-600">Score de satisfação</div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">12h</div>
                    <div className="text-sm text-gray-600">Tempo economizado</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Tópicos Mais Discutidos</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Governança ESG</span>
                      <span className="text-sm text-gray-500">35%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Estratégia Corporativa</span>
                      <span className="text-sm text-gray-500">28%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Compliance e Auditoria</span>
                      <span className="text-sm text-gray-500">22%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}