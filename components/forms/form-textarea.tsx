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
import { Textarea } from "@/components/ui/textarea";
import { BaseFormFieldProps, TextareaConfig } from "@/types/base-form";
import { cn } from "@/lib/utils";

interface FormTextareaProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  placeholder?: string;
  config?: TextareaConfig;
}

function FormTextarea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  config = {},
  disabled,
  className,
}: FormTextareaProps<TFieldValues, TName>) {
  const {
    maxLength,
    showCharCount = true,
    rows = 4,
    resize = "vertical",
  } = config;

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
            <div className="w-full space-y-2">
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                style={{ resize }}
                maxLength={maxLength}
                className="w-full text-sm sm:text-base min-h-20"
                {...field}
              />
              {showCharCount && maxLength && (
                <div className="text-muted-foreground text-right text-xs sm:text-sm">
                  {field.value?.length || 0} / {maxLength}
                </div>
              )}
            </div>
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

export { FormTextarea };
