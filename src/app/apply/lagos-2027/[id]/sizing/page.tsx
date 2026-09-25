import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

import { updateShowcaseSizing } from "./actions";
import RevelationX1Logo from "@/components/brand/RevelationX1Logo";

const steps = [
  "Player",
  "Contact",
  "Identity",
  "Club & Academy",
  "Representation",
  "Video",
  "Kit & Sizing",
  "Consent",
  "Review",
  "Confirmation",
];

const KIT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SizingPage({ params }: PageProps) {
  const { id } = await params;

  const access = await checkApplicantApplicationAccess(id);

  if (!access.authorised) {
    const accessError = getApplicantApplicationAccessError(access);

    if (accessError.status === 401) {
      redirect("/apply/lagos-2027/account/login");
    }

    notFound();
  }

  const application = await prisma.showcaseApplication.findUnique({
    where: { id: access.applicationId },
    select: {
      id: true,
      eventSlug: true,
      status: true,
      shirtSize: true,
      shortsSize: true,
      sockSize: true,
      shoeSizeSystem: true,
      shoeSize: true,
    },
  });

  if (!application) {
    notFound();
  }

  if (application.status !== "DRAFT") {
    redirect(`/apply/${application.eventSlug}/${application.id}/review`);
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/video`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-[1800px] overflow-x-auto px-6 lg:px-8">
          <div className="grid min-w-[1260px] grid-cols-10 gap-2">
            {steps.map((step, index) => {
              const active = index === 6;
              const completed = index < 6;

              return (
                <div
                  key={step}
                  className={`min-w-[118px] rounded-xl border px-3 py-3 text-center text-[10px] font-black uppercase tracking-[0.08em] ${
                    active
                      ? "border-[#c7ff2f] bg-[#c7ff2f] text-black"
                      : completed
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-black/20 text-white/40"
                  }`}
                >
                  <div className="mb-1 text-[9px] opacity-60">
                    {["1", "2", "3", "4A", "4B", "5", "6", "7", "8", "9"][index]}
                  </div>
                  <div className="leading-4">{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Step 6 of 9
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Kit &amp; Sizing
          </h1>

          <p className="mt-3 max-w-2xl text-white/55">
            Please provide your current clothing and shoe sizes. This
            information will help us plan kit and equipment requirements if
            you are selected.
          </p>
        </div>

            <form action={updateShowcaseSizing} className="mx-auto mt-10 max-w-3xl">
              <input
                type="hidden"
                name="applicationId"
                value={application.id}
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <SelectField
                  label="Shirt Size"
                  name="shirtSize"
                  defaultValue={application.shirtSize || ""}
                  required
                >
                  <option value="">Select shirt size</option>
                  {KIT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Shorts Size"
                  name="shortsSize"
                  defaultValue={application.shortsSize || ""}
                  required
                >
                  <option value="">Select shorts size</option>
                  {KIT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Sock Size"
                  name="sockSize"
                  defaultValue={application.sockSize || ""}
                  required
                >
                  <option value="">Select sock size</option>
                  <option value="S">Small</option>
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                </SelectField>

                <SelectField
                  label="Shoe Size System"
                  name="shoeSizeSystem"
                  defaultValue={application.shoeSizeSystem || ""}
                  required
                >
                  <option value="">Select size system</option>
                  <option value="UK">UK</option>
                  <option value="EU">EU</option>
                  <option value="US">US</option>
                </SelectField>

                <div className="sm:col-span-2">
                  <Field
                    label="Shoe Size"
                    name="shoeSize"
                    defaultValue={application.shoeSize || ""}
                    placeholder="e.g. 9, 9.5 or 43"
                    required
                  />
                  <p className="mt-2 text-xs leading-5 text-white/40">
                    Enter your normal shoe size using the size system selected
                    above.
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-black text-white">
                  Why we collect this information
                </div>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Providing sizing during registration means selected and
                  standby players do not need to return later to supply basic
                  kit information. It also helps REVELATIONX1 prepare event
                  requirements in advance.
                </p>
              </div>

              <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/apply/${application.eventSlug}/${application.id}/video`}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-black text-white transition hover:bg-white/5"
                >
                  Back to Video
                </Link>

                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-lime-300 px-7 text-sm font-black text-black transition hover:bg-lime-200"
                >
                  Save &amp; Continue to Consent
                </button>
              </div>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/80">
        {label}
        {required ? <span className="ml-1 text-lime-300">*</span> : null}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-lime-300/60"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  required,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-white/80">
        {label}
        {required ? <span className="ml-1 text-lime-300">*</span> : null}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0a0d12] px-4 text-sm text-white outline-none transition focus:border-lime-300/60"
      >
        {children}
      </select>
    </label>
  );
}
