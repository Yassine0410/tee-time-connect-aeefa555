import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import {
  HANDICAP_MAX,
  HANDICAP_MIN,
  isAllLevelsRange,
  normalizeHandicapRange,
} from "@/lib/handicapRange";

interface HandicapRangeSliderProps {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
  allLevelsLabel: string;
  className?: string;
}

export function HandicapRangeSlider({
  min,
  max,
  onChange,
  allLevelsLabel,
  className,
}: HandicapRangeSliderProps) {
  const normalized = normalizeHandicapRange(min, max);
  const isAllLevels = isAllLevelsRange(normalized.min, normalized.max);

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-lg font-semibold text-primary transition-colors duration-200">
        {isAllLevels ? allLevelsLabel : `${normalized.min} - ${normalized.max}`}
      </p>

      <div className="px-1">
        <SliderPrimitive.Root
          value={[normalized.min, normalized.max]}
          min={HANDICAP_MIN}
          max={HANDICAP_MAX}
          step={1}
          onValueChange={([nextMin, nextMax]) => onChange(normalizeHandicapRange(nextMin, nextMax))}
          className="relative flex w-full touch-none select-none items-center py-2"
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-primary transition-all duration-200" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
        </SliderPrimitive.Root>
      </div>
    </div>
  );
}
