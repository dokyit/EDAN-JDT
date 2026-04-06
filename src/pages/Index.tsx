import { Link, useNavigate } from "react-router-dom";
import { Shirt, Package, CalendarDays, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useState, useCallback } from "react";

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

const services = [
  { icon: Shirt, title: "Custom Apparel", description: "T-shirts, hoodies, and more — printed with your designs in vibrant, lasting color." },
  { icon: Package, title: "Bulk Orders", description: "Competitive pricing on large runs. Perfect for businesses, teams, and organizations." },
  { icon: CalendarDays, title: "Event Merch", description: "Festivals, fundraisers, conferences — we handle tight deadlines without cutting corners." },
  { icon: Truck, title: "Fast Turnaround", description: "Most orders ship within 5–7 business days. Rush options available on request." },
];

const steps = [
  { num: "01", title: "Submit Your Design", description: "Upload your artwork and tell us what you need." },
  { num: "02", title: "We Review & Confirm", description: "Our team checks your files and sends a proof for approval." },
  { num: "03", title: "Print Production", description: "Your order goes to press with precision and care." },
  { num: "04", title: "Ship & Deliver", description: "Quality-checked and packed, then shipped to your door." },
];

const placeholderWorks = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  label: "Work in Progress",
}));

export default function Index() {
  const navigate = useNavigate();
  const [showDriveBy, setShowDriveBy] = useState(false);

  const handleOrderClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowDriveBy(true);
    setTimeout(() => {
      navigate("/order");
    }, 900);
  }, [navigate]);

  return (
    <>
      {/* Drive-by animation overlay */}
      {showDriveBy && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 animate-drive-by">
            <Truck className="h-16 w-16 md:h-24 md:w-24 text-accent" strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 bg-background/80 animate-fade-in-overlay" />
        </div>
      )}
      {/* Hero */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-[1.1]">
            Custom Screen Printing,{" "}
            <span className="text-accent">Done Right</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
            From one-off samples to large-scale production, EDAN delivers sharp, durable prints on premium garments — every time.
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" onClick={handleOrderClick} className="cursor-pointer">
              Place an Order <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Carousel */}
      <section className="border-y border-border bg-secondary/50 py-16 overflow-hidden">
        <div className="container mx-auto px-6 mb-8">
          <RevealSection>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Our Work</h2>
            <p className="mt-2 text-muted-foreground">A showcase of our recent prints and projects.</p>
          </RevealSection>
        </div>
        <div className="relative">
          <div className="flex animate-scroll gap-6 w-max">
            {[...placeholderWorks, ...placeholderWorks].map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 h-40 rounded-lg border border-border bg-card flex items-center justify-center"
              >
                <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-6 py-24">
          <RevealSection>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What We Do</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
              High-quality screen printing services built around your needs.
            </p>
          </RevealSection>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <RevealSection key={s.title}>
                <div
                  className="rounded-lg border border-border bg-card p-6 h-full"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <s.icon className="h-6 w-6 text-accent" />
                  <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container mx-auto px-6 py-24">
        <RevealSection>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How It Works</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            A straightforward process from design to delivery.
          </p>
        </RevealSection>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <RevealSection key={s.num}>
              <div style={{ transitionDelay: `${i * 120}ms` }}>
                <span className="text-3xl font-bold text-accent/30 font-heading">{s.num}</span>
                <h3 className="mt-2 text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-secondary/50">
        <div className="container mx-auto px-6 py-24 text-center">
          <RevealSection>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to Get Started?</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Submit your design and we'll take care of the rest.
            </p>
            <div className="mt-8">
              <Button size="lg" onClick={handleOrderClick} className="cursor-pointer">
                Place an Order <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </RevealSection>
        </div>
      </section>
    </>
  );
}
