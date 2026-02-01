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
import { Slider } from "@/components/ui/slider";
import { BaseFormFieldProps, SliderConfig } from "@/types/base-form";

interface FormSliderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  config: SliderConfig;
  showValue?: boolean;
}

function FormSlider<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  config,
  showValue = true,
  disabled,
  className,
}: FormSliderProps<TFieldValues, TName>) {
  const { min, max, step = 1, formatValue } = config;

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
          <FormControl>
            <div className="px-2 sm:px-4 py-2">
              <Slider
                min={min}
                max={max}
                step={step}
                value={[field.value || min]}
                onValueChange={(value) => field.onChange(value[0])}
                disabled={disabled}
                className="touch-manipulation"
              />
              {showValue && (
                <div className="mt-3 flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                  <span className="tabular-nums">
                    {formatValue ? formatValue(min) : min}
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-foreground tabular-nums px-3 py-1 rounded-md bg-accent">
                    {formatValue
                      ? formatValue(field.value || min)
                      : field.value || min}
                  </span>
                  <span className="tabular-nums">
                    {formatValue ? formatValue(max) : max}
                  </span>
                </div>
              )}
            </div>
          </FormControl>
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

export { FormSlider };
