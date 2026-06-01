import { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import MainLayout from './layouts/MainLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    AOS.init({
      duration: reducedMotion ? 1 : 700,
      easing: 'ease-out-cubic',
      offset: 80,
      delay: 0,
      once: true,
      mirror: false,
    })

    return () => {
      AOS.refreshHard()
    }
  }, [])

  useEffect(() => {
    window.requestAnimationFrame(() => AOS.refreshHard())
  }, [isLoginOpen])

  useEffect(() => {
    if (!isLoginOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLoginOpen])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    if (reducedMotion.matches || !finePointer.matches) {
      return undefined
    }

    let activeElement = null
    let frame = 0

    const resetTilt = (element) => {
      element?.style.removeProperty('--tilt-x')
      element?.style.removeProperty('--tilt-y')
      element?.style.removeProperty('--depth-x')
      element?.style.removeProperty('--depth-y')
    }

    const handlePointerMove = (event) => {
      const target = event.target.closest('button:not(:disabled), a[href], input, select, textarea, [role="option"], .motion-image')

      if (!target) {
        resetTilt(activeElement)
        activeElement = null
        return
      }

      if (activeElement && activeElement !== target) {
        resetTilt(activeElement)
      }

      activeElement = target

      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      frame = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect()
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2

        target.style.setProperty('--tilt-x', `${(-y * 3).toFixed(2)}deg`)
        target.style.setProperty('--tilt-y', `${(x * 4).toFixed(2)}deg`)
        target.style.setProperty('--depth-x', `${(x * 4).toFixed(2)}px`)
        target.style.setProperty('--depth-y', `${(y * 4).toFixed(2)}px`)
      })
    }

    const handlePointerLeave = () => {
      resetTilt(activeElement)
      activeElement = null
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      resetTilt(activeElement)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <>
      <MainLayout onLoginClick={() => setIsLoginOpen(true)}>
        <LandingPage />
      </MainLayout>

      {isLoginOpen && (
        <div
          className="motion-modal fixed inset-0 z-50 overflow-hidden bg-white"
          role="dialog"
          aria-modal="true"
          aria-label="Login"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsLoginOpen(false)
            }
          }}
        >
          <div className="absolute inset-0 overflow-hidden bg-white">
            <button
              type="button"
              aria-label="Close login"
              onClick={() => setIsLoginOpen(false)}
              className="absolute left-[18px] top-[18px] z-10 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/95 text-[24px] leading-none text-[#202020] shadow-[0_4px_14px_rgba(0,0,0,0.12)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              x
            </button>
            <LoginPage isModal />
          </div>
        </div>
      )}
    </>
  )
}

export default App
