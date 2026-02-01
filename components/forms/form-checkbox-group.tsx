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
import { Badge } from "@/components/ui/badge";
import { BaseFormFieldProps, CheckboxGroupOption } from "@/types/base-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FormCheckboxGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: CheckboxGroupOption[];
  showBadges?: boolean;
  columns?: 1 | 2 | 3 | 4;
  maxHeight?: string;
}

function FormCheckboxGroup<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  options,
  showBadges = true,
  columns = 2,
  maxHeight,
  disabled,
  className,
}: FormCheckboxGroupProps<TFieldValues, TName>) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

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

          <div className={maxHeight ? "border rounded-lg" : ""}>
            {maxHeight ? (
              <ScrollArea className={maxHeight}>
                <div className={`grid gap-3 sm:gap-4 p-3 ${gridCols[columns]}`}>
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors touch-manipulation"
                    >
                      <FormControl>
                        <Checkbox
                          id={`${name}-${option.value}`}
                          checked={field.value?.includes(option.value) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, option.value]);
                            } else {
                              field.onChange(
                                currentValues.filter(
                                  (value: string) => value !== option.value,
                                ),
                              );
                            }
                          }}
                          disabled={disabled || option.disabled}
                          className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6"
                        />
                      </FormControl>
                      <label
                        htmlFor={`${name}-${option.value}`}
                        className="text-sm sm:text-base leading-tight font-medium cursor-pointer flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className={`grid gap-3 sm:gap-4 ${gridCols[columns]}`}>
                {options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors touch-manipulation"
                  >
                    <FormControl>
                      <Checkbox
                        id={`${name}-${option.value}`}
                        checked={field.value?.includes(option.value) || false}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          if (checked) {
                            field.onChange([...currentValues, option.value]);
                          } else {
                            field.onChange(
                              currentValues.filter(
                                (value: string) => value !== option.value,
                              ),
                            );
                          }
                        }}
                        disabled={disabled || option.disabled}
                        className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6"
                      />
                    </FormControl>
                    <label
                      htmlFor={`${name}-${option.value}`}
                      className="text-sm sm:text-base leading-tight font-medium cursor-pointer flex-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showBadges && field.value && field.value.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {field.value.map((value: string) => {
                const option = options.find((opt) => opt.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="text-xs sm:text-sm px-3 py-1"
                  >
                    {option?.label || value}
                  </Badge>
                );
              })}
            </div>
          )}
          <FormMessage className="text-xs sm:text-sm" />
        </FormItem>
      )}
    />
  );
}

export { FormCheckboxGroup, type CheckboxGroupOption };
