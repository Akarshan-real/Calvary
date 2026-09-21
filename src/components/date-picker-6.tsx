'use client'

import type { ComponentProps } from 'react'
import { useId, useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { formatDateRange } from 'little-date'
import { ChevronDownIcon, Calendar as CalendarIcon, X } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type CalendarClassNames = NonNullable<ComponentProps<typeof Calendar>['classNames']>

const calendarClassNames = {
  range_start: 'rounded-l-full bg-[#ffbe33] text-neutral-950 font-bold',
  range_middle: 'bg-[#ffbe33]/20 text-[#ffbe33] font-semibold rounded-none',
  range_end: 'rounded-r-full bg-[#ffbe33] text-neutral-950 font-bold',
  day_button:
    'data-[selected=true]:bg-[#ffbe33] data-[selected=true]:text-neutral-950 data-[selected=true]:font-black hover:rounded-full hover:bg-white/10 transition-colors',
  today:
    'rounded-full ring-1 ring-[#ffbe33]/40'
} satisfies CalendarClassNames

export interface DatePicker6Props {
  // Mode configuration ('range' or 'single')
  mode?: 'range' | 'single'

  // Date Range mode props (preferred)
  range?: DateRange
  onRangeChange?: (range: DateRange | undefined) => void

  // Single date mode props (backward compatibility)
  value?: string // YYYY-MM-DD
  onChange?: (dateStr: string) => void

  label?: string
  placeholder?: string
  className?: string
  align?: 'start' | 'center' | 'end'
}

export function DatePicker6({
  mode,
  range,
  onRangeChange,
  value,
  onChange,
  label,
  placeholder,
  className,
  align = 'end'
}: DatePicker6Props) {
  const id = useId()
  const [open, setOpen] = useState(false)

  // Determine active mode:
  // If mode explicitly passed, use it. Otherwise:
  // If onRangeChange or range is provided, it's 'range'.
  // Else if onChange or value is provided, it's 'single'.
  // Default fallback is 'range'.
  const resolvedMode = mode || (onRangeChange !== undefined || range !== undefined ? 'range' : (onChange !== undefined || value !== undefined ? 'single' : 'range'))

  // Internal state if uncontrolled in range mode
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(undefined)
  const currentRange = range !== undefined ? range : internalRange

  // Parse value to Date for single mode
  const singleDate = useMemo(() => {
    if (!value) return undefined
    try {
      const parsed = parseISO(value)
      return isNaN(parsed.getTime()) ? undefined : parsed
    } catch {
      return undefined
    }
  }, [value])

  const displayText = useMemo(() => {
    if (resolvedMode === 'range') {
      if (currentRange?.from && currentRange?.to) {
        try {
          return formatDateRange(currentRange.from, currentRange.to, { includeTime: false })
        } catch {
          return `${format(currentRange.from, 'MMM d')} – ${format(currentRange.to, 'MMM d, yyyy')}`
        }
      }
      if (currentRange?.from) {
        return format(currentRange.from, 'EEE, MMM d, yyyy')
      }
      return placeholder || 'Filter by Date Range'
    }

    // Single mode
    return singleDate ? format(singleDate, 'EEE, MMM d, yyyy') : (placeholder || 'Select date')
  }, [resolvedMode, currentRange, singleDate, placeholder])

  const hasSelection = useMemo(() => {
    if (resolvedMode === 'range') {
      return !!currentRange?.from
    }
    return !!value
  }, [resolvedMode, currentRange, value])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (resolvedMode === 'range') {
      if (onRangeChange) {
        onRangeChange(undefined)
      } else {
        setInternalRange(undefined)
      }
    } else {
      onChange?.('')
    }
  }

  const handleRangeSelect = (newRange: DateRange | undefined) => {
    if (onRangeChange) {
      onRangeChange(newRange)
    } else {
      setInternalRange(newRange)
    }
    // Auto-close if user has selected both start and end dates
    if (newRange?.from && newRange?.to) {
      setTimeout(() => setOpen(false), 200)
    }
  }

  const handleSingleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, 'yyyy-MM-dd'))
      setOpen(false)
    } else {
      onChange?.('')
    }
  }

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} className='px-1 text-xs font-semibold text-neutral-400'>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-[#12141d] px-3.5 text-xs font-medium text-white shadow-sm outline-none transition-all hover:bg-white/5 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#ffbe33]/40 cursor-pointer gap-2'
          )}
        >
          <div className='flex items-center gap-2.5 truncate'>
            <CalendarIcon className='size-3.5 text-[#ffbe33] shrink-0' />
            <span className={cn('truncate', !hasSelection && 'text-neutral-400')}>
              {displayText}
            </span>
          </div>

          <div className='flex items-center gap-1.5 shrink-0'>
            {hasSelection && (
              <button
                type='button'
                onClick={handleClear}
                className='p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer'
                title='Clear date filter'
              >
                <X className='size-3.5' />
              </button>
            )}
            <ChevronDownIcon className={cn('size-3.5 text-neutral-400 transition-transform duration-200', open && 'rotate-180')} />
          </div>
        </PopoverTrigger>
        
        <PopoverContent
          className='w-auto overflow-hidden rounded-2xl border border-white/15 bg-[#12141d] p-3 shadow-2xl backdrop-blur-xl z-50 text-white'
          align={align}
        >
          {resolvedMode === 'range' ? (
            <Calendar
              mode='range'
              selected={currentRange}
              classNames={calendarClassNames}
              onSelect={handleRangeSelect}
            />
          ) : (
            <Calendar
              mode='single'
              selected={singleDate}
              classNames={calendarClassNames}
              onSelect={handleSingleSelect}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePicker6
