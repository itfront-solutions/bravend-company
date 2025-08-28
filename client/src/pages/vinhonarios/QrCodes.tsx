import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, ArrowLeft, Users, Smartphone } from 'lucide-react';
import { Link } from 'wouter';

interface Team {
  id: number;
  name: string;
  qrData: string;
  capacity: number;
}

export default function QrCodes() {
  const [teams] = useState<Team[]>([
    {
      id: 1,
      name: "Mesa 1 - Terroir",
      qrData: "wine-quiz-team-1",
      capacity: 4
    },
    {
      id: 2,
      name: "Mesa 2 - Harmonização",
      qrData: "wine-quiz-team-2",
      capacity: 4
    },
    {
      id: 3,
      name: "Mesa 3 - Envelhecimento",
      qrData: "wine-quiz-team-3",
      capacity: 4
    },
    {
      id: 4,
      name: "Mesa 4 - Degustação",
      qrData: "wine-quiz-team-4",
      capacity: 4
    },
    {
      id: 5,
      name: "Mesa 5 - Vinificação",
      qrData: "wine-quiz-team-5",
      capacity: 4
    }
  ]);

  // Função simples para gerar QR Code SVG
  const generateQRCode = (data: string, size: number = 200) => {
    // Esta é uma representação visual simples - em produção usaria uma biblioteca como qrcode
    const modules = 25; // Grid 25x25 para simplicidade
    const moduleSize = size / modules;
    
    // Padrão simples baseado no hash do data
    const hash = data.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const pattern = [];
    for (let i = 0; i < modules * modules; i++) {
      // Criar um padrão pseudo-aleatório baseado no hash e posição
      pattern.push((hash * (i + 1)) % 3 === 0);
    }

    return (
      <svg width={size} height={size} className="border border-gray-300 rounded">
        <rect width={size} height={size} fill="white" />
        {pattern.map((filled, index) => {
          if (!filled) return null;
          const x = (index % modules) * moduleSize;
          const y = Math.floor(index / modules) * moduleSize;
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={moduleSize}
              height={moduleSize}
              fill="black"
            />
          );
        })}
        
        {/* Corner squares (finder patterns) */}
        <rect x="0" y="0" width={moduleSize * 7} height={moduleSize * 7} fill="none" stroke="black" strokeWidth="2" />
        <rect x={moduleSize * 2} y={moduleSize * 2} width={moduleSize * 3} height={moduleSize * 3} fill="black" />
        
        <rect x={size - moduleSize * 7} y="0" width={moduleSize * 7} height={moduleSize * 7} fill="none" stroke="black" strokeWidth="2" />
        <rect x={size - moduleSize * 5} y={moduleSize * 2} width={moduleSize * 3} height={moduleSize * 3} fill="black" />
        
        <rect x="0" y={size - moduleSize * 7} width={moduleSize * 7} height={moduleSize * 7} fill="none" stroke="black" strokeWidth="2" />
        <rect x={moduleSize * 2} y={size - moduleSize * 5} width={moduleSize * 3} height={moduleSize * 3} fill="black" />
      </svg>
    );
  };

  const downloadQRCode = (teamName: string, qrData: string) => {
    // Em produção, isso geraria um PNG real do QR code
    alert(`Download do QR Code para ${teamName} - ${qrData}`);
  };

  const downloadAllQRCodes = () => {
    alert('Download de todos os QR Codes em arquivo ZIP');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/vinhonarios/vinhos-visoes">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <QrCode className="w-8 h-8 text-purple-600 mr-3" />
                  QR Codes das Equipes
                </h1>
                <p className="text-gray-600 mt-1">Códigos para acesso rápido das equipes ao quiz</p>
              </div>
            </div>
            <Button onClick={downloadAllQRCodes} className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Baixar Todos
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
              Como Usar os QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">1. Escaneie o Código</h3>
                <p className="text-sm text-gray-600">
                  Cada mesa/equipe deve escanear seu QR Code específico com o smartphone
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">2. Acesso Direto</h3>
                <p className="text-sm text-gray-600">
                  O código leva diretamente à interface do quiz já configurada para a equipe
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">3. Participe</h3>
                <p className="text-sm text-gray-600">
                  Aguarde o sommelier iniciar a sessão e responda às perguntas em tempo real
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <p className="text-purple-100 text-sm">
                  Capacidade: {team.capacity} participantes
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    {generateQRCode(team.qrData, 180)}
                  </div>
                  
                  {/* Team Info */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">ID da Equipe</p>
                    <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {team.qrData}
                    </p>
                  </div>
                  
                  {/* Download Button */}
                  <Button 
                    onClick={() => downloadQRCode(team.name, team.qrData)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                <strong>URL Base:</strong> {window.location.origin}/vinhonarios/quiz/team/
              </p>
              <p className="text-sm">
                Os QR Codes direcionam para esta URL + ID da equipe. 
                Certifique-se de que o sistema esteja acessível na rede local.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}