import React from 'react'
import { TPlacesSectionProps } from './types'
import { getSectionTitle } from './utils/getSectionTitle'

export const PlacesSection: React.FC<TPlacesSectionProps> = (props) => {
  const { places, sectionTitle } = props

  return (
    <div className='mb-[32px]'>
      <h2 className='font-bold md:text-[28px] text-[16px] mb-[8px] text-[#ededed]'>
        {getSectionTitle(sectionTitle)}
      </h2>
      <div className='flex flex-col gap-[20px]'>
        {places.map((place, index) => (
          <div
            key={index}
            className='bg-[#0a0a0a] px-[16px] py-[16px] rounded-[6px] border border-[#292929]'
          >
            <h3 className='text-[16px] mb-[4px] text-[#ededed]'>
              <span className='font-semibold'>{place.name}</span> -{' '}
              <span className='italic'>{place.address?.split(',')[0]}</span>
            </h3>
            <p className='text-[#ededed]'>Google rating: {place.rating} </p>
          </div>
        ))}
      </div>
    </div>
  )
}
