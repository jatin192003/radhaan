import { HeroSection } from "@/components/home/HeroSection";
import { TrustSection } from "@/components/home/TrustSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CTABanner } from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <div className="page-enter">
      <HeroSection />
      <TrustSection />
      <CategoriesSection />
      <FeaturedProducts />
      <HowItWorks />
      <CTABanner />
    </div>
  );
}
