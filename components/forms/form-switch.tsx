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
import { Switch } from "@/components/ui/switch";
import { BaseFormFieldProps } from "@/types/base-form";

interface FormSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  showDescription?: boolean;
}

function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  showDescription = true,
  disabled,
  className,
}: FormSwitchProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-center justify-between rounded-lg border p-4 sm:p-5 bg-card hover:bg-accent/50 transition-colors gap-4 ${className}`}
        >
          <div className="space-y-1 flex-1 min-w-0">
            <FormLabel className="text-sm sm:text-base font-medium cursor-pointer">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </FormLabel>
            {showDescription && description && (
              <FormDescription className="text-xs sm:text-sm leading-relaxed wrap-break-word">
                {description}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className="touch-manipulation shrink-0"
            />
          </FormControl>
          <FormMessage className="text-xs sm:text-sm" />
        </FormItem>
      )}
    />
  );
}

export { FormSwitch };
