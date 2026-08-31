import Link from "next/link";

type RevelationX1LogoVariant =
  | "lockup"
  | "mark"
  | "wordmark";

type RevelationX1LogoSize =
  | "sm"
  | "md"
  | "lg";

type RevelationX1LogoTheme =
  | "dark"
  | "light"
  | "mono";

type RevelationX1LogoProps = {
  href?: string;
  variant?: RevelationX1LogoVariant;
  size?: RevelationX1LogoSize;
  theme?: RevelationX1LogoTheme;
  descriptor?: string;
  className?: string;
};

const sizeStyles = {
  sm: {
    mark: "text-[24px]",
    wordmark: "text-[12px]",
    descriptor: "text-[7px]",
    gap: "gap-3",
  },
  md: {
    mark: "text-[28px] sm:text-[32px]",
    wordmark: "text-[15px]",
    descriptor: "text-[9px]",
    gap: "gap-4",
  },
  lg: {
    mark: "text-[42px] sm:text-[48px]",
    wordmark: "text-[20px] sm:text-[24px]",
    descriptor: "text-[10px]",
    gap: "gap-5",
  },
};

export default function RevelationX1Logo({
  href = "/",
  variant = "lockup",
  size = "md",
  theme = "dark",
  descriptor = "Football Showcase",
  className = "",
}: RevelationX1LogoProps) {
  const styles = sizeStyles[size];

  const primaryColour =
    theme === "light"
      ? "text-black"
      : "text-white";

  const secondaryColour =
    theme === "light"
      ? "text-black/55"
      : "text-white/40";

  const accentColour =
    theme === "mono"
      ? primaryColour
      : "text-[#c7ff2f]";

  const accentBackground =
    theme === "mono"
      ? "bg-white"
      : "bg-[#c7ff2f]";

  const content = (
    <div
      className={`inline-flex items-center ${styles.gap} ${className}`}
    >
      {(variant === "lockup" || variant === "mark") && (
        <div
          className={`relative flex items-center font-black italic leading-none tracking-[-0.12em] ${styles.mark} ${primaryColour}`}
          aria-hidden="true"
        >
          <span>R</span>

          <span className="relative ml-[1px] opacity-80">
            X

            <span
              className={`absolute -right-[3px] -top-[5px] h-[2px] w-7 -rotate-[38deg] ${accentBackground}`}
            />
          </span>

          <span className="ml-[2px]">1</span>
        </div>
      )}

      {(variant === "lockup" || variant === "wordmark") && (
        <div>
          <div className="flex items-baseline">
            <span
              className={`font-black uppercase tracking-[0.24em] ${styles.wordmark} ${primaryColour}`}
            >
              REVELATION
            </span>

            <span
              className={`font-black uppercase tracking-[0.14em] ${styles.wordmark} ${accentColour}`}
            >
              X1
            </span>
          </div>

          {descriptor && (
            <span
              className={`mt-1 block font-semibold uppercase tracking-[0.3em] ${styles.descriptor} ${secondaryColour}`}
            >
              {descriptor}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      aria-label="REVELATIONX1 homepage"
      className="inline-flex"
    >
      {content}
    </Link>
  );
}
