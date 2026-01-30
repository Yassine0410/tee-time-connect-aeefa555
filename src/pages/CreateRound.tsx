import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, Users, Flag, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/Header';
import { FormField, SelectCards } from '@/components/FormField';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { mockCourses, gameFormats, handicapRanges, timeSlots } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateRound() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [courseId, setCourseId] = useState('');
  const [gameFormat, setGameFormat] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState('4');
  const [handicapRange, setHandicapRange] = useState('');
  const [description, setDescription] = useState('');

  const selectedCourse = mockCourses.find(c => c.id === courseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !courseId || !gameFormat || !handicapRange) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Round created successfully!', {
      description: 'Other golfers can now join your round.',
    });
    navigate('/');
  };

  return (
    <div className="screen-content">
      <Header 
        title="Create a Round"
        subtitle="Invite golfers to join you"
        showBack
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date Picker */}
        <FormField label="Date" required>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'golf-input flex items-center gap-3 text-left',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon size={18} className="text-primary shrink-0" />
                {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </FormField>

        {/* Time Picker */}
        <FormField label="Tee Time" required>
          <div className="relative">
            <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="golf-input pl-10 appearance-none cursor-pointer"
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
        </FormField>

        {/* Golf Course */}
        <FormField label="Golf Course" required>
          <div className="relative">
            <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" />
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="golf-input pl-10 appearance-none cursor-pointer"
            >
              <option value="">Select a course</option>
              {mockCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.location}
                </option>
              ))}
            </select>
          </div>
          {selectedCourse && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {selectedCourse.holes} holes • Par {selectedCourse.par}
            </p>
          )}
        </FormField>

        {/* Game Format */}
        <FormField label="Game Format" required>
          <SelectCards
            options={gameFormats.map(f => ({ value: f, label: f }))}
            value={gameFormat}
            onChange={setGameFormat}
            columns={3}
          />
        </FormField>

        {/* Number of Players */}
        <FormField label="Number of Players" required>
          <SelectCards
            options={[
              { value: '2', label: '2 Players' },
              { value: '3', label: '3 Players' },
              { value: '4', label: '4 Players' },
            ]}
            value={playersNeeded}
            onChange={setPlayersNeeded}
            columns={3}
          />
        </FormField>

        {/* Handicap Range */}
        <FormField label="Player Level" required>
          <SelectCards
            options={handicapRanges.map(r => ({ value: r, label: r }))}
            value={handicapRange}
            onChange={setHandicapRange}
            columns={3}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description (Optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any details about your round..."
            rows={3}
            className="golf-input resize-none"
          />
        </FormField>

        {/* Info Note */}
        <div className="flex gap-3 p-3 bg-secondary rounded-xl">
          <Info size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-secondary-foreground">
            Your round will be visible to all golfers in the area. You can cancel or edit it anytime before it starts.
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="btn-golf-accent w-full text-lg"
        >
          <Flag size={20} className="inline mr-2" />
          Publish Round
        </button>
      </form>
    </div>
  );
}
