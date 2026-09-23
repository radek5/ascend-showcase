const steps = [
  "Role",
  "Details",
  "Travel",
  "Accommodation",
  "Review",
  "Confirmation",
] as const;

type ProfessionalRegistrationProgressProps = {
  currentStep: number;
};

export default function ProfessionalRegistrationProgress({
  currentStep,
}: ProfessionalRegistrationProgressProps) {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-8">
        <div className="flex min-w-[820px]">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={step}
                className="flex flex-1 items-center gap-3 border-r border-white/10 py-5 pr-4 first:border-l first:pl-4"
              >
                <div
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
                    isCurrent
                      ? "bg-[#c7ff2f] text-black"
                      : isCompleted
                        ? "border border-[#c7ff2f]/30 text-[#c7ff2f]"
                        : "border border-white/15 text-white/40",
                  ].join(" ")}
                >
                  {stepNumber}
                </div>

                <span
                  className={[
                    "whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.08em]",
                    isCurrent
                      ? "text-white"
                      : isCompleted
                        ? "text-white/60"
                        : "text-white/30",
                  ].join(" ")}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
