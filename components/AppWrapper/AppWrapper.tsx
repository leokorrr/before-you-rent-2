'use client'
import React from 'react'
import { IAppWrapperProps } from './types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const AppWrapper: React.FC<IAppWrapperProps> = (props) => {
  const { children } = props

  const queryClient = new QueryClient()

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
