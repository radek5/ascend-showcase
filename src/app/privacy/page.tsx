import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Notice
        </h1>

        <p className="mt-3 text-sm text-white/40">
          ASCEND Football Showcase — Lagos 2027
        </p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-white/65">
          <Section title="1. About this notice">
            <p>
              This Privacy Notice explains how ASCEND collects, uses, stores
              and shares personal information in connection with the ASCEND
              Football Showcase.
            </p>
          </Section>

          <Section title="2. Information we collect">
            <p>
              We may collect identity and contact information, date of birth,
              nationality, football profile information, playing position,
              club and representation information, photographs, video,
              registration and payment information, emergency contact details
              and information required to administer participation.
            </p>
          </Section>

          <Section title="3. Medical information">
            <p>
              Where necessary for player safety and Showcase administration,
              ASCEND may collect relevant medical, injury, allergy or emergency
              information. Access should be limited to personnel who reasonably
              require that information.
            </p>
          </Section>

          <Section title="4. How we use information">
            <p>
              Information may be used to administer registration, assess
              eligibility, organise the Showcase, communicate with players and
              guardians, manage check-in, support player safety, provide
              football assessment and facilitate legitimate scouting and
              recruitment activity.
            </p>
          </Section>

          <Section title="5. Scouts, clubs and football organisations">
            <p>
              Relevant football profile and performance information may be
              made available to authorised scouts, clubs, academies or other
              football organisations participating in or working with the
              Showcase where appropriate.
            </p>
          </Section>

          <Section title="6. Representation information">
            <p>
              Where a player declares that they are represented, ASCEND may
              retain the representative&apos;s details and, where authorised,
              contact that representative regarding football opportunities
              arising from the Showcase.
            </p>
          </Section>

          <Section title="7. Photographs and video">
            <p>
              Photographs and video may be collected for football assessment,
              event administration and, where the appropriate permission has
              been given, media and promotional purposes.
            </p>
          </Section>

          <Section title="8. Children and young players">
            <p>
              Where a player is a minor, ASCEND may collect information about
              the player&apos;s parent or legal guardian and obtain appropriate
              parental or guardian permissions.
            </p>
          </Section>

          <Section title="9. Information security">
            <p>
              ASCEND will take reasonable organisational and technical
              measures to protect personal information against unauthorised
              access, loss, misuse or disclosure.
            </p>
          </Section>

          <Section title="10. Retention">
            <p>
              Personal information will be retained only for as long as
              reasonably necessary for the purposes for which it was collected
              and for applicable legal, regulatory, safeguarding and
              record-keeping requirements.
            </p>
          </Section>

          <Section title="11. Your rights">
            <p>
              Depending on the applicable data-protection law, individuals may
              have rights concerning access, correction, deletion, restriction,
              objection or portability of their personal information.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Privacy enquiries and requests concerning personal information
              should be submitted to ASCEND using the contact information
              published on the official ASCEND website.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
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
