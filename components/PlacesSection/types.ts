type TPlace = {
  name: string
  rating: number
  address: string
  types: string[]
  location: {
    latitude: number
    longitude: number
  }
}

export type TPlacesSectionProps = {
  sectionTitle: string
  places: TPlace[]
}
