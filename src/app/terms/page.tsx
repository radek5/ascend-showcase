import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-semibold tracking-[0.3em]">
            ASCEND
          </Link>

          <span className="text-xs uppercase tracking-[0.2em] text-white/40">
            Football Showcase
          </span>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c7ff2f]">
          Legal
        </div>

        <h1 className="mt-3 text-4xl font-black">
          Terms &amp; Conditions
        </h1>

        <p className="mt-3 text-sm text-white/40">
          ASCEND Football Showcase — Lagos 2027
        </p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-white/65">
          <LegalSection title="1. About the Showcase">
            <p>
              These Terms &amp; Conditions apply to registration for and
              participation in the ASCEND Football Showcase. By completing
              registration, the player, or the player&apos;s parent or legal
              guardian where applicable, agrees to these terms.
            </p>
          </LegalSection>

          <LegalSection title="2. Eligibility">
            <p>
              Players must satisfy the eligibility requirements published for
              the relevant Showcase. ASCEND may request reasonable evidence of
              identity, age, playing history or other registration information.
            </p>
          </LegalSection>

          <LegalSection title="3. Registration">
            <p>
              Registration is personal to the registered player and may not be
              transferred to another person without ASCEND&apos;s written
              approval. Information supplied during registration must be
              accurate and complete.
            </p>
          </LegalSection>

          <LegalSection title="4. Fees and place confirmation">
            <p>
              A player&apos;s place is not secured until any required payment
              or deposit has been received and ASCEND has issued confirmation.
              Applicable fees will be displayed during registration.
            </p>
          </LegalSection>

          <LegalSection title="5. Cancellation and refunds">
            <p>
              Any deposit identified as non-refundable will not ordinarily be
              refunded if the player withdraws. Any additional cancellation,
              postponement or refund arrangements communicated for the
              Showcase will form part of these terms.
            </p>
          </LegalSection>

          <LegalSection title="6. Showcase programme">
            <p>
              ASCEND may make reasonable changes to schedules, coaches,
              participating scouts, facilities, venues or programme content
              where operational circumstances require this.
            </p>
          </LegalSection>

          <LegalSection title="7. No guarantee of recruitment">
            <p>
              Participation provides an opportunity for assessment and
              exposure. ASCEND does not guarantee that any player will receive
              a trial, scholarship, academy placement, professional contract,
              transfer or offer of representation.
            </p>
          </LegalSection>

          <LegalSection title="8. Conduct">
            <p>
              Players must behave professionally and comply with reasonable
              instructions from ASCEND staff, coaches, medical personnel,
              venue staff and event officials. Serious misconduct may result
              in removal from the Showcase.
            </p>
          </LegalSection>

          <LegalSection title="9. Health and safety">
            <p>
              Football involves physical activity and risk of injury. Players
              must disclose relevant medical information and must not
              participate where they have been advised that doing so would be
              unsafe.
            </p>
          </LegalSection>

          <LegalSection title="10. Personal information">
            <p>
              Personal information will be handled in accordance with the
              ASCEND Football Showcase Privacy Notice.
            </p>
          </LegalSection>

          <LegalSection title="11. Football agent services">
            <p>
              Registration for or participation in the Showcase does not by
              itself appoint ASCEND as a football agent or create a football
              representation agreement. Any football agent services will be
              dealt with separately and subject to applicable football agent
              regulations.
            </p>
          </LegalSection>

          <LegalSection title="12. Changes to these terms">
            <p>
              The version accepted during registration will apply to that
              registration. Material changes will not retrospectively replace
              the version already accepted without appropriate notice.
            </p>
          </LegalSection>

          <LegalSection title="13. Contact">
            <p>
              Questions concerning these terms should be directed to ASCEND
              through the contact details published on the official ASCEND
              website.
            </p>
          </LegalSection>
        </div>
      </article>
    </main>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
