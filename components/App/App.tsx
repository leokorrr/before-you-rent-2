'use client'
import { fetcher } from '@/utils/fetcher'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { PlacesSection } from '../PlacesSection/PlacesSection'
import { Filters } from '../Filters/Filters'
import { FilterKey } from '../Filters/types'
import { Map } from '../Map/Map'
import { RadiusOptions } from '../RadiusOptions/RadiusOptions'
import { toast } from 'react-toastify'

export const App = () => {
  const [address, setAddress] = useState('')
  // const [address, setAddress] = useState('Pilotów 23a, Gdańsk, Poland')

  const [radiusKm, setRadiusKm] = React.useState<1 | 5 | 10>(1)

  const [selectedFilters, setSelectedFilters] = useState<FilterKey[]>([])

  const [places, setPlaces] = useState([])

  const [mapPlaces, setMapPlaces] = useState([])

  const [coordinates, setCoordinates] = useState()

  const [error, setError] = useState('')

  const { mutate: getAddressData, isPending } = useMutation({
    mutationFn: (address: string) =>
      fetcher('/api/map', {
        method: 'POST',
        body: JSON.stringify({ address, selectedFilters, radiusKm })
      }),
    onSuccess: (data) => {
      const places = Object.keys(data?.data.places).map((key) => ({
        sectionTitle: key,
        places: data?.data.places[key]
      }))
      setPlaces(places)
      setCoordinates(data?.data.coordinates)
      setMapPlaces(data?.data.places)
    },
    onError: () => {
      toast.error('Smth went terribly wrong. Please try again later', { theme: 'dark' })
    }
  })

  const handleInputChange = (e) => {
    setAddress(e.target.value)
  }

  const handleAddressSend = () => {
    setError('')
    if (address?.trim()?.length > 0 && address.trim().length < 200) {
      getAddressData(address)
    } else {
      setError('Address must be between 1 and 200 characters long')
    }
  }

  return (
    <div className='md:min-h-[calc(100vh-150px)] h-full w-full flex justify-center p-[20px]'>
      <div className='h-full w-full md:w-[700px]'>
        <p className='text-[#ededed] text-[16px] mb-[16px]'>
          Thinking about renting somewhere new?
        </p>
        <p className='text-[#ededed] text-[16px] mb-[16px]'>
          BeforeYouRent 2 helps you check what is nearby your potential new home
        </p>
        <p className='text-[#ededed] text-[16px] mb-[16px]'>
          ! We dont collect any data you provide
        </p>

        <h2 className='font-bold md:text-[28px] text-[20px] mb-[16px] text-[#ededed]'>
          Provide your address
        </h2>
        <div className='flex justify-center items-center md:flex-row flex-col'>
          <input
            type='text'
            placeholder='Street, City, Country (optionally)'
            className='text-[#ededed] px-[12px] h-[54px] md:w-[600px] w-full bg-[#0a0a0a] font-[30px] rounded-[6px] border border-[#292929]'
            onChange={handleInputChange}
            value={address}
          />
          <button
            onClick={handleAddressSend}
            disabled={isPending}
            aria-busy={isPending}
            className={`transition hidden md:block mt-[20px] md:mt-0 h-[54px] w-full md:w-[100px] rounded-[6px] font-semibold md:ml-[8px]
    bg-[#ededed] text-[#0A0A0A] hover:bg-[#cccccc] hover:cursor-pointer
    flex items-center justify-center gap-2
    ${isPending ? 'opacity-60 cursor-not-allowed hover:bg-[#ededed]' : ''}`}
          >
            {isPending && (
              <svg
                className='animate-spin h-5 w-5'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                  fill='none'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                />
              </svg>
            )}
            {!isPending && <span>Send</span>}
          </button>
        </div>
        {error && <p className='text-[#ff0000] text-[14px] mt-[8px]'>{error}</p>}
        <h3 className='font-bold md:text-[18px] text-[16px] mb-[12px] mt-[24px] text-[#ededed]'>
          Property types
        </h3>
        <Filters
          className='mt-[2px] mb-[24px]'
          selected={selectedFilters}
          onChange={setSelectedFilters}
          // className='space-y-2'
        />
        <h3 className='font-bold md:text-[18px] text-[16px] mb-[12px]  text-[#ededed]'>
          Search radius
        </h3>
        <RadiusOptions
          value={radiusKm}
          onChange={setRadiusKm}
          className='mt-1'
        />

        <button
          onClick={handleAddressSend}
          disabled={isPending}
          aria-busy={isPending}
          className={`transition  md:hidden mt-[20px] md:mt-0 h-[54px] w-full md:w-[100px] rounded-[6px] font-semibold md:ml-[8px]
    bg-[#ededed] text-[#0A0A0A] hover:bg-[#cccccc] hover:cursor-pointer
    flex items-center justify-center gap-2
    ${isPending ? 'opacity-60 cursor-not-allowed hover:bg-[#ededed]' : ''}`}
        >
          {isPending && (
            <svg
              className='animate-spin h-5 w-5'
              viewBox='0 0 24 24'
              aria-hidden='true'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
                fill='none'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
              />
            </svg>
          )}
          {!isPending && <span>Send</span>}
        </button>

        {!isPending && places && coordinates && (
          <div className='my-[32px]'>
            <Map
              center={coordinates}
              places={mapPlaces}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
            />
          </div>
        )}
        <div className='flex justify-center items-center '>
          <div className='w-full md:w-[700px] '>
            {!isPending &&
              places.map((place, index) => (
                <PlacesSection
                  key={index}
                  places={place.places}
                  sectionTitle={place.sectionTitle}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
