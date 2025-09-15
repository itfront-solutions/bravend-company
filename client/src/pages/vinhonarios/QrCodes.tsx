import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  QrCode, 
  Download,
  Users,
  RefreshCw,
  Smartphone,
  Wifi,
  Eye
} from 'lucide-react';
import { useWineQuizStore } from '@/store/wineQuizStore';
import { wineQuizApi } from '@/lib/wineQuizApi';

// QR Code component (you might want to install qrcode.js or react-qr-code)
const QRCodeDisplay = ({ value, size = 200 }: { value: string; size?: number }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Simple QR code generation using an online API
    // In production, you should use a proper QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
    setQrDataUrl(qrUrl);
  }, [value, size]);

  return (
    <div className="flex justify-center">
      {qrDataUrl ? (
        <img 
          src={qrDataUrl} 
          alt={`QR Code for ${value}`}
          className="border rounded-lg shadow-sm"
          width={size}
          height={size}
        />
      ) : (
        <div 
          className="flex items-center justify-center bg-gray-100 border rounded-lg"
          style={{ width: size, height: size }}
        >
          <QrCode className="h-16 w-16 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default function QrCodes() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const { 
    teams,
    sessions,
    setTeams,
    setSessions,
    setLoading: setGlobalLoading,
    setError
  } = useWineQuizStore();

  // Load teams and sessions
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setGlobalLoading(true);
      
      const [teamsData, sessionsData] = await Promise.all([
        wineQuizApi.getTeams(),
        wineQuizApi.getSessions()
      ]);
      
      setTeams(teamsData);
      setSessions(sessionsData);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setGlobalLoading(false);
    }
  };

  const downloadQRCode = (teamName: string, teamId: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size + 100; // Extra space for text

    // Create QR code URL
    const joinUrl = `${window.location.origin}/vinhonarios/join?team=${teamId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(joinUrl)}`;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code
      ctx.drawImage(img, 0, 0, size, size);

      // Add team name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(teamName, size / 2, size + 40);

      // Add URL
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(joinUrl, size / 2, size + 70);

      // Download
      const link = document.createElement('a');
      link.download = `qrcode-${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = qrUrl;
  };

  const activeSession = sessions.find(s => s.status === 'active');
  const joinBaseUrl = `${window.location.origin}/vinhonarios/join`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link href="/vinhonarios/vinhos-visoes">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Codes das Equipes</h1>
              <p className="text-gray-600">Códigos para acesso rápido das mesas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={loadData} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            
            {activeSession && (
              <Badge variant="default" className="bg-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Sessão #{activeSession.id} Ativa
              </Badge>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Como usar os QR Codes</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Cada mesa possui um QR Code único para acesso rápido</p>
                <p>• Participantes podem escanear com o celular para se juntar à equipe</p>
                <p>• Os códigos levam direto para a página de cadastro da mesa</p>
                <p>• Máximo de {teams[0]?.maxMembers || 4} participantes por mesa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const joinUrl = `${joinBaseUrl}?team=${team.id}`;
            
            return (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                    {team.icon && (
                      <span className="ml-2 text-lg">{team.icon}</span>
                    )}
                  </CardTitle>
                  <Badge variant="outline" className="mx-auto w-fit">
                    Mesa #{team.id}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* QR Code Display */}
                  <QRCodeDisplay value={joinUrl} size={200} />
                  
                  {/* Team Info */}
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      Máximo {team.maxMembers || 4} participantes
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-mono text-gray-700 break-all">
                        {joinUrl}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => downloadQRCode(team.name, team.id)}
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button 
                      onClick={() => window.open(joinUrl, '_blank')}
                      className="flex-1"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>

                  {/* QR Code Data */}
                  {team.qrCode && (
                    <div className="text-xs text-gray-500 text-center">
                      ID: {team.qrCode}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma Equipe Encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Configure as equipes no sistema para gerar os QR Codes
            </p>
            <Link href="/vinhonarios/admin">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Ir para Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Usage Stats */}
      {teams.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Estatísticas das Mesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
                <div className="text-sm text-gray-500">Mesas Disponíveis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {teams.reduce((sum, team) => sum + (team.maxMembers || 4), 0)}
                </div>
                <div className="text-sm text-gray-500">Capacidade Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Sessões Ativas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </div>
                <div className="text-sm text-gray-500">Total de Sessões</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}