"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const barHeights = {
    sm: "h-3",
    md: "h-6",
    lg: "h-9",
    xl: "h-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} relative flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 rounded-xl bg-aqua/20 blur-xl animate-pulse"></div>

      <div className="w-full h-full relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-aqua via-dark-aqua to-cian-blue animate-spin blur-sm"></div>

        <div className="absolute inset-1 bg-dark-teal rounded-lg flex items-center justify-center overflow-hidden">
          <div className="flex gap-1 items-center">
            <div
              className={`w-1.5 ${barHeights[size]} bg-aqua rounded-full animate-[bounce_1s_ease-in-out_infinite]`}
            ></div>
            <div
              className={`w-1.5 ${barHeights[size]} bg-cian-blue rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]`}
            ></div>
            <div
              className={`w-1.5 ${barHeights[size]} bg-aqua rounded-full animate-[bounce_1s_ease-in-out_infinite_0.2s]`}
            ></div>
            <div
              className={`w-1.5 ${barHeights[size]} bg-cian-blue rounded-full animate-[bounce_1s_ease-in-out_infinite_0.3s]`}
            ></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-aqua/10 to-transparent animate-pulse"></div>
        </div>
      </div>

      <div className="absolute -top-1 -left-1 w-2 h-2 bg-aqua rounded-full animate-ping"></div>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cian-blue  rounded-full animate-ping delay-100"></div>
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-aqua rounded-full animate-ping delay-200"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cian-blue rounded-full animate-ping delay-300"></div>
    </div>
  );
};
