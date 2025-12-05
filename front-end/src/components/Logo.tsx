import { Cloud, Leaf } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: { icon: "w-12 h-12", text: "text-xl", subtitle: "text-xs" },
    md: { icon: "w-20 h-20", text: "text-3xl", subtitle: "text-sm" },
    lg: { icon: "w-28 h-28", text: "text-4xl", subtitle: "text-base" },
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className={`${sizeClasses[size].icon} relative`}>
          {/* Cloud */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Cloud 
              className="w-full h-full text-sky-300 fill-sky-200" 
              strokeWidth={1.5}
            />
          </div>
          {/* Leaf/Plant */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Leaf 
              className={`${size === "sm" ? "w-4 h-4" : size === "md" ? "w-6 h-6" : "w-8 h-8"} text-green-500 fill-green-400 rotate-45`} 
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
      {showText && (
        <div className="text-center mt-2">
          <h1 className={`${sizeClasses[size].text} font-bold tracking-tight`}>
            <span className="text-card-foreground/80">Agro</span>
            <span className="text-card-foreground">IPA</span>
          </h1>
          <p className={`${sizeClasses[size].subtitle} text-muted-foreground font-medium -mt-1`}>
            analítica
          </p>
        </div>
      )}
    </div>
  );
};
