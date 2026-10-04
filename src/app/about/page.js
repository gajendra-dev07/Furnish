import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import MotionSection from "@/components/ui/MotionSection";
import { media } from "@/constants/media";
import styles from "./about.module.css";

export const metadata = {
  title: "Our Story & Craft | Furnis Handcrafted Kitchenware",
  description:
    "Discover Furnis — handcrafted Acacia and White Oak kitchenware shaped for calm daily rituals. Learn about our sustainable timber, 4-stage atelier process, and knife-friendly boards.",
};

const stats = [
  { value: "100%", label: "Solid Hardwood", detail: "Kiln-dried Acacia & American Oak" },
  { value: "12-Step", label: "Artisanal Finish", detail: "Multi-grit hand sanded to 320-grit" },
  { value: "Organic", label: "Food-Safe Seal", detail: "Cold-pressed mineral oil & beeswax" },
  { value: "Lifetime", label: "Craft Promise", detail: "Guaranteed against structural defects" },
];

const materials = [
  {
    name: "Heartwood Acacia",
    botanical: "Acacia Nilotica",
    image: media.acaciaBoard,
    alt: "Furnis Acacia wood chopping board showing deep warm grain",
    badge: "Signature Wood",
    description:
      "Celebrated for its dramatic golden-amber marbling and natural water-shedding oils. Dense enough to endure heavy prep yet gentle on hardened Japanese and German steel.",
    specs: [
      { label: "Janka Hardness", value: "1,750 lbf" },
      { label: "Grain Structure", value: "Interlocked & Dense" },
      { label: "Moisture Resistance", value: "Exceptionally High" },
      { label: "Best For", value: "Daily Chopping & Wet Prep" },
    ],
  },
  {
    name: "American White Oak",
    botanical: "Quercus Alba",
    image: media.oakTray,
    alt: "Furnis White Oak serving tray with ergonomic carry handles",
    badge: "Architectural Hardwood",
    description:
      "Prized for tight cellular tyloses that prevent liquid penetration and distinctive medullary ray flecks. Provides rock-solid dimensional stability for generous hosting trays.",
    specs: [
      { label: "Janka Hardness", value: "1,360 lbf" },
      { label: "Grain Structure", value: "Straight & Distinctive" },
      { label: "Moisture Resistance", value: "Naturally Sealed Cells" },
      { label: "Best For", value: "Serving Platters & Carving" },
    ],
  },
  {
    name: "End-Grain Prep Hardwoods",
    botanical: "Aged Hardwood Blends",
    image: media.boardFlat,
    alt: "Furnis flat prep board on kitchen surface",
    badge: "Chef's Companion",
    description:
      "Crafted with vertically aligned wood fibers that part under the blade tip and spring back together. The pinnacle of blade preservation for serious home cooks.",
    specs: [
      { label: "Blade Cushion", value: "Self-Healing Grain" },
      { label: "Weight Balance", value: "Anchored & Substantial" },
      { label: "Edge Comfort", value: "Hand-Routed Chamfer" },
      { label: "Best For", value: "Precision Knife Work & Slicing" },
    ],
  },
];

const processSteps = [
  {
    step: "01",
    phase: "Timber Selection",
    title: "Kiln-Stabilized Heartwood",
    description:
      "We source sustainably harvested logs dried to 8–10% moisture content. Each plank is hand-inspected for stable heartwood, grain continuity, and natural figure.",
  },
  {
    step: "02",
    phase: "Joinery & Shaping",
    title: "Architectural Precision",
    description:
      "Pieces are book-matched to balance internal grain tension, preventing warping over years of washing. Generous ergonomic undercuts and perimeter juice wells are precision-routed.",
  },
  {
    step: "03",
    phase: "Surface Refinement",
    title: "Triple-Grit Hand Sanding",
    description:
      "Surfaces pass through 80, 150, 220, and 320-grit abrasives. We 'pop' the grain with water between steps to raise fibers and trim them smooth, ensuring a velvety touch.",
  },
  {
    step: "04",
    phase: "Botanical Curing",
    title: "Cold-Pressed Mineral Seal",
    description:
      "Every board is submerged in deep food-grade mineral oil, then buffed with our proprietary beeswax and carnauba balm. Zero synthetic varnishes, 100% food-safe.",
  },
];

