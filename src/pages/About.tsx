import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useEffect, useRef } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import tobyImg from "@/assets/toby.jpg";
import davidImg from "@/assets/myphoto.jpeg";
import joshImg from "@/assets/josh.jpg";

const aboutAnimations = {
  idea: "/lottie/about-idea.json",
  client: "/lottie/about-client.json",
  mission: "/lottie/about-mission.json",
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function ParallaxSection({
  children,
  className = "",
  speed = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * speed}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

const teamMembers = [
  {
    name: "David Sargsyan",
    role: "Founder / Web Developer",
    bio: "Creative director, mainly working on UX and assists with frontend and backend when needed",
    photo: davidImg,
  },
  {
    name: "Toby Dokyi",
    role: "Web Developer",
    bio: "Working on main structure/layout of the website, as well as the overall frontend and animations",
    photo: tobyImg,
  },
  {
    name: "Joshua Solorzano",
    role: "Backend Developer",
    bio: "Working on backend development including JavaScript logic, database work, and supporting frontend tasks when needed.",
    photo: joshImg,
  },
];

export default function About() {
  return (
    <>
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl leading-[1.1]">
            About EDAN
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Learn more about the idea behind EDAN, who it serves, and what the business is built to do.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-6 py-24">
          <div className="flex items-center justify-between gap-12">
            <div className="max-w-2xl flex-1">
              <Reveal>
                <ParallaxSection speed={0.08}>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Our Idea</h2>
                  <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      This project is a website for a screen printing business. The site showcases the
                      business's services, portfolio, and contact information. The goal of the project is
                      to create an attractive and user-friendly website that effectively represents the
                      business and its offerings.
                    </p>
                    <p>
                      EDAN is built around the idea that custom apparel should do more than just look good.
                      It should help represent a business, team, organization, or individual in a strong
                      and professional way. Through screen printing and custom apparel, EDAN aims to turn
                      simple ideas into products that people are proud to wear.
                    </p>
                  </div>
                </ParallaxSection>
              </Reveal>
            </div>
          <div className="hidden md:flex items-center justify-center w-48 h-48 shrink-0">
              <Player
                autoplay
                loop
                src={aboutAnimations.idea}
                className="h-44 w-44"
                aria-label="Our Idea animation"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24 overflow-hidden">
        <div className="flex items-center justify-between gap-12">
          <div className="max-w-2xl flex-1">
            <Reveal>
              <ParallaxSection speed={-0.06}>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">The Client</h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    The client will be able to look at the business's portfolio and find clear ways to
                    contact the business owner. The website is designed to make it easy for customers to
                    understand what the business offers and how they can begin the ordering process.
                  </p>
                  <p>
                    Whether someone is ordering for a business, sports team, event, or organization,
                    they should be able to navigate the site easily and feel confident in the service
                    being offered.
                  </p>
                </div>
              </ParallaxSection>
            </Reveal>
          </div>
          <div className="hidden md:flex items-center justify-center w-48 h-48 shrink-0">
            <Player
              autoplay
              loop
              src={aboutAnimations.client}
              className="h-44 w-44"
              aria-label="The Client animation"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-6 py-24">
          <div className="flex items-center justify-between gap-12">
            <div className="max-w-2xl flex-1">
              <Reveal>
                <ParallaxSection speed={0.1}>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Our Mission</h2>
                  <p className="mt-6 text-muted-foreground leading-relaxed">
                    Our mission is to provide high-quality custom apparel with a focus on design,
                    professionalism, and a simple client experience. EDAN is meant to help people bring
                    their ideas to life through apparel that represents who they are and what they stand for.
                  </p>
                </ParallaxSection>
              </Reveal>
            </div>
            <div className="hidden md:flex items-center justify-center w-48 h-48 shrink-0">
              <Player
                autoplay
                loop
                src={aboutAnimations.mission}
                className="h-44 w-44"
                aria-label="Our Mission animation"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24 overflow-hidden">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Project Team</h2>
          <p className="mt-2 text-muted-foreground">The people behind EDAN.</p>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {teamMembers.map((m, i) => (
            <Reveal key={m.name}>
              <ParallaxSection speed={0.04 * (i - 1)}>
                <div
                  className="rounded-lg border border-border bg-card p-6 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-lg hover:border-accent/40 cursor-pointer"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <img
                    src={m.photo}
                    alt={`${m.name} portrait`}
                    className="mx-auto h-28 w-28 rounded-full object-cover border-2 border-border transition-all duration-300 group-hover:border-accent"
                  />
                  <h3 className="mt-4 text-base font-semibold">{m.name}</h3>
                  <p className="text-sm font-medium text-accent">{m.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
                </div>
              </ParallaxSection>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
