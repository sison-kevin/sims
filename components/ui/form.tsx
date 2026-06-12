"use client";

import { createContext, useContext } from "react";
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

const FormFieldContext = createContext<{ name: string } | null>(null);

export function Form({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) {
  const formProviderProps = props as React.ComponentProps<typeof FormProvider>;
  return <FormProvider {...formProviderProps}>{children}</FormProvider>;
}

export function FormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function FormLabel({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("text-sm font-medium text-foreground", className)}>{children}</div>;
}

export function FormControl({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function FormMessage({ className }: { className?: string }) {
  const fieldContext = useContext(FormFieldContext);
  const form = useFormContext();
  const error = fieldContext ? (form.formState.errors[fieldContext.name]?.message as string | undefined) : undefined;

  if (!error) return null;

  return <div className={cn("text-sm text-red-600 dark:text-red-400", className)}>{error}</div>;
}