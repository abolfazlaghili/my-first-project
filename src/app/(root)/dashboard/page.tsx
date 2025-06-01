import React from 'react'
import { useUser } from '@clerk/nextjs'

const page = () => {
  const { user, isLoaded } = useUser()
  return <div>hello {isLoaded && user ? user.firstName : 'Guest'}</div>
}

export default page
