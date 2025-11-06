import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { AAP } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DeadlineEvent {
  id: string;
  title: string;
  deadline: Date;
  type: 'aap' | 'application';
  urgency: 'high' | 'medium' | 'low';
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<DeadlineEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadEvents();
    }
  }, [currentUser, currentMonth]);

  const loadEvents = async () => {
    if (!currentUser || !userProfile) return;

    try {
      const eventsData: DeadlineEvent[] = [];

      // Load AAPs deadlines (for porteurs)
      if (userProfile.userType === 'porteur') {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);

        const aapsQuery = query(
          collection(db, 'aap'),
          where('status', '==', 'published'),
          where('deadline', '>=', Timestamp.fromDate(start)),
          where('deadline', '<=', Timestamp.fromDate(end))
        );

        const snapshot = await getDocs(aapsQuery);
        snapshot.docs.forEach(doc => {
          const aap = doc.data() as AAP;
          const deadline = aap.deadline instanceof Date ? aap.deadline : aap.deadline.toDate();
          const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          eventsData.push({
            id: doc.id,
            title: aap.title,
            deadline,
            type: 'aap',
            urgency: daysUntil <= 7 ? 'high' : daysUntil <= 30 ? 'medium' : 'low',
          });
        });
      }

      // Load application deadlines (for financeurs)
      if (userProfile.userType === 'financeur') {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);

        const aapsQuery = query(
          collection(db, 'aap'),
          where('financeurId', '==', currentUser.uid),
          where('status', '==', 'published'),
          where('deadline', '>=', Timestamp.fromDate(start)),
          where('deadline', '<=', Timestamp.fromDate(end))
        );

        const snapshot = await getDocs(aapsQuery);
        snapshot.docs.forEach(doc => {
          const aap = doc.data() as AAP;
          const deadline = aap.deadline instanceof Date ? aap.deadline : aap.deadline.toDate();
          const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          eventsData.push({
            id: doc.id,
            title: `Deadline: ${aap.title}`,
            deadline,
            type: 'aap',
            urgency: daysUntil <= 7 ? 'high' : daysUntil <= 30 ? 'medium' : 'low',
          });
        });
      }

      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: fr });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: fr });
    return eachDayOfInterval({ start, end });
  };

  const getEventsForDate = (date: Date): DeadlineEvent[] => {
    return events.filter(event => isSameDay(event.deadline, date));
  };

  const getUrgencyColor = (urgency: DeadlineEvent['urgency']): string => {
    switch (urgency) {
      case 'high':
        return 'bg-error-500';
      case 'medium':
        return 'bg-warning-500';
      case 'low':
        return 'bg-primary-500';
    }
  };

  const days = getDaysInMonth();
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calendrier des Deadlines</h1>
          </div>
          <p className="text-gray-600">
            Suivez toutes les dates limites de vos AAP
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Week days */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors ${
                        !isCurrentMonth
                          ? 'bg-gray-50 text-gray-400'
                          : isSelected
                          ? 'bg-primary-50 border-primary-500'
                          : isToday
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded ${getUrgencyColor(event.urgency)} text-white truncate`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Events sidebar */}
          <div className="space-y-4">
            {/* Legend */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Légende</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-error-500"></div>
                  <span className="text-sm text-gray-600">Urgent (≤ 7 jours)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning-500"></div>
                  <span className="text-sm text-gray-600">Bientôt (≤ 30 jours)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary-500"></div>
                  <span className="text-sm text-gray-600">À venir (&gt; 30 jours)</span>
                </div>
              </div>
            </Card>

            {/* Selected date events */}
            {selectedDate && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </h3>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun événement</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event.id}
                        onClick={() => navigate(`/aap/${event.id}`)}
                        className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${getUrgencyColor(event.urgency)}`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500">
                              {format(event.deadline, 'HH:mm', { locale: fr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Upcoming urgent deadlines */}
            <Card className="p-4 bg-error-50 border-error-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-error-600" />
                <h3 className="text-sm font-semibold text-error-900">
                  Deadlines urgentes
                </h3>
              </div>
              <div className="space-y-2">
                {events
                  .filter(e => e.urgency === 'high')
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/aap/${event.id}`)}
                      className="p-2 bg-white border border-error-200 rounded hover:shadow cursor-pointer"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-error-600">
                        {format(event.deadline, 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  ))}
                {events.filter(e => e.urgency === 'high').length === 0 && (
                  <p className="text-sm text-error-800">Aucune deadline urgente</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
