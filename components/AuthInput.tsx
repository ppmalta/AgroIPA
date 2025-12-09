import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon, label, error, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-card-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "auth-input pr-12",
              error && "ring-2 ring-destructive/50",
              className
            )}
            {...props}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-card-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            ) : (
              icon
            )}
          </div>
        </div>
        {error && (
          <p className="text-destructive text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
