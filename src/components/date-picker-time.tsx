"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type DatePickerTimeProps = {
  /** Selected date (controlled). */
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  /** Time as "HH:mm" or "HH:mm:ss" (controlled). */
  time?: string
  onTimeChange?: (time: string) => void
  dateLabel?: string
  timeLabel?: string
  idPrefix?: string
}

export function DatePickerTime({
  date: dateProp,
  onDateChange,
  time,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  idPrefix = "dt",
}: DatePickerTimeProps = {}) {
  const [open, setOpen] = React.useState(false)
  const [dateState, setDateState] = React.useState<Date | undefined>(undefined)
  const date = dateProp ?? dateState

  const setDate = (d: Date | undefined) => {
    setDateState(d)
    onDateChange?.(d)
  }

  return (
    <FieldGroup className="flex-row">
      <Field className="min-w-0 flex-1">
        <FieldLabel htmlFor={`${idPrefix}-date`}>{dateLabel}</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                id={`${idPrefix}-date`}
                className="w-full h-9 flex items-center gap-2 rounded-md border border-border-strong bg-surface-2 px-3 text-left text-sm transition-colors outline-none hover:border-text-muted/40 focus:border-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span
                  className={cn(
                    "flex-1 min-w-0 truncate",
                    date ? "text-text" : "text-text-muted",
                  )}
                >
                  {date ? format(date, "PPP") : "Select date"}
                </span>
                <ChevronDownIcon className="size-4 shrink-0 text-text-muted" />
              </button>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              defaultMonth={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className="w-36">
        <FieldLabel htmlFor={`${idPrefix}-time`}>{timeLabel}</FieldLabel>
        <Input
          type="time"
          id={`${idPrefix}-time`}
          step="60"
          value={time}
          defaultValue={time === undefined ? "10:30" : undefined}
          onChange={(e) => onTimeChange?.(e.target.value)}
          className="appearance-none bg-background [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </Field>
    </FieldGroup>
  )
}
