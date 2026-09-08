import React, { useEffect, useMemo, useState } from 'react'
import { SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import Loading from '../components/Loading'
import { detectDependencies } from '../utils/sandpackUtils'

const PublishPage = () => {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setProject(null)

    const loadPublishedProject = async () => {
      try {
        const { data } = await api.get(`/api/projects/public/${id}`)
        if (!cancelled) setProject(data)
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError?.response?.data?.error || 'Website unavailable')
        }
      }
    }

    if (id) loadPublishedProject()
    return () => { cancelled = true }
  }, [id])

  const files = useMemo(() => {
    const projectFiles = project?.files || {}
    const sandpackFiles = Object.fromEntries(
      Object.entries(projectFiles).map(([path, content]) => [path, {
        code: typeof content === 'string' ? content : content?.content || '',
      }]),
    )

    if (!sandpackFiles['/index.js']) {
      sandpackFiles['/index.js'] = {
        code: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(<App />);`,
      }
    }

    return sandpackFiles
  }, [project])

  if (error) {
    return <div className='min-h-screen flex items-center justify-center text-sm text-zinc-500'>{error}</div>
  }

  if (!project) return <Loading />

  return (
    <div className='h-screen flex flex-col bg-white'>
      <header className='h-12 shrink-0 flex items-center px-4 border-b border-zinc-200'>
        <h1 className='text-sm font-semibold text-zinc-900 truncate'>{project.name}</h1>
      </header>
      <main className='flex-1 min-h-0'>
        <SandpackProvider
          key={`${project._id}-${project.version}`}
          template='react'
          files={files}
          customSetup={{ dependencies: detectDependencies(project.files || {}) }}
          options={{
            externalResources: [
              'https://cdn.tailwindcss.com',
              'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            ],
            logLevel: 0,
          }}>
          <SandpackLayout style={{ height: '100%', border: 'none', borderRadius: 0 }}>
            <SandpackPreview
              showNavigator={false}
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{ height: '100%', width: '100%' }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </main>
    </div>
  )
}

export default PublishPage