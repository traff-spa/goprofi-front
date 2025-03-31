import { useState, useEffect } from 'react'

interface IGetViewport {
  viewportWidth: number
  viewportHeight: number
}

function getWindowDimensions() {
  const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window
  return {
    viewportWidth,
    viewportHeight
  }
}

const useGetViewport = (): IGetViewport => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowDimensions
}

export default useGetViewport
