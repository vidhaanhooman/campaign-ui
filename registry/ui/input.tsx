import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

/* forwardRef: this input is consumed with react-hook-form (`register`) on React 18,
   where function components don't receive `ref` through props — without forwardRef the
   ref silently drops and RHF can't read/focus the field. Author in React 19, ship for 18. */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(function Input(
    { className, type, ...props },
    ref
) {
    return (
        <InputPrimitive
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
                "shadcn dark h-8 w-full min-w-0 rounded-lg border border-border bg-transparent px-2.5 py-1 text-base transition-colors outline-none dark:bg-input/30 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
                className
            )}
            {...props}
        />
    );
});

export { Input };
