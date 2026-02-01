"use client";

import { FieldPath, FieldValues } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BaseFormFieldProps, DatePickerConfig } from "@/types/base-form";

interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  config?: DatePickerConfig;
}

function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  config = {},
  disabled,
  className,
}: FormDatePickerProps<TFieldValues, TName>) {
  const {
    minDate,
    maxDate,
    disabledDates = [],
    placeholder = "Pick a date",
  } = config;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={`flex flex-col ${className}`}>
          {label && (
            <FormLabel className="text-sm sm:text-base font-medium">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={`w-full h-11 sm:h-12 pl-3 pr-3 text-left font-normal text-sm sm:text-base touch-manipulation justify-start ${
                    !field.value && "text-muted-foreground"
                  }`}
                  disabled={disabled}
                >
                  <span className="flex-1 truncate">
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{placeholder}</span>
                    )}
                  </span>
                  <CalendarIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5 opacity-50 shrink-0" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => {
                  if (minDate && date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return disabledDates.some(
                    (disabledDate) => date.getTime() === disabledDate.getTime(),
                  );
                }}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
          {description && (
            <FormDescription className="text-xs sm:text-sm leading-relaxed">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs sm:text-sm" />
        </FormItem>
      )}
    />
  );
}

export { FormDatePicker };
