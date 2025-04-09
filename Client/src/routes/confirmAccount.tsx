import * as React from 'react'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/confirmAccount')({
  component: RouteComponent,
  validateSearch: (search) => confirmAccountSchema.parse(search),
})

const confirmAccountSchema = z.object({
    email: z.string().email().catch(''),
    token: z.string().catch(''),
})
  
type ConfirmAccountSchema = z.infer<typeof confirmAccountSchema>

function RouteComponent() {
    const search = Route.useSearch();

    return (
        <div className='flex flex-col items-center justify-center h-screen w-full'>
            <h1 className="text-5xl sm:text-3xl font-semibold mx-auto">
                The Provided email is: {search.email} and the token is: {search.token}
            </h1>
        </div>
    )
}
