import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function UpcomingEvents() {
  const { user } = useAuthStore();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/tenants', user?.tenantId, 'events', 'upcoming'],
    enabled: !!user?.tenantId,
  }) as { data: any[], isLoading: boolean };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-muted pl-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'border-primary';
      case 'workshop':
        return 'border-secondary';
      case 'business_game':
        return 'border-accent';
      default:
        return 'border-muted';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'Webinar';
      case 'workshop':
        return 'Workshop';
      case 'business_game':
        return 'Business Game';
      case 'meeting':
        return 'Reunião';
      default:
        return 'Evento';
    }
  };

  const formatEventDate = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDateOnly.getTime() === today.getTime()) {
      return 'Hoje';
    } else if (eventDateOnly.getTime() === tomorrow.getTime()) {
      return 'Amanhã';
    } else {
      return format(eventDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    }
  };

  const formatEventTime = (date: string) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <Card data-testid="upcoming-events">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Próximos Eventos</CardTitle>
          <Button variant="ghost" size="sm" data-testid="view-full-agenda">
            Ver agenda
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.isArray(events) && events.length > 0 ? (
          events.map((event: any) => (
            <div 
              key={event.id}
              className={`border-l-4 ${getEventTypeColor(event.eventType)} pl-4 hover:bg-muted/30 p-2 rounded-r transition-colors`}
              data-testid={`upcoming-event-${event.id}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium line-clamp-2">{event.title}</h3>
                <div className="flex items-center space-x-2 ml-2">
                  <Badge variant="outline" className="text-xs">
                    {getEventTypeLabel(event.eventType)}
                  </Badge>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {formatEventTime(event.startTime)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatEventDate(event.startTime)}
                </div>
                {event.maxParticipants && (
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {event.currentParticipants}/{event.maxParticipants}
                  </div>
                )}
              </div>

              {event.instructorName && (
                <p className="text-sm text-primary">
                  com {event.instructorName}
                </p>
              )}

              {event.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum evento próximo</p>
            <p className="text-sm text-muted-foreground">
              Novos eventos serão exibidos aqui
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
