import Link from "next/link";

export default function PlayerAgreementPage() {
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
          Player Agreement
        </div>

        <h1 className="mt-3 text-4xl font-black">
          ASCEND Football Showcase Player Agreement
        </h1>

        <p className="mt-3 text-sm text-white/40">
          Lagos 2027
        </p>

        <div className="mt-10 space-y-10 text-sm leading-7 text-white/65">
          <Section title="1. Participation">
            <p>
              The Player agrees to participate professionally and in good
              faith in the ASCEND Football Showcase and to comply with the
              reasonable requirements of the Showcase programme.
            </p>
          </Section>

          <Section title="2. Player information">
            <p>
              The Player confirms that information supplied to ASCEND,
              including identity, age, football history, representation and
              medical information, is accurate to the best of the
              Player&apos;s knowledge.
            </p>
          </Section>

          <Section title="3. Fitness and medical matters">
            <p>
              The Player acknowledges that football is a physical activity
              involving an inherent risk of injury and agrees to disclose
              relevant medical conditions, injuries or restrictions that may
              affect safe participation.
            </p>
          </Section>

          <Section title="4. Player conduct">
            <p>
              The Player will behave professionally, respect other players,
              coaches, scouts, officials and staff, and follow reasonable
              sporting, safeguarding, health and safety instructions.
            </p>
          </Section>

          <Section title="5. Football assessment">
            <p>
              The Player understands that performance may be observed,
              assessed, recorded and discussed by ASCEND personnel and
              authorised football professionals for legitimate Showcase,
              scouting and recruitment purposes.
            </p>
          </Section>

          <Section title="6. No guaranteed outcome">
            <p>
              Participation does not guarantee selection, a club trial,
              academy place, scholarship, employment contract, professional
              contract, transfer or any other football opportunity.
            </p>
          </Section>

          <Section title="7. Representation status">
            <p>
              The Player must accurately disclose whether they are currently
              represented by a football agent or other representative and must
              inform ASCEND if that information changes.
            </p>
          </Section>

          <Section title="8. ASCEND-originated opportunities">
            <p>
              The Player acknowledges that football opportunities, club
              interest or introductions may arise as a direct result of
              participation in the ASCEND Football Showcase.
            </p>

            <p className="mt-4">
              Where the Player is already represented, the Player authorises
              ASCEND to contact the representative identified during
              registration in relation to such opportunities.
            </p>

            <p className="mt-4">
              Where football agent services are required, any services,
              cooperation between football agents and any related remuneration
              will be dealt with separately and in accordance with applicable
              football agent regulations and any agreement required between
              the relevant parties.
            </p>
          </Section>

          <Section title="9. Football agent representation">
            <p>
              This Player Agreement does not appoint ASCEND as the
              Player&apos;s football agent and does not itself create a
              football representation agreement.
            </p>

            <p className="mt-4">
              Where an unrepresented Player expresses an interest in ASCEND
              representation, any appointment will be discussed separately and
              will require a separate representation agreement.
            </p>
          </Section>

          <Section title="10. Media">
            <p>
              Media and publicity use will be governed by the separate media
              choice made by the Player, parent or legal guardian during
              registration.
            </p>
          </Section>

          <Section title="11. Privacy">
            <p>
              Personal information associated with participation will be
              processed in accordance with the ASCEND Football Showcase
              Privacy Notice.
            </p>
          </Section>

          <Section title="12. Parent or guardian">
            <p>
              Where the Player is under 18 at the relevant event date, the
              Player&apos;s parent or legal guardian accepts this Agreement on
              the Player&apos;s behalf and gives the permissions necessary for
              participation.
            </p>
          </Section>

          <Section title="13. Acceptance">
            <p>
              Electronic acceptance during registration records the
              Player&apos;s, or where applicable parent or legal
              guardian&apos;s, agreement to these terms.
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
