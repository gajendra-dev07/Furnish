import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Link from "next/link";import MotionSection from "@/components/ui/MotionSection";

export const metadata = {
  title: "Our Story | AURA Furniture",
  description: "Learn about AURA's dedication to organic luxury minimalism, artisan craftsmanship, sustainable harvesting, and our 10-year structural warranty.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: "120px", minHeight: "calc(100vh - 80px)" }}>
        <div className="container">
          <SectionHeading
            badge="Brand History"
            title="Slowing Down. Scaling Quality."
            subtitle="The history and architectural philosophy behind the AURA design collective."
          />

          {/* Editorial Grid Layout */}
          <MotionSection delay={0.2} style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-2xl)",
            marginTop: "var(--space-xl)",
            alignItems: "center"
          }}>
            {/* Split row 1 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--space-xl)",
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
                lineHeight: "1.7",
                fontFamily: "var(--font-sans), sans-serif",
                color: "var(--color-secondary)",
                fontSize: "0.95rem"
              }}>
                <h3 style={{
                  fontFamily: "var(--font-serif), Georgia, serif",
                  fontSize: "1.5rem",
                  color: "var(--color-primary)",
                  fontWeight: 400
                }}>
                  The Artisan Heritage
                </h3>
                <p>
                  AURA was founded in 2018 as a direct response to the era of fast-furniture. We believed that modern living spaces deserved something more permanent, organic, and architectural. By collaborating with independent cabinet makers and stone masons, we began drawing up furniture that did not just fill rooms, but anchored them.
                </p>
                <p>
                  Every piece we construct is treated as a monument. Rather than assembly lines, our pieces are cut, joined, and finished in small, controlled artisan batches. This ensures that every joint is perfectly flush, every grain pattern matches, and every piece of travertine holds its natural mineral history.
                </p>
              </div>
            </div>

            {/* Split row 2 - Materials */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--space-xl)",
              backgroundColor: "var(--color-bg-secondary)",
              padding: "var(--space-2xl) var(--space-xl)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xs)"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-md)",
                lineHeight: "1.7",
                fontFamily: "var(--font-sans), sans-serif",
                color: "var(--color-secondary)",
                fontSize: "0.95rem"
              }}>
                <h3 style={{
                  fontFamily: "var(--font-serif), Georgia, serif",
                  fontSize: "1.5rem",
                  color: "var(--color-primary)",
                  fontWeight: 400
                }}>
                  Curated Material Palette
                </h3>
                <p>
                  We are obsessive about materials. We select travertine stone directly from Tuscan quarries, ensuring beautiful cream mineral banding. Our hardwoods are FSC-certified American Ash, Walnut, and White Oak, dried slowly in kilns to prevent any warping over years of use.
                </p>
                <p>
                  Our fabrics are sourced from historic Belgian textile mills, woven in thick bouclé and high-rub linens. They feel extremely soft, rich in texture, and are coated with eco-friendly stain resistance to handle real life while maintaining their editorial looks.
                </p>
              </div>
            </div>

            {/* splitting bottom block */}
            <div style={{
              textAlign: "center",
              marginTop: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-md)"
            }}>
              <h3 style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                fontSize: "1.6rem",
                color: "var(--color-primary)",
                fontWeight: 400
              }}>
                Experience AURA Design
              </h3>
              <p style={{
                fontFamily: "var(--font-sans), sans-serif",
                color: "var(--color-secondary)",
                fontSize: "0.95rem",
                maxWidth: "550px",
                lineHeight: "1.6",
                marginBottom: "var(--space-md)"
              }}>
                We invite you to browse our full catalog of modular lounge seating, stone centerpiece tables, and accent casegoods. Let us help you curate a space for refined living.
              </p>
              <Link href="/shop">
                <Button variant="primary">Shop All Collections</Button>
              </Link>
            </div>
          </MotionSection>
        </div>
      </main>
      <Footer />
    </>
  );
}
