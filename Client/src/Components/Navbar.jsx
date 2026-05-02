import React, { useEffect, useState } from 'react'

function Navbar() {
  const [serverStatus, setServerStatus] = useState("connecting to Kitchen (backend)....");

  useEffect(() => {
    fetch('http://localhost:5002/api')
      .then((res) => res.text())
      .then((data) => {
        setServerStatus(data);
      })
      .catch((err) => {
        setServerStatus("Kitchen is closed (Server error)");
        console.log(err);
      })
  }, [])

  return (
    <div>
      <div className='flex justify-between items-center h-20 bg-zinc-900 px-6'>
        <div className='flex items-center gap-4 text-white'>
          <h1 className='text-3xl font-bold'>Cognite-AI</h1>
          <p className='text-2xl text-red-700'>{serverStatus}</p>
        </div>

        <div className='flex items-center gap-4'>
          <input
            type="text"
            placeholder='Type your intent here ....'
            className='bg-zinc-800 border border-zinc-600 rounded-full px-6 py-3 w-80 text-white outline-none focus:border-white transition-colors'
          />
          <button className="rounded border-2 border-dashed border-red-900 bg-zinc-900 px-4 py-2 font-semibold uppercase text-red-700 transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_#D32F2F] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
            Submit
          </button>
          <button className="rounded border-2 border-dashed border-red-900 bg-zinc-900 px-4 py-2 font-semibold uppercase text-red-700 transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:rounded-md hover:shadow-[4px_4px_0px_#D32F2F] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
            Guide
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar