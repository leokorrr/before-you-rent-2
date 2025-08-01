import { NextRequest, NextResponse } from 'next/server'
import { getMapsData } from './map.service'
import z from 'zod'

const SearchSchema = z.object({
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  selectedFilters: z.array(z.string()).optional().default([]),
  radiusKm: z.number().min(0.1, 'Radius must be at least 0.1km').max(50, 'Radius cannot exceed 50km').optional().default(1)
})

export async function POST(req: NextRequest) {
  // * Get body
  let data

  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ message: 'Smth went wrong' }, { status: 500 })
  }

  const validationResult = SearchSchema.safeParse(data)

  if (!validationResult.success) {
    console.error(validationResult.error)
    return NextResponse.json({ message: 'Smth. went wrong' }, { status: 400 })
  }

  // * Add data to Database
  try {
    const mapsData = await getMapsData({
      address: data.address,
      selectedFilters: data.selectedFilters,
      radiusKm: data.radiusKm
    })

    return NextResponse.json({ data: mapsData })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Smth went wrong' }, { status: 500 })
  }
}
