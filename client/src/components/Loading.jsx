import React from 'react'
import {Loader2Icon} from "lucide-react"

const Loading = () => {
  return (
    <div role="status" className='h-screen flex items-center justify-center bg-white'>
        <Loader2Icon size={26} aria-hidden="true" className='animate-spin text-zinc-950'/>
        <span className="sr-only">Loading session</span>    </div>
  )
}

export default Loading