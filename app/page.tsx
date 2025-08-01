import { App } from '@/components/App/App'

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BeforeYouRent 2',
    description: "Check what's around your potential rental property before you rent",
    url: 'beforeyourent.pl',
    applicationCategory: 'RealEstateApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Find nearby grocery stores',
      'Locate restaurants and cafes',
      'Check public transportation',
      'Find gyms and fitness centers',
      'Locate hospitals and pharmacies'
    ]
  }
  return (
    <>
      <App />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  )
}
