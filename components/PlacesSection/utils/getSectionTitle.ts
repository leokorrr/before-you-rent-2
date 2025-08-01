export const getSectionTitle = (googleMapsTitle: string) => {
  const titlesDictionary: any = {
    bank: 'Banks',
    grocery_store: 'Grocery stores',
    gym: 'Gyms',
    restaurant: 'Restaurants',
    shopping_mall: 'Shopping malls',
    transit_station: 'Bus stops, train stations, etc.',
    park: 'Parks',
    school: 'Schools',
    pharmacy: 'Pharmacies',
    hospital: 'Hospitals'
  }

  return titlesDictionary[googleMapsTitle.toLowerCase()] || 'Other locations'
}
