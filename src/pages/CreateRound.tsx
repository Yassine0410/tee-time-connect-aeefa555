import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, Flag, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/Header';
import { FormField, SelectCards } from '@/components/FormField';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useCourses, useCreateRound } from '@/hooks/useGolfData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const gameFormats = ['Stroke Play', 'Stableford', 'Match Play', 'Best Ball', 'Scramble', 'Skins'];
const handicapRanges = ['All Levels', '0-10', '10-20', '20-30', '30+'];

function generateTimeSlots(startHour: number, endHour: number, intervalMinutes: number) {
  const slots: string[] = [];
  for (let totalMinutes = startHour * 60; totalMinutes <= endHour * 60; totalMinutes += intervalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  }
  return slots;
}

const timeSlots = generateTimeSlots(6, 20, 15);

export default function CreateRound() {
  const navigate = useNavigate();
  const { data: courses = [] } = useCourses();
  const createRound = useCreateRound();
  const { t, dateLocale, formatLabel, handicapLabel, language } = useLanguage();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [courseId, setCourseId] = useState('');
  const [gameFormat, setGameFormat] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState('4');
  const [handicapRange, setHandicapRange] = useState('');
  const [description, setDescription] = useState('');

  const selectedCourse = courses.find((c) => c.id === courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time || !courseId || !gameFormat || !handicapRange) {
      toast.error(t('createRound.requiredFields'));
      return;
    }

    try {
      await createRound.mutateAsync({
        course_id: courseId,
        date: format(date, 'yyyy-MM-dd'),
        time,
        format: gameFormat,
        players_needed: parseInt(playersNeeded, 10),
        handicap_range: handicapRange,
        description: description || undefined,
      });
      toast.success(t('createRound.successTitle'), {
        description: t('createRound.successDesc'),
      });
      navigate('/');
    } catch (err: any) {
      toast.error(t('createRound.failTitle'), { description: err.message });
    }
  };

  return (
    <div className="screen-content">
      <Header title={t('createRound.title')} subtitle={t('createRound.subtitle')} showBack />

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label={t('createRound.date')} required>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn('golf-input flex items-center gap-3 text-left', !date && 'text-muted-foreground')}
              >
                <CalendarIcon size={18} className="text-primary shrink-0" />
                {date ? format(date, 'EEEE, MMMM d, yyyy', { locale: dateLocale }) : t('createRound.selectDate')}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(calendarDate) => calendarDate < new Date()}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </FormField>

        <FormField label={t('createRound.teeTime')} required>
          <div className="relative">
            <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="golf-input pl-10 appearance-none cursor-pointer"
            >
              <option value="">{t('createRound.selectTime')}</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        <FormField label={t('createRound.golfCourse')} required>
          <div className="relative">
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="golf-input pl-10 appearance-none cursor-pointer"
            >
              <option value="">{t('createRound.selectCourse')}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.location}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('createRound.holesPar', { holes: selectedCourse.holes, par: selectedCourse.par })}
            </p>
          )}
        </FormField>

        <FormField label={t('createRound.gameFormat')} required>
          <SelectCards
            options={gameFormats.map((value) => ({ value, label: formatLabel(value) }))}
            value={gameFormat}
            onChange={setGameFormat}
            columns={3}
          />
        </FormField>

        <FormField label={t('createRound.players')} required>
          <SelectCards
            options={['2', '3', '4'].map((value) => ({
              value,
              label: language === 'fr' ? `${value} joueurs` : `${value} Players`,
            }))}
            value={playersNeeded}
            onChange={setPlayersNeeded}
            columns={3}
          />
        </FormField>

        <FormField label={t('createRound.playerLevel')} required>
          <SelectCards
            options={handicapRanges.map((value) => ({ value, label: handicapLabel(value) }))}
            value={handicapRange}
            onChange={setHandicapRange}
            columns={3}
          />
        </FormField>

        <FormField label={t('createRound.descriptionOptional')}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('createRound.descriptionPlaceholder')}
            rows={3}
            className="golf-input resize-none"
          />
        </FormField>

        <div className="flex gap-3 p-3 bg-secondary rounded-xl">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-secondary-foreground">{t('createRound.infoNote')}</p>
        </div>

        <button type="submit" disabled={createRound.isPending} className="btn-golf-accent w-full text-lg disabled:opacity-50">
          <Flag size={20} className="inline mr-2" />
          {createRound.isPending ? t('createRound.creating') : t('createRound.publish')}
        </button>
      </form>
    </div>
  );
}
