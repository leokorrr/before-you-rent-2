import React from 'react'
import { Checkbox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/20/solid'
import { FilterKey, FilterOptions, TFiltersProps } from './types'

const OPTIONS: FilterOptions = {
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

export const Filters: React.FC<TFiltersProps> = ({ selected, onChange, className }) => {
  const handleCheckboxToggle = (key: FilterKey) => (checked: boolean) => {
    if (checked) {
      if (!selected.includes(key)) onChange([...selected, key])
    } else {
      onChange(selected.filter((k) => k !== key))
    }
  }

  return (
    <div className={className}>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {Object.entries(OPTIONS).map(([key, label]) => {
          const k = key as FilterKey
          const isChecked = selected.includes(k)

          return (
            <Checkbox
              key={k}
              as='label'
              checked={isChecked}
              onChange={handleCheckboxToggle(k)}
              className='flex items-center gap-3 hover:cursor-pointer
                       group size-auto rounded-md p-0'
            >
              <span
                className='size-6 rounded-md p-1 ring-1 ring-white/15 ring-inset
                         bg-[#0a0a0a]
                         data-checked:bg-white
                         data-focus:outline data-focus:outline-offset-2 data-focus:outline-white'
                aria-hidden='true'
              >
                <CheckIcon className='hidden size-4 fill-white group-data-checked:block' />
              </span>
              <span className='text-sm text-[#ededed] select-none'>{label}</span>
            </Checkbox>
          )
        })}
      </div>
    </div>
  )
}
