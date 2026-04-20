import React,{useEffect ,useState} from 'react'

function App() {
  const [serverStatus, setServerStatus] = useState("connecting to Kitchen (backend)....");
  useEffect(()=>{
    fetch('http://localhost:5002/api')
    .then((res)=> res.text())
    .then((data)=>{
      setServerStatus(data);
    })
    .catch((err)=>{
      setServerStatus("Kitchen is closed (Server error)");
      console.log(err);
    })
  },[])
  return (
    <div className='flex flex-col items-center justify-center h-screen bg-zinc-900 text-white'>
      <h1 className='text-6xl font-bold mb-4'>Cognite-AI</h1>
      <p className='text-xl text-green-400'>{serverStatus}</p>
    </div>
  )
}

export default App
