import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-heading text-lg font-bold tracking-tight">EDAN</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Premium custom screen printing for apparel, events, and brands.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Navigation</p>
            <ul className="flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/order", label: "Place Order" },
                { to: "/track", label: "Track Order" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Contact</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              sargsyand@wit.edu<br />
              Mon – Fri, 9 AM – 5 PM
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; WIT 2026 EDAN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
