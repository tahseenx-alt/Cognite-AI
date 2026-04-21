import React from 'react'
import Editor from '@monaco-editor/react' // 1. Added the import!
import Navbar from './Components/Navbar'

function App() {
  return (
    // 2. Added Tailwind classes to force the layout to fill the screen
    <div className="h-screen w-full flex flex-col bg-zinc-900">
      
      {/* Your custom Navbar */}
      <Navbar />
      
      {/* The Editor (wrapped in a flex-grow container so it fills the remaining space) */}
      <div className="flex-grow w-full">
        <Editor
          height="100%"                   
          theme="vs-dark"                 
          defaultLanguage="javascript"    
          defaultValue="// Write code..." 
          options={{
            minimap: { enabled: false },  
            fontSize: 16,
            wordWrap: "on"
          }}
        />
      </div>

    </div>
  )
}

export default App