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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BaseFormFieldProps, RadioGroupOption } from "@/types/base-form";

interface FormRadioGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: RadioGroupOption[];
  orientation?: "horizontal" | "vertical";
}

function FormRadioGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  options,
  orientation = "vertical",
  disabled,
  className,
}: FormRadioGroupProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm sm:text-base font-medium">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
          )}
          {description && (
            <FormDescription className="text-xs sm:text-sm leading-relaxed">
              {description}
            </FormDescription>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              disabled={disabled}
              className={
                orientation === "horizontal"
                  ? "flex flex-col sm:flex-row gap-3 sm:gap-6"
                  : "space-y-3"
              }
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors touch-manipulation"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${name}-${option.value}`}
                    disabled={option.disabled}
                    className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <Label
                    htmlFor={`${name}-${option.value}`}
                    className="text-sm sm:text-base leading-tight font-medium cursor-pointer flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage className="text-xs sm:text-sm" />
        </FormItem>
      )}
    />
  );
}

export { FormRadioGroup, type RadioGroupOption };
