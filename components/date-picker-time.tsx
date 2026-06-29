"use client"

import * as React from "react"
import { format } from "date-fns"
import { CaretDownIcon } from "@phosphor-icons/react"

import { Calendar } from "@/components/ui/calendar"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimeWheel } from "@/components/time-picker"
import { cn } from "@/lib/utils"

function to12h(v: string) {
  const [h, m] = v.split(":").map(Number)
  const am = h < 12
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`
}

/* Matches the default SelectTrigger so every input reads the same from outside. */
const TRIGGER_CLASS =
  "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-secondary"

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
              <button type="button" id={`${idPrefix}-date`} className={TRIGGER_CLASS}>
                <span
                  className={cn(
                    "flex-1 min-w-0 truncate text-left",
                    date ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {date ? format(date, "PPP") : "Select date"}
                </span>
                <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            }
          />
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="label"
              weekStartsOn={1}
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
        <Popover>
          <PopoverTrigger
            render={
              <button type="button" id={`${idPrefix}-time`} className={TRIGGER_CLASS}>
                <span
                  className={cn(
                    "flex-1 min-w-0 truncate text-left",
                    time ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {time ? to12h(time) : "Time"}
                </span>
                <CaretDownIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            }
          />
          <PopoverContent align="start" className="w-[228px] overflow-hidden p-0">
            <TimeWheel value={time || "10:00"} onChange={(v) => onTimeChange?.(v)} />
          </PopoverContent>
        </Popover>
      </Field>
    </FieldGroup>
  )
}
