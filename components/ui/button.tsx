"use client";

import clsx from "clsx";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base = "btn";
    const variants: Record<typeof variant, string> = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost"
    };
    return (
      <button ref={ref} className={clsx(base, variants[variant], className)} {...props}>
        {props.children}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";
