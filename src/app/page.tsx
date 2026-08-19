import Link from "next/link";
import Image from "next/image";

function AscendLogo() {
  return (
    <Link
      href="/"
      aria-label="ASCEND homepage"
      className="flex items-center gap-4"
    >
      <svg
        viewBox="0 0 54 54"
        className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
        fill="none"
        aria-hidden="true"
      >
        <path d="M27 3 49 46 27 35 5 46 27 3Z" fill="#1685ff" />
        <path d="M27 15 38 37 27 31 16 37 27 15Z" fill="#020812" />
      </svg>

      <div>
        <span className="block text-lg font-semibold tracking-[0.36em] text-white sm:text-xl">
          ASCEND
        </span>

        <span className="mt-1 block text-[10px] uppercase tracking-[0.28em] text-white/45">
          Football Showcase
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
 
<AscendLogo />

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#event" className="transition hover:text-white">
              Event
            </a>
            <a href="#programme" className="transition hover:text-white">
              Programme
            </a>
            <a href="#coaches" className="transition hover:text-white">
              Coaches
            </a>
            <a href="#scouts" className="transition hover:text-white">
              Scouts
            </a>
          </nav>

<div className="flex items-center gap-3">
  <a
    href="/staff/login"
    className="hidden rounded-full border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/45 transition hover:border-white/20 hover:text-white md:inline-flex"
  >
    Staff Login
  </a>

  <a
    href="/registration"
    className="rounded-full bg-[#c7ff2f] px-5 py-3 text-sm font-bold text-black transition hover:opacity-90"
  >
    Register Now
  </a>
</div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(199,255,47,0.12),transparent_28%)]" />

        <div className="relative mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 text-sm font-bold uppercase tracking-[0.28em] text-[#c7ff2f]">
              Lagos 2027
            </div>

            <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Ascend
              <br />
              Football
              <br />
              Showcase
            </h1>

            <p className="mt-8 max-w-2xl text-xl font-semibold uppercase tracking-[0.08em] text-white/90 sm:text-2xl">
              5 Days. One Stage. Your Opportunity.
            </p>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
              Train with UEFA-qualified coaches, compete in a professional
              football environment, and perform in front of scouts from
              European football.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
              <span>Onikan Stadium, Lagos</span>
              <span>January 2027</span>
              <span>Monday – Friday</span>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/registration"
                className="rounded-full bg-[#c7ff2f] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-black transition hover:opacity-90"
              >
                Secure Your Place
              </a>

              <a
                href="/assessment/cmsm92cq300059gmpt9v9l9xk"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:border-[#c7ff2f]/60 hover:text-[#c7ff2f]"
              >
                Explore ASCEND AI
              </a>
            </div>
          </div>

<div className="relative hidden h-[540px] overflow-hidden rounded-[2rem] border border-white/10 lg:block">
  <Image
    src="/images/showcase-hero.png"
    alt="ASCEND football showcase"
    fill
    priority
    className="object-cover"
  />

  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />
  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

  <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-black/75 p-6 backdrop-blur-md">
    <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#c7ff2f]">
      Registration Weekend
    </div>

    <div className="mt-3 text-2xl font-black">
      Saturday + Sunday
    </div>

    <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
      Check-in, documentation, medical and consent verification,
      bib collection, and group allocation before football begins
      on Monday.
    </p>
  </div>
</div>
</div>
      </section>

      <section
        id="event"
        className="border-y border-white/10 bg-white/[0.02]"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:grid-cols-4 lg:px-8">
          {[
            ["5 Days", "Football Programme", null],
            ["UEFA", "Qualified Coaches", null],
            ["Pro Scouts", "European Football", null],
            [
              "Player Analysis",
              "Powered by ASCEND AI →",
              "/assessment/cmsm92cq300059gmpt9v9l9xk",
            ],
          ].map(([title, label, href]) => {
            const content = (
              <>
                <div className="text-2xl font-black uppercase sm:text-3xl">
                  {title}
                </div>

                <div
                  className={`mt-2 text-xs uppercase tracking-[0.18em] ${
                    href
                      ? "text-[#c7ff2f]"
                      : "text-white/45"
                  }`}
                >
                  {label}
                </div>
              </>
            );

            return href ? (
              <Link
                key={title}
                href={href}
                className="group border-white/10 px-4 py-8 first:border-l-0 sm:border-l"
              >
                {content}
              </Link>
            ) : (
              <div
                key={title}
                className="border-white/10 px-4 py-8 first:border-l-0 sm:border-l"
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>

      {/* Official Partners */}
        <section className="border-b border-white/10 bg-[#0b0b0b]">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="text-center text-xs font-black uppercase tracking-[0.24em] text-white/40">
              Official Partners
            </div>

            <div className="mt-8 grid grid-cols-2 items-center gap-8 sm:grid-cols-4">
              {[1, 2, 3, 4].map((partner) => (
                <div
                  key={partner}
                  className="flex h-20 items-center justify-center"
                >
                  <div className="flex items-center gap-3 opacity-60 transition hover:opacity-100">
                    <svg
                      viewBox="0 0 54 54"
                      className="h-9 w-9 shrink-0"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M27 3 49 46 27 35 5 46 27 3Z"
                        fill="#1685ff"
                      />
                      <path
                        d="M27 15 38 37 27 31 16 37 27 15Z"
                        fill="#020812"
                      />
                    </svg>

                    <span className="text-sm font-semibold tracking-[0.28em] text-white">
                      ASCEND
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
    </main>
  );
}
