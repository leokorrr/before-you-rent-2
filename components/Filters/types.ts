export type FilterKey =
  | 'bank'
  | 'grocery_store'
  | 'gym'
  | 'restaurant'
  | 'shopping_mall'
  | 'transit_station'
  | 'park'
  | 'school'
  | 'pharmacy'
  | 'hospital'

export type FilterOptions = Record<FilterKey, string>

export type TFiltersProps = {
  selected: FilterKey[]
  onChange: (next: FilterKey[]) => void
  className?: string
}
