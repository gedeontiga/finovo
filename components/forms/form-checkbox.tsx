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
import { Checkbox } from "@/components/ui/checkbox";
import { BaseFormFieldProps } from "@/types/base-form";

interface FormCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  checkboxLabel?: string;
}

function FormCheckbox<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  checkboxLabel,
  disabled,
  className,
}: FormCheckboxProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-start space-y-0 space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${className}`}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 touch-manipulation"
            />
          </FormControl>
          <div className="space-y-1 leading-none flex-1">
            <FormLabel className="text-sm sm:text-base font-medium cursor-pointer">
              {checkboxLabel || label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
            {description && (
              <FormDescription className="text-xs sm:text-sm leading-relaxed">
                {description}
              </FormDescription>
            )}
          </div>
          <FormMessage className="text-xs sm:text-sm" />
        </FormItem>
      )}
    />
  );
}

export { FormCheckbox };
