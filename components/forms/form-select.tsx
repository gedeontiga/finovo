"use client";

import { FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseFormFieldProps, FormOption } from "@/types/base-form";
import { cn } from "@/lib/utils";

interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: FormOption[];
  placeholder?: string;
  searchable?: boolean;
}

function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  options,
  placeholder = "Select an option",
  disabled,
  className,
}: FormSelectProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full", className)}>
          {label && (
            <FormLabel className="text-sm sm:text-base flex items-baseline gap-1">
              <span className="wrap-break-word">{label}</span>
              {required && (
                <span className="text-red-500 shrink-0" aria-label="required">
                  *
                </span>
              )}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder={placeholder} className="truncate" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-w-[calc(100vw-2rem)]">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="text-sm sm:text-base"
                >
                  <span className="block truncate">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && (
            <FormDescription className="text-xs sm:text-sm wrap-break-word">
              {description}
            </FormDescription>
          )}
          <FormMessage className="text-xs sm:text-sm wrap-break-word" />
        </FormItem>
      )}
    />
  );
}

export { FormSelect, type FormOption };
