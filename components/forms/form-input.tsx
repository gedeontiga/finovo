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
import { Input } from "@/components/ui/input";
import { BaseFormFieldProps } from "@/types/base-form";
import { cn } from "@/lib/utils";

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
}

function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  type = "text",
  placeholder,
  step,
  min,
  max,
  disabled,
  className,
}: FormInputProps<TFieldValues, TName>) {
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
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              step={step}
              min={min}
              max={max}
              disabled={disabled}
              className="w-full text-sm sm:text-base"
              {...field}
              onChange={(e) => {
                if (type === "number") {
                  const value = e.target.value;
                  field.onChange(value === "" ? undefined : parseFloat(value));
                } else {
                  field.onChange(e.target.value);
                }
              }}
            />
          </FormControl>
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

export { FormInput };
