import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.02em] ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
  {
    variants: {
      variant: {
        default: 'bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#f97316_100%)] text-primary-foreground shadow-[0_18px_36px_rgba(249,115,22,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(249,115,22,0.34)]',
        destructive: 'bg-destructive text-destructive-foreground shadow-[0_16px_32px_rgba(220,38,38,0.22)] hover:-translate-y-0.5 hover:bg-destructive/90',
        outline: 'border border-white/80 bg-white/80 text-foreground shadow-[0_14px_34px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white',
        secondary: 'bg-secondary/90 text-secondary-foreground shadow-[0_14px_30px_rgba(20,184,166,0.12)] hover:-translate-y-0.5 hover:bg-secondary',
        ghost: 'text-slate-700 shadow-none hover:bg-white/70 hover:text-slate-950',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-3.5 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
