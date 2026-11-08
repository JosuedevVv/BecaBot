import { LandingHero } from './components/landing/LandingHero'
import { LandingStatsBar } from './components/landing/LandingStatsBar'
import { LandingHowItWorks } from './components/landing/LandingHowItWorks'
import { LandingCategoriesGrid } from './components/landing/LandingCategoriesGrid'
import { LandingFooterCta } from './components/landing/LandingFooterCta'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <LandingHero />
      <LandingStatsBar />
      <LandingHowItWorks />
      <LandingCategoriesGrid />
      <LandingFooterCta />
    </div>
  )
}
