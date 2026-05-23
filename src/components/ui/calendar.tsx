'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: 'rdp-root',
        months: 'flex flex-col gap-4 sm:flex-row sm:gap-6',
        month: 'space-y-4',
        month_caption: 'flex items-center justify-center pt-1 relative',
        caption_label: 'text-sm font-semibold text-foreground',
        nav: 'flex items-center gap-1',
        button_previous:
          'absolute left-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        button_next:
          'absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'w-10 rounded-md text-[0.8rem] font-medium text-muted-foreground',
        week: 'mt-2 flex w-max',
        day: 'h-10 w-10 p-0 text-center text-sm',
        day_button:
          'h-10 w-10 rounded-md p-0 font-normal text-foreground transition-colors hover:bg-muted hover:text-foreground aria-selected:opacity-100',
        today: 'text-primary font-semibold',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
        range_start:
          'bg-primary text-primary-foreground rounded-l-md rounded-r-none',
        range_end:
          'bg-primary text-primary-foreground rounded-r-md rounded-l-none',
        range_middle:
          'bg-primary/12 text-primary rounded-none hover:bg-primary/16',
        disabled: 'text-muted-foreground/40 opacity-60',
        outside: 'text-muted-foreground/50 opacity-60',
        hidden: 'invisible',
        ...classNames
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeft
              className={cn('h-4 w-4', iconClassName)}
              {...iconProps}
            />
          ) : (
            <ChevronRight
              className={cn('h-4 w-4', iconClassName)}
              {...iconProps}
            />
          )
      }}
      {...props}
    />
  );
}

export { Calendar };