const rituals = [
  {
    time: "07:30 AM",
    title: "The Morning Espresso & Toast",
    desc: "A small Acacia tray catching warm brioche crumbs and a steaming cup, turning simple breakfast moments into a calm pause.",
    image: media.heroBoard1,
    alt: "Morning bread board with knife and crusty sourdough",
  },
  {
    time: "06:45 PM",
    title: "The Evening Prep & Sizzle",
    desc: "A weighty prep board anchoring the counter — rhythmic knife strikes slicing through crisp shallots, rosemary, and ripe vine tomatoes.",
    image: media.heroTray1,
    alt: "Evening kitchen counter chopping board with herbs and prep ingredients",
  },
  {
    time: "09:15 PM",
    title: "The Gathering & Unwind",
    desc: "A generous White Oak centerpiece holding aged cheddar, cured meats, and dried figs as conversations linger late into the night.",
    image: media.heroBoard2,
    alt: "Charcuterie board arranged with artisan cheeses and crackers",
  },
];

const careGuides = [
  {
    icon: "01",
    title: "Gentle Hand Wash",
    text: "Rinse with lukewarm water and mild dish soap immediately after use. Never soak or wash in the dishwasher.",
    note: "Takes under 30 seconds",
  },
  {
    icon: "02",
    title: "Upright Air Drying",
    text: "Always stand your board on its edge to dry. Equal air circulation on both faces prevents uneven moisture absorption.",
    note: "Preserves natural flatness",
  },
  {
    icon: "03",
    title: "Monthly Oil Bath",
    text: "When the wood appears thirsty or pale, rub a teaspoon of organic food-grade mineral oil into the grain with a soft cloth.",
    note: "Deepens rich wood luster",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* ── 1. Hero Section ────────────────────────────── */}
        <section className={styles.hero} aria-labelledby="about-hero-title">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.heroAcacia}
            alt="Warm hardwood kitchenware spread by Furnis"
            className={styles.heroBg}
            priority="true"
          />
          <div className={styles.heroOverlay} aria-hidden="true" />

          <div className={`container ${styles.heroInner}`}>
            <h1 id="about-hero-title" className={styles.heroTitle}>
              Pieces shaped by time, made for daily ritual.
            </h1>

            <p className={styles.heroLead}>
              We craft solid Acacia and White Oak kitchen tools designed to age
              with grace — enduring your sharpest knives, gathering character,
              and earning a permanent place on your counter.
            </p>

            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.heroBtnPrimary}>
                <span>Explore The Collection</span>
              </Link>
              <a href="#the-craft" className={styles.heroBtnSecondary}>
                <span>Discover Our Story</span>
                <span className={styles.heroArrowDown} aria-hidden="true">
                  ↓
                </span>
              </a>
            </div>
          </div>

          {/* Hero Quick Stat Ticker */}
          <div className={styles.heroStatsBar}>
            <div className={`container ${styles.heroStatsGrid}`}>
              {stats.map((item, idx) => (
                <div key={idx} className={styles.heroStatItem}>
                  <span className={styles.heroStatValue}>{item.value}</span>
                  <div className={styles.heroStatMeta}>
                    <span className={styles.heroStatLabel}>{item.label}</span>
                    <span className={styles.heroStatDetail}>{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. The Craft & Origins ─────────────────────── */}
        <section id="the-craft" className={styles.sectionCraft}>
          <div className="container">
            <MotionSection className={styles.craftGrid}>
              {/* Media Column with Floating Quote */}
              <div className={styles.craftMediaCol}>
                <div className={styles.craftImageFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.heroTray2}
                    alt="Hand-sanded wooden serving tray on a calm kitchen surface"
                    className={styles.craftImage}
                  />
                </div>

                <div className={styles.craftQuoteCard}>
                  <blockquote className={styles.craftQuoteText}>
                    &ldquo;A kitchen board is never just wood. It is the steady
                    altar where every family recipe begins.&rdquo;
                  </blockquote>
                  <cite className={styles.craftQuoteAuthor}>
                    — Master Woodworker, Atelier Furnis
                  </cite>
                </div>
              </div>

              {/* Text Column */}
              <div className={styles.craftCopyCol}>
                <h2 className={styles.sectionTitle}>
                  Wood that earns its place on your counter
                </h2>

                <p className={styles.bodyTextLead}>
                  Furnis was founded on a simple reaction to modern disposable
                  kitchens: tools should feel as intentional and durable as the
                  meals they help prepare.
                </p>

                <p className={styles.bodyText}>
                  Rather than chasing fleeting trend cycles or substituting
                  natural grain with synthetic composites, we celebrate the slow
                  authenticity of solid hardwood. Every cutting board, serving
                  tray, and kitchen organizer is designed to stay out in the
                  open — catching the morning light rather than hidden away in a
                  dark cabinet.
                </p>

                <p className={styles.bodyText}>
                  We hand-match each board for grain alignment, ease sharp
                  corners with gentle ergonomic bevels, and condition surfaces
                  with cold-pressed botanical oils. With every slice of crusty
                  sourdough and every dash of sea salt, the wood matures,
                  gathering memories and a rich, golden patina.
                </p>

                <div className={styles.craftPillarsList}>
                  <div className={styles.craftPillarItem}>
                    <span className={styles.pillarCheck}>✓</span>
                    <div>
                      <strong>Blade-Friendly Grain</strong>
                      <p>Softens knife impact to preserve edge sharpness</p>
                    </div>
                  </div>
                  <div className={styles.craftPillarItem}>
                    <span className={styles.pillarCheck}>✓</span>
                    <div>
                      <strong>Zero Synthetic Sealants</strong>
                      <p>Only pure mineral oil and unbleached beeswax</p>
                    </div>
                  </div>
                  <div className={styles.craftPillarItem}>
                    <span className={styles.pillarCheck}>✓</span>
                    <div>
                      <strong>Enduring Joinery</strong>
                      <p>Engineered to neutralize natural timber warping</p>
                    </div>
                  </div>
                </div>
              </div>
            </MotionSection>
          </div>
        </section>

        {/* ── 3. Material Mastery ────────────────────────── */}
        <section className={styles.sectionMaterials}>
          <div className="container">
            <MotionSection className={styles.materialsHeader}>
              <h2 className={styles.sectionTitle}>
                Chosen for grain, weight, and endurance
              </h2>
              <p className={styles.sectionSubtitle}>
                We refuse plastic, bamboo fibers, and composite dust. Every
                Furnis item is sculpted from prime-grade, kiln-seasoned
                hardwoods.
              </p>
            </MotionSection>

            <div className={styles.materialsGrid}>
              {materials.map((mat, idx) => (
                <MotionSection
                  key={mat.name}
                  delay={0.1 * (idx + 1)}
                  className={styles.materialCard}
                >
                  <div className={styles.materialImgWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mat.image}
                      alt={mat.alt}
                      className={styles.materialImg}
                    />
                  </div>

                  <div className={styles.materialContent}>
                    <div className={styles.materialHead}>
                      <h3 className={styles.materialName}>{mat.name}</h3>
                      <span className={styles.materialBotanical}>
                        {mat.botanical}
                      </span>
                    </div>

                    <p className={styles.materialDesc}>{mat.description}</p>

                    <div className={styles.materialSpecs}>
                      {mat.specs.map((spec, sIdx) => (
                        <div key={sIdx} className={styles.specRow}>
                          <span className={styles.specLabel}>{spec.label}</span>
                          <span className={styles.specValue}>{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </MotionSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. The Atelier Process ─────────────────────── */}
        <section className={styles.sectionProcess}>
          <div className="container">
            <MotionSection className={styles.processHeader}>
              <h2 className={styles.sectionTitle}>
                The 4-Stage Atelier Process
              </h2>
              <p className={styles.sectionSubtitle}>
                Four patient stages. Zero automated shortcuts. Each piece is
                touched by experienced woodworkers who understand grain tension.
              </p>
            </MotionSection>

            <div className={styles.processGrid}>
              {processSteps.map((step, idx) => (
                <MotionSection
                  key={step.step}
                  delay={0.08 * (idx + 1)}
                  className={styles.processCard}
                >
                  <div className={styles.processCardTop}>
                    <span className={styles.processNum}>{step.step}</span>
                    <span className={styles.processPhase}>{step.phase}</span>
                  </div>
                  <h3 className={styles.processTitle}>{step.title}</h3>
                  <p className={styles.processDesc}>{step.description}</p>
                  <div className={styles.processAccentLine} aria-hidden="true" />
                </MotionSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. High-Contrast Brand Manifesto ────────────── */}
        <section className={styles.sectionManifesto}>
          <div className="container">
            <MotionSection className={styles.manifestoBox}>
              <div className={styles.manifestoInner}>
                <blockquote className={styles.manifestoQuote}>
                  &ldquo;We do not build pieces for cupboards. We make kitchen
                  companions that belong on your counter — to live in the
                  morning sun, welcome your sharpest knives, and collect the
                  warm patina of everyday life.&rdquo;
                </blockquote>
                <div className={styles.manifestoGrid}>
                  <div className={styles.manifestoItem}>
                    <strong>FSC Timber</strong>
                    <span>Ethically harvested from managed farm forests</span>
                  </div>
                  <div className={styles.manifestoItem}>
                    <strong>Knife-First Care</strong>
                    <span>Absorbs edge impact without blunting blades</span>
                  </div>
                  <div className={styles.manifestoItem}>
                    <strong>Pure Botanical</strong>
                    <span>Safe for direct contact with hot bread & fruit</span>
                  </div>
                  <div className={styles.manifestoItem}>
                    <strong>10-Year Guarantee</strong>
                    <span>Covered against delamination or natural splits</span>
                  </div>
                </div>
              </div>
            </MotionSection>
          </div>
        </section>

        {/* ── 6. Everyday Kitchen Rituals ──────────────────── */}
        <section className={styles.sectionRituals}>
          <div className="container">
            <MotionSection className={styles.ritualsHeader}>
              <h2 className={styles.sectionTitle}>
                Three Everyday Kitchen Moments
              </h2>
              <p className={styles.sectionSubtitle}>
                Designed to move seamlessly from morning cutting board to evening
                serving platter.
              </p>
            </MotionSection>

            <div className={styles.ritualsGrid}>
              {rituals.map((r, idx) => (
                <MotionSection
                  key={r.title}
                  delay={0.1 * (idx + 1)}
                  className={styles.ritualCard}
                >
                  <div className={styles.ritualImgFrame}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.alt}
                      className={styles.ritualImg}
                    />
                  </div>
                  <div className={styles.ritualBody}>
                    <h3 className={styles.ritualTitle}>{r.title}</h3>
                    <p className={styles.ritualDesc}>{r.desc}</p>
                  </div>
                </MotionSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Care & Longevity Guide ──────────────────── */}
        <section className={styles.sectionCare}>
          <div className="container">
            <MotionSection className={styles.careBox}>
              <div className={styles.careHeader}>
                <h2 className={styles.sectionTitle}>
                  Honoring the Wood: Easy Care for Generations
                </h2>
                <p className={styles.sectionSubtitle}>
                  Acacia and oak are living materials. Give them two minutes of
                  care each month, and they will easily outlast any synthetic board.
                </p>
              </div>

              <div className={styles.careGrid}>
                {careGuides.map((guide, idx) => (
                  <div key={idx} className={styles.careCard}>
                    <span className={styles.careIcon}>{guide.icon}</span>
                    <h3 className={styles.careTitle}>{guide.title}</h3>
                    <p className={styles.careText}>{guide.text}</p>
                    <span className={styles.careNote}>{guide.note}</span>
                  </div>
                ))}
              </div>
            </MotionSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
