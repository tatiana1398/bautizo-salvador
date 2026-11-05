export const BotanicalSprig = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 140 320"
    fill="none"
    aria-hidden="true"
    className={className}
    stroke="currentColor"
    strokeWidth="1.35"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M70 6C63 80 76 168 60 314" />
    <path d="M69 58c-20-10-38 0-40 18 20 8 36-1 40-18Z" />
    <path d="M71 96c20-11 39-2 41 16-20 8-37 0-41-16Z" />
    <path d="M69 138c-18-9-35 0-37 17 19 7 34-1 37-17Z" />
    <path d="M70 178c19-10 37-1 39 16-19 8-35 0-39-16Z" />
    <path d="M67 220c-17-8-33 0-35 16 18 7 32-1 35-16Z" />
    <path d="M68 258c17-9 33-1 35 14-17 7-32 0-35-14Z" />
    <path d="M64 296c-10-5-19 0-20 9 11 4 19-1 20-9Z" />
    <circle cx="70" cy="26" r="2.2" />
    <circle cx="72" cy="212" r="1.8" />
    <circle cx="62" cy="306" r="1.6" />
  </svg>
);

type MonogramProps = {
  letters: { left: string; center: string; right: string };
  size?: "sm" | "lg";
  className?: string;
};

export const Monogram = ({ letters, size = "lg", className }: MonogramProps) => {
  const isSmall = size === "sm";

  return (
    <div
      role="img"
      aria-label={`Monograma ${letters.left}${letters.center}${letters.right}`}
      className={`flex items-center justify-center rounded-full border border-line/90 ${
        isSmall ? "h-12 w-12" : "h-[76px] w-[76px] md:h-[84px] md:w-[84px]"
      } ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className={`flex items-center font-display font-light leading-none text-navy ${
          isSmall ? "gap-px" : "gap-[2px]"
        }`}
      >
        <span className={isSmall ? "text-[10px]" : "text-[15px] md:text-[17px]"}>
          {letters.left}
        </span>
        <span className={isSmall ? "text-[19px]" : "text-[32px] md:text-[35px]"}>
          {letters.center}
        </span>
        <span className={isSmall ? "text-[10px]" : "text-[15px] md:text-[17px]"}>
          {letters.right}
        </span>
      </span>
    </div>
  );
};

type DoveMonogramProps = MonogramProps & {
  dove: string;
};

/** Monograma con la paloma a la derecha, empujándolo con la rama de olivo. */
export const DoveMonogram = ({ dove, className, ...monogram }: DoveMonogramProps) => (
  <div className={`relative inline-flex ${className ?? ""}`}>
    <Monogram {...monogram} />
    <img
      src={dove}
      alt=""
      aria-hidden="true"
      width={360}
      height={270}
      className="pointer-events-none absolute left-full top-1/2 -ml-[3px] w-[104px] max-w-none -translate-y-[41%] md:w-[116px]"
    />
  </div>
);
