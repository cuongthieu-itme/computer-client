"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean; // To disable the picker itself
  placeholder?: string;
}

export function DatePicker({ date, setDate, minDate, maxDate, disabled, placeholder = "Pick a date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setIsOpen(false); // Close popover on date selection
  };

  // Modifiers for react-day-picker to disable dates
  const disabledDays = [];
  if (minDate) {
    // Disable all dates before minDate (exclusive of minDate itself)
    disabledDays.push({ before: minDate });
  }
  if (maxDate) {
    // Disable all dates after maxDate (exclusive of maxDate itself)
    disabledDays.push({ after: maxDate });
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          disabled={disabled}
          aria-label="Open date picker"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          disabled={disabledDays.length > 0 ? disabledDays : undefined}
          fromDate={minDate} // Restrict navigation beyond minDate
          toDate={maxDate} // Restrict navigation beyond maxDate
          // Modifiers to visually indicate range if needed, though `disabled` handles selection
          // modifiers={{
          //   disabled: disabledDays,
          // }}
          // modifiersClassNames={{
          //   disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
          // }}
          // captionLayout="dropdown-buttons" // Optional: for year/month dropdowns
          // fromYear={minDate ? minDate.getFullYear() : new Date().getFullYear() - 10}
          // toYear={maxDate ? maxDate.getFullYear() : new Date().getFullYear() + 10}
        />
      </PopoverContent>
    </Popover>
  );
}
