import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import RevelationX1Logo from "@/components/brand/RevelationX1Logo";
import {
  checkApplicantApplicationAccess,
  getApplicantApplicationAccessError,
} from "@/lib/applicants/applicationOwnership";
import { prisma } from "@/lib/prisma";

import { updateSelectedPlayerConfirmation } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const KIT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default async function SelectedPlayerConfirmationPage({
  params,
}: PageProps) {
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
    where: {
      id: access.applicationId,
    },

    select: {
      id: true,
      eventSlug: true,

      firstName: true,
      lastName: true,
      registrationNumber: true,

      status: true,
      selectionDecisionReleasedAt: true,
      selectionResponse: true,

      emergencyContactName: true,
      emergencyContactRelationship: true,
      emergencyContactPhone: true,

      selectedPlayerConfirmation: true,
    },
  });

  if (!application) {
    notFound();
  }

  const event = await prisma.event.findUnique({
    where: {
      slug: application.eventSlug,
    },

    select: {
      selectionDecisionsReleasedAt: true,
    },
  });

  if (
    !event?.selectionDecisionsReleasedAt ||
    !application.selectionDecisionReleasedAt ||
    application.status !== "SELECTED" ||
    application.selectionResponse !== "ACCEPTED"
  ) {
    redirect(`/apply/${application.eventSlug}/${application.id}/confirmation`);
  }

  const confirmation = application.selectedPlayerConfirmation;

  const emergencyContactName =
    confirmation?.emergencyContactName ||
    application.emergencyContactName ||
    "";

  const emergencyContactRelationship =
    confirmation?.emergencyContactRelationship ||
    application.emergencyContactRelationship ||
    "";

  const emergencyContactPhone =
    confirmation?.emergencyContactPhone ||
    application.emergencyContactPhone ||
    "";

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <RevelationX1Logo />

          <Link
            href={`/apply/${application.eventSlug}/${application.id}/confirmation`}
            className="text-sm font-medium text-white/60 transition hover:text-white"
          >
            Back to selection
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_340px] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#c7ff2f]">
            Selected Player Confirmation
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Confirm Your Lagos 2027 Participation
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/55">
            Complete the information REVELATIONX1 needs to prepare your
            participation, player kit and event operations for Lagos 2027.
          </p>

          {confirmation?.confirmedAt ? (
            <div className="mt-8 rounded-2xl border border-[#c7ff2f]/25 bg-[#c7ff2f]/[0.05] p-5">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[#c7ff2f]">
                Confirmation Complete
              </div>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Your information has already been confirmed. You can update it
                below if anything has changed before the Showcase.
              </p>
            </div>
          ) : null}

          <form
            action={updateSelectedPlayerConfirmation}
            className="mt-10 space-y-10"
          >
            <input type="hidden" name="applicationId" value={application.id} />

            <FormSection
              title="1. Attendance"
              description="Confirm that you intend to take up your selected place at Lagos 2027."
            >
              <Checkbox
                name="attendanceConfirmed"
                defaultChecked={confirmation?.attendanceConfirmed ?? false}
                label="I confirm that I intend to attend the Lagos 2027 Men's Football Showcase."
              />
            </FormSection>

            <FormSection
              title="2. Player Kit"
              description="REVELATIONX1 will provide player kit for selected participants. Please give us your current sizes."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <SelectField
                  label="Shirt size"
                  name="shirtSize"
                  required
                  defaultValue={confirmation?.shirtSize || ""}
                  options={KIT_SIZES}
                />

                <SelectField
                  label="Shorts size"
                  name="shortsSize"
                  required
                  defaultValue={confirmation?.shortsSize || ""}
                  options={KIT_SIZES}
                />

                <Field
                  label="Sock size / range"
                  name="sockSize"
                  defaultValue={confirmation?.sockSize || ""}
                  placeholder="Optional"
                />
              </div>

              <p className="text-xs leading-5 text-white/35">
                Sock sizing is optional at this stage and may be confirmed again
                once the final kit supplier and size ranges are known.
              </p>
            </FormSection>

            <FormSection
              title="3. Emergency Contact"
              description="Review these details carefully. REVELATIONX1 may need to contact this person during the event in an emergency."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Emergency contact name"
                  name="emergencyContactName"
                  required
                  defaultValue={emergencyContactName}
                />

                <Field
                  label="Relationship"
                  name="emergencyContactRelationship"
                  required
                  defaultValue={emergencyContactRelationship}
                />

                <Field
                  label="Emergency contact phone"
                  name="emergencyContactPhone"
                  type="tel"
                  required
                  defaultValue={emergencyContactPhone}
                />
              </div>
            </FormSection>

            <FormSection
              title="4. Event Requirements"
              description="Please give us current information so the event team can prepare appropriately."
            >
              <YesNoField
                name="hasDietaryRequirements"
                label="Do you have any dietary requirements or food allergies?"
                defaultValue={confirmation?.hasDietaryRequirements}
              />

              <TextArea
                label="Dietary requirement details"
                name="dietaryRequirements"
                defaultValue={confirmation?.dietaryRequirements || ""}
                placeholder="If you answered Yes, provide the relevant details."
              />

              <YesNoField
                name="hasMedicalUpdate"
                label="Has any medical information you provided in your application changed or needs updating?"
                defaultValue={confirmation?.hasMedicalUpdate}
              />

              <TextArea
                label="Medical update"
                name="medicalUpdate"
                defaultValue={confirmation?.medicalUpdate || ""}
                placeholder="If you answered Yes, tell us what has changed or provide the updated information."
              />

              <YesNoField
                name="hasAccessibilityNeeds"
                label="Do you have any accessibility or additional support requirements?"
                defaultValue={confirmation?.hasAccessibilityNeeds}
              />

              <TextArea
                label="Accessibility / support details"
                name="accessibilityNeeds"
                defaultValue={confirmation?.accessibilityNeeds || ""}
                placeholder="If you answered Yes, provide the relevant details."
              />

              <TextArea
                label="Other event requirements"
                name="otherRequirements"
                defaultValue={confirmation?.otherRequirements || ""}
                placeholder="Optional — tell us anything else the event team should know."
              />
            </FormSection>

            <FormSection
              title="5. Final Confirmation"
              description="Please review your information before confirming."
            >
              <Checkbox
                name="informationConfirmed"
                defaultChecked={confirmation?.informationConfirmed ?? false}
                label="I confirm that the information above is accurate and current, and I understand that REVELATIONX1 will use it to organise my participation in Lagos 2027."
              />
            </FormSection>

            <div className="flex flex-col-reverse gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/apply/${application.eventSlug}/${application.id}/confirmation`}
                className="text-sm font-bold text-white/50 transition hover:text-white"
              >
                ← Back to selection
              </Link>

              <button
                type="submit"
                className="rounded-full bg-[#c7ff2f] px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                {confirmation?.confirmedAt
                  ? "Update Confirmation"
                  : "Confirm My Participation"}
              </button>
            </div>
          </form>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              Selected Player
            </div>

            <div className="mt-5 text-xl font-black">
              {application.firstName} {application.lastName}
            </div>

            <div className="mt-1 text-[#c7ff2f]">Lagos 2027</div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm">
              <SummaryRow label="Selection" value="Selected" />

              <SummaryRow label="Offer" value="Accepted" />

              <SummaryRow
                label="Confirmation"
                value={confirmation?.confirmedAt ? "Complete" : "Required"}
              />

              {application.registrationNumber ? (
                <SummaryRow
                  label="Registration"
                  value={application.registrationNumber}
                />
              ) : null}
            </div>

            <div className="mt-6 rounded-xl border border-[#c7ff2f]/15 bg-[#c7ff2f]/[0.05] p-4 text-sm leading-6 text-white/60">
              Your event credential is issued only after the required selected
              player confirmation stage has been completed.
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <h2 className="text-xl font-black">{title}</h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
        {description}
      </p>

      <div className="mt-7 space-y-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue = "",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required = false,
  defaultValue = "",
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/10 bg-[#111] px-4 py-4 outline-none transition focus:border-[#c7ff2f]/60"
      >
        <option value="">Select size</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function YesNoField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: boolean | null | undefined;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{label}</legend>

      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <input
            type="radio"
            name={name}
            value="yes"
            required
            defaultChecked={defaultValue === true}
          />

          <span className="text-sm">Yes</span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <input
            type="radio"
            name={name}
            value="no"
            required
            defaultChecked={defaultValue === false}
          />

          <span className="text-sm">No</span>
        </label>
      </div>
    </fieldset>
  );
}

function TextArea({
  label,
  name,
  defaultValue = "",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>

      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 outline-none transition placeholder:text-white/20 focus:border-[#c7ff2f]/60"
      />
    </label>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <input
        type="checkbox"
        name={name}
        required
        defaultChecked={defaultChecked}
        className="mt-1"
      />

      <span className="text-sm leading-6 text-white/65">{label}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <span className="text-white/40">{label}</span>
      <span className="break-all text-right">{value}</span>
    </div>
  );
}
