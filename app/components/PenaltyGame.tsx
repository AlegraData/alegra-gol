'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

type GamePhase = 'intro' | 'aiming' | 'kicking' | 'result' | 'meme' | 'info'

// kick 0 = miss, kick 1 = goal, kick 2 = goal (always)
const KICK_OUTCOMES: boolean[] = [false, true, true]

interface SecuritySection {
  icon: string
  title: string
  problem: string
  example: string
  solution: string
  tips: string[]
  diagram: { emoji: string; label: string }[]
  vulnerableCode: string
  secureCode: string
  codeLanguage: string
}

const sections: SecuritySection[] = [
  {
    icon: '🔒',
    title: 'Datos de Clientes y Colaboradores',
    problem: 'Compartir información financiera o personal de clientes y compañeros por canales no autorizados: WhatsApp personal, Gmail personal o capturas de pantalla en chats.',
    example: 'Enviarle el RUT, balance general o nómina de un cliente a un compañero por WhatsApp porque "es más rápido que buscarlo en Alegra".',
    solution: 'Usa solo los canales oficiales de Alegra: Google Workspace, la plataforma Alegra y Slack interno. Si la info es sensible, no va por ningún canal informal.',
    tips: [
      '📵 Info de clientes solo por canales oficiales de Alegra',
      '🔐 No compartas pantallas con datos reales en videollamadas abiertas',
      '🗑️ Elimina correctamente archivos con datos sensibles al terminar',
    ],
    diagram: [
      { emoji: '📊', label: 'Datos del cliente' },
      { emoji: '💬', label: 'Canal informal' },
      { emoji: '👁️', label: 'Acceso no autorizado' },
      { emoji: '😱', label: 'Fuga de datos' },
    ],
    codeLanguage: 'ejemplo',
    vulnerableCode: `❌ MAL — Canal no autorizado:

WhatsApp personal o Gmail personal:
"Te mando el balance de la empresa
 XYZ: ingresos $450M, deudas $120M,
 NIT: 900.123.456-7"

→ Ese mensaje puede ser capturado,
  reenviado o guardado sin control.`,
    secureCode: `✅ BIEN — Canal oficial de Alegra:

Comparte solo a través de:
• Google Workspace (Drive, Gmail corp.)
• Plataforma Alegra
• Slack interno

→ Acceso controlado, trazabilidad
  y cumplimiento de privacidad.`,
  },
  {
    icon: '🤖',
    title: 'IA y Datos Personales',
    problem: 'Pegar información real de clientes de Alegra en herramientas de IA pública como ChatGPT o Gemini. Esos datos pueden quedar almacenados en servidores externos y usarse para entrenar modelos.',
    example: 'Copias la información contable de un cliente en ChatGPT para que te ayude a generar un informe. Esos datos confidenciales salen de Alegra hacia servidores externos.',
    solution: 'Usa IA para ideas, plantillas y borradores generales. Reemplaza siempre los datos reales por ficticios antes de enviarlos a cualquier herramienta de IA pública.',
    tips: [
      '🤖 ChatGPT y Gemini pueden guardar lo que les escribes',
      '📝 Reemplaza datos reales por ficticios (Ej: "Empresa ABC", "$X millones")',
      '✅ Prefiere las herramientas de IA aprobadas por Alegra',
    ],
    diagram: [
      { emoji: '📋', label: 'Datos reales' },
      { emoji: '🤖', label: 'IA pública' },
      { emoji: '🌐', label: 'Servidores externos' },
      { emoji: '⚠️', label: 'Fuga potencial' },
    ],
    codeLanguage: 'ejemplo',
    vulnerableCode: `❌ MAL — Datos reales a IA pública:

"ChatGPT, analiza esta empresa:
 Cliente: Panadería La Mejor S.A.S
 NIT: 800.456.789-1
 Ventas 2024: $340.000.000
 Deudas: $85.000.000"

→ Info confidencial de un cliente
  de Alegra en servidores de OpenAI.`,
    secureCode: `✅ BIEN — Datos ficticios, mismo resultado:

"ChatGPT, para una empresa con ventas
 de $X y deudas de $Y, ¿qué indicadores
 financieros debería revisar?"

→ La IA te ayuda igual.
  Cero datos reales expuestos.`,
  },
  {
    icon: '🛡️',
    title: 'Seguridad en el Trabajo Remoto',
    problem: 'Trabajar remoto en Alegra significa que cada uno es responsable de su entorno de seguridad. Redes públicas, dispositivos compartidos o pantallas visibles son riesgos reales.',
    example: 'Trabajar desde una cafetería en WiFi público mientras revisas datos de clientes en Alegra, o dejar el computador desbloqueado cuando hay otras personas cerca.',
    solution: 'Usa VPN o redes de confianza, bloquea la pantalla al alejarte, y trabaja en espacios donde nadie pueda ver tu pantalla con info de clientes.',
    tips: [
      '🔒 Bloquea tu pantalla siempre que te alejes (Win+L / Cmd+Ctrl+Q)',
      '📡 Evita WiFi público para acceder a datos de clientes',
      '🚨 Reporta cualquier incidente de seguridad de inmediato',
    ],
    diagram: [
      { emoji: '💻', label: 'Trabajo remoto' },
      { emoji: '📡', label: 'Red insegura' },
      { emoji: '👤', label: 'Acceso no deseado' },
      { emoji: '📢', label: 'Reportar' },
      { emoji: '🛡️', label: 'Protección' },
    ],
    codeLanguage: 'ejemplo',
    vulnerableCode: `❌ Riesgos del trabajo remoto:

• WiFi de cafetería o aeropuerto
• Pantalla visible a personas cercanas
• Computador desbloqueado sin supervisión
• Usar cuenta personal de Gmail para
  enviar archivos de trabajo
• "Nadie me está mirando"

→ Un solo descuido puede exponer
  datos de cientos de clientes.`,
    secureCode: `✅ Buenos hábitos en remoto:

• Bloquea pantalla al levantarte
  (Win+L o Cmd+Ctrl+Q)
• Usa red confiable o VPN
• Comparte solo por Google Workspace
• Reporta incidentes sin miedo 🤝

→ Trabajamos en equipo aunque
  estemos en distintos países.`,
  },
]

const PITCH_STRIPES = [
  { h: '6%', color: '#387c1f' },
  { h: '7%', color: '#408a26' },
  { h: '8%', color: '#387c1f' },
  { h: '9%', color: '#408a26' },
  { h: '10%', color: '#387c1f' },
  { h: '11%', color: '#408a26' },
  { h: '12%', color: '#387c1f' },
  { h: '12%', color: '#408a26' },
  { h: '13%', color: '#387c1f' },
  { h: '12%', color: '#408a26' },
]

export default function PenaltyGame() {
  const [phase, setPhase] = useState<GamePhase>('intro')
  const [horizontalAim, setHorizontalAim] = useState(50)
  const [verticalAim, setVerticalAim] = useState(50)
  const [power, setPower] = useState(50)

  const [goals, setGoals] = useState(0)
  const [saves, setSaves] = useState(0)
  const [kicksPlayed, setKicksPlayed] = useState(0)

  const [gkName] = useState('Mosquera')
  const [gkDiveDir, setGkDiveDir] = useState<'left' | 'center' | 'right'>('center')
  const [gkJumpDir, setGkJumpDir] = useState<'up' | 'down' | 'neutral'>('neutral')
  const [shotResult, setShotResult] = useState<'goal' | 'saved' | 'missed' | null>(null)

  const [showKickEffect, setShowKickEffect] = useState(false)
  const [showIntroBall, setShowIntroBall] = useState(true)
  const [stars, setStars] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward')
  const [activePage, setActivePage] = useState(0)
  const [kickIsGoal, setKickIsGoal] = useState(false)

  const boardRef = useRef<HTMLDivElement>(null)

  const handleKick = useCallback(() => {
    if (phase !== 'aiming') return
    setPhase('kicking')
    setShowKickEffect(true)

    const currentKick = kicksPlayed
    const newKicksPlayed = currentKick + 1
    const isGoal = KICK_OUTCOMES[currentKick] ?? false

    const gkChoice = (['left', 'center', 'right'] as const)[Math.floor(Math.random() * 3)]
    setGkDiveDir(gkChoice)
    setGkJumpDir(verticalAim > 62 ? 'up' : verticalAim < 38 ? 'down' : 'neutral')
    setKickIsGoal(KICK_OUTCOMES[currentKick] ?? false)

    setTimeout(() => {
      setShowKickEffect(false)
      setKicksPlayed(newKicksPlayed)

      if (isGoal) {
        setShotResult('goal')
        setGoals((prev) => prev + 1)
        setPhase('result')
        setCelebrating(true)

        setTimeout(() => {
          setCelebrating(false)
          setShotResult(null)
          setHorizontalAim(50)
          setVerticalAim(50)
          setPower(50)
          if (newKicksPlayed < KICK_OUTCOMES.length) {
            setPhase('aiming')
          } else {
            // Last kick — go to meme, then auto-advance to module
            setPhase('meme')
          }
        }, 2200)
      } else {
        // Miss — auto-advance to next kick after brief pause
        setShotResult('missed')
        setSaves((prev) => prev + 1)
        setPhase('result')
        setTimeout(() => {
          setShotResult(null)
          setHorizontalAim(50)
          setVerticalAim(50)
          setPower(50)
          setPhase('aiming')
        }, 2000)
      }
    }, 900)
  }, [phase, kicksPlayed])

  const handlePlayAgain = useCallback(() => {
    setPhase('intro')
    setShotResult(null)
    setShowKickEffect(false)
    setShowIntroBall(true)
    setStars(0)
    setGoals(0)
    setSaves(0)
    setKicksPlayed(0)
    setHorizontalAim(50)
    setVerticalAim(50)
    setPower(50)
    setCelebrating(false)
    setActivePage(0)
    setKickIsGoal(false)
    setTimeout(() => setShowIntroBall(false), 1500)
  }, [])

  // Ball arc: H moves linearly, V eases-out (rises fast then decelerates) → parabolic arc
  const getBallTargetStyles = () => {
    if (phase === 'kicking' || phase === 'result') {
      let left: number
      let bottom: number
      if (kickIsGoal) {
        // Map to inside the goal area
        left = 38 + (horizontalAim / 100) * 24
        bottom = 100 - (19 + ((100 - verticalAim) / 100) * 18)
      } else {
        // Original wider mapping
        left = 25 + (horizontalAim / 100) * 50
        bottom = 100 - (5 + ((100 - verticalAim) / 100) * 35)
      }
      return {
        left: `${left}%`,
        bottom: `${bottom}%`,
        top: 'auto',
        transform: 'translateX(-50%) scale(0.5)',
        transition: 'left 0.78s linear, bottom 0.78s cubic-bezier(0.05, 0, 0.2, 1), transform 0.78s ease',
        opacity: (shotResult === 'saved' || shotResult === 'missed') && phase === 'result' ? 0.35 : 1,
      }
    }
    return {
      left: '50%',
      bottom: '30%',
      top: 'auto',
      transform: 'translateX(-50%) scale(1.15)',
      transition: 'none',
    }
  }

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    type: 'horizontal' | 'vertical' | 'power'
  ) => {
    if (phase !== 'aiming') return
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    const updateValue = (clientX: number, clientY: number) => {
      if (type === 'horizontal') {
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
        setHorizontalAim(Math.round((x / rect.width) * 100))
      } else if (type === 'vertical') {
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top))
        setVerticalAim(Math.round(((rect.height - y) / rect.height) * 100))
      } else if (type === 'power') {
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top))
        setPower(Math.round(((rect.height - y) / rect.height) * 100))
      }
    }
    updateValue(e.clientX, e.clientY)
    container.setPointerCapture(e.pointerId)
    const handlePointerMove = (moveEvent: PointerEvent) => updateValue(moveEvent.clientX, moveEvent.clientY)
    const handlePointerUp = (upEvent: PointerEvent) => {
      container.releasePointerCapture(upEvent.pointerId)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerup', handlePointerUp)
    }
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerup', handlePointerUp)
  }

  const handleNextPage = () => {
    setSlideDir('forward')
    if (activePage < 2) {
      setActivePage((prev) => {
        const next = prev + 1
        setStars((s) => Math.max(s, next + 1))
        return next
      })
    } else {
      setActivePage(3)
    }
  }

  const handlePrevPage = () => {
    if (activePage > 0) {
      setSlideDir('back')
      setActivePage((prev) => prev - 1)
    }
  }

  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => setShowIntroBall(false), 1500)
      return () => clearTimeout(timer)
    }
    if (phase === 'meme') {
      const timer = setTimeout(() => {
        setPhase('info')
        setActivePage(0)
        setSlideDir('forward')
        setStars(1)
      }, 20000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-[#E2E8F0] font-sans">

      {/* MEME TRANSITION */}
      {phase === 'meme' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white animate-presentation-enter overflow-y-auto p-6">
          <div className="max-w-sm w-full flex flex-col items-center gap-5 py-8">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-[#002F6C] leading-tight">
                ¡Hasta aquí llegaste! 🎣
              </p>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Dos goles y en el último… te atrapamos.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#002F6C]/10 w-48">
              <img
                src="/dot-security.jpg"
                alt="Meme perro ciberseguridad"
                className="w-full h-auto"
              />
            </div>

            <div className="text-center bg-[#002F6C]/5 border border-[#002F6C]/10 rounded-2xl p-5">
              <p className="text-base font-semibold text-slate-700 leading-relaxed">
                Igual que en la seguridad: puedes esquivar dos, pero la tercera te atrapa. 🔐<br />
                <span className="text-[#00A99D] font-black">Aprende a no dejar que te anoten goles.</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => {
                  setPhase('info')
                  setActivePage(0)
                  setSlideDir('forward')
                  setStars(1)
                }}
                className="bg-[#00A99D] hover:bg-[#008B81] text-white font-black px-10 py-4 rounded-full text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95 w-full"
              >
                🔐 Ir al módulo de seguridad
              </button>
              <div className="text-[#00A99D] text-[11px] font-semibold opacity-70">
                o espera, carga automáticamente…
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A99D] rounded-full"
                  style={{ animation: 'grow20s 20s linear forwards' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN INFO OVERLAY */}
      {phase === 'info' && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-presentation-enter">

          <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-200 shrink-0">
            <span className="text-[#002F6C]/60 text-[10px] sm:text-xs font-black uppercase tracking-widest">
              Seguridad en Alegra
            </span>
            {activePage < 3 && (
              <div className="flex items-center gap-2">
                {sections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSlideDir(i > activePage ? 'forward' : 'back')
                      setActivePage(i)
                      setStars((s) => Math.max(s, i + 1))
                    }}
                    style={{
                      width: i === activePage ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: i <= activePage ? '#00A99D' : '#CBD5E1',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
            )}
            <span className="text-slate-400 text-[10px] sm:text-xs font-bold">
              {activePage < 3 ? `${activePage + 1} / 3` : '✓ Completado'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#F8FAFF]">
            {activePage < 3 ? (
              <div
                key={activePage}
                className={`p-6 sm:p-10 lg:p-14 flex flex-col gap-6 ${slideDir === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
              >
                {/* Title */}
                <div className="flex items-center gap-4">
                  <span className="text-5xl sm:text-6xl select-none">{sections[activePage].icon}</span>
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-[#002F6C] tracking-wide leading-tight">
                      {sections[activePage].title}
                    </h2>
                    <p className="text-[#00A99D] text-xs sm:text-sm font-bold uppercase tracking-widest mt-1">
                      Módulo {activePage + 1} de 3
                    </p>
                  </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <p className="text-red-600 text-[10px] font-black tracking-widest uppercase mb-3">
                      ⚠️ El Problema
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {sections[activePage].problem}
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="text-amber-600 text-[10px] font-black tracking-widest uppercase mb-3">
                      📌 Ejemplo Real
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed italic">
                      "{sections[activePage].example}"
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <p className="text-emerald-600 text-[10px] font-black tracking-widest uppercase mb-3">
                      ✅ La Solución
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {sections[activePage].solution}
                    </p>
                  </div>
                </div>

                {/* Emoji diagram */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-4">
                    ¿Cómo ocurre?
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sections[activePage].diagram.map((node, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-3 min-w-[60px]">
                          <span className="text-2xl">{node.emoji}</span>
                          <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{node.label}</span>
                        </div>
                        {i < sections[activePage].diagram.length - 1 && (
                          <span className="text-slate-300 text-xl font-bold">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code comparison */}
                <div>
                  <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Comparación práctica
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-slate-950 rounded-2xl border border-red-500/30 overflow-hidden shadow-sm">
                      <div className="bg-red-950/60 border-b border-red-500/30 px-4 py-3 flex items-center justify-between">
                        <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">❌ Inseguro</span>
                        <span className="text-gray-500 text-[10px] uppercase">{sections[activePage].codeLanguage}</span>
                      </div>
                      <pre className="p-5 text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                        <code>{sections[activePage].vulnerableCode}</code>
                      </pre>
                    </div>
                    <div className="bg-slate-950 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-sm">
                      <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">✅ Seguro</span>
                        <span className="text-gray-500 text-[10px] uppercase">{sections[activePage].codeLanguage}</span>
                      </div>
                      <pre className="p-5 text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                        <code>{sections[activePage].secureCode}</code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {sections[activePage].tips.map((tip, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00A99D]/10 border border-[#00A99D]/30 text-[#008B81] text-xs sm:text-sm rounded-full font-semibold"
                    >
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-10 min-h-[70vh]">
                <div className="text-7xl mb-6 animate-bounce">🏆🇨🇴🎉</div>
                <h3 className="text-3xl sm:text-5xl font-black text-[#002F6C] mb-4 tracking-wide leading-tight">
                  ¡MÓDULOS<br />COMPLETADOS!
                </h3>
                <p className="text-slate-500 text-sm sm:text-base mb-10 max-w-lg leading-relaxed">
                  Completaste los 3 módulos de seguridad de Alegra. Ahora eres parte activa de la defensa del equipo. ¡La seguridad es responsabilidad de todos! 🛡️
                </p>
                <button
                  onClick={handlePlayAgain}
                  className="bg-[#00A99D] hover:bg-[#008B81] text-white font-black px-12 py-4 rounded-full text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95"
                >
                  🔄 Jugar de nuevo
                </button>
              </div>
            )}
          </div>

          {activePage < 3 && (
            <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-t border-slate-200 bg-white shrink-0">
              <button
                onClick={handlePrevPage}
                disabled={activePage === 0}
                className="px-6 py-3 rounded-full border border-slate-300 text-slate-500 text-xs font-bold hover:bg-slate-50 disabled:opacity-25 disabled:pointer-events-none transition-all uppercase tracking-wider"
              >
                ⬅ Anterior
              </button>
              <button
                onClick={handleNextPage}
                className="px-8 py-3 rounded-full bg-[#00A99D] hover:bg-[#008B81] text-white text-xs font-black tracking-wider uppercase transition-all active:scale-95 shadow-lg"
              >
                {activePage === 2 ? 'Finalizar lección 🏆' : 'Siguiente ➡'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      <div ref={boardRef} className="w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden select-none">
          <div className="relative w-full transition-all duration-300" style={{ paddingBottom: '62%' }}>
            <>
              {/* Stadium background */}
              <div className="absolute inset-0 bg-[#0F172A]" />

              {/* Crowd */}
              <div className="absolute top-0 left-0 right-0 h-[18%] opacity-35 overflow-hidden flex flex-col justify-between py-1 px-4">
                <div className="flex gap-[3px] justify-between">
                  {Array.from({ length: 70 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i % 4 === 0 ? '#475569' : i % 4 === 1 ? '#334155' : i % 4 === 2 ? '#FF5F00' : '#1e293b' }} />
                  ))}
                </div>
                <div className="flex gap-[3px] justify-between px-2">
                  {Array.from({ length: 68 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i % 4 === 0 ? '#334155' : i % 4 === 1 ? '#475569' : i % 4 === 2 ? '#002F6C' : '#0F172A' }} />
                  ))}
                </div>
                <div className="flex gap-[3px] justify-between px-1">
                  {Array.from({ length: 69 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i % 4 === 0 ? '#475569' : i % 4 === 1 ? '#FF5F00' : i % 4 === 2 ? '#334155' : '#1e293b' }} />
                  ))}
                </div>
              </div>

              {/* LED marquee */}
              <div className="absolute top-[18%] left-0 right-0 h-[4%] bg-slate-800 border-t border-b border-slate-700 flex items-center overflow-hidden">
                <div className="w-full flex overflow-hidden select-none">
                  <div className="animate-marquee flex gap-20 text-[#00C4D3] font-black text-[10px] sm:text-[12px] tracking-[0.25em] uppercase">
                    {Array.from({ length: 8 }).map((_, i) => <span key={i}>Alegra</span>)}
                  </div>
                  <div className="animate-marquee flex gap-20 text-[#00C4D3] font-black text-[10px] sm:text-[12px] tracking-[0.25em] uppercase" aria-hidden="true">
                    {Array.from({ length: 8 }).map((_, i) => <span key={i}>Alegra</span>)}
                  </div>
                </div>
              </div>

              {/* Pitch */}
              <div className="absolute top-[22%] left-0 right-0 bottom-0 overflow-hidden flex flex-col">
                {PITCH_STRIPES.map((stripe, idx) => (
                  <div key={idx} style={{ height: stripe.h, backgroundColor: stripe.color, width: '100%' }} />
                ))}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                  <polygon points="110,0 290,0 360,260 40,260" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                  <polygon points="150,0 250,0 270,100 130,100" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                  <circle cx="200" cy="180" r="3" fill="white" opacity="0.9" />
                  <path d="M 160,260 A 55,55 0 0,1 240,260" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                </svg>
              </div>

              {/* Goal & net */}
              <div className="absolute" style={{ top: '16%', left: '36%', right: '36%', height: '24%' }}>
                <div className="absolute bottom-0 left-[-3%] right-[-3%] h-[3px] bg-black/35 blur-[1px] rounded-full" />
                <div className={`absolute inset-0 goal-net rounded-t-sm transition-transform duration-100 ${celebrating ? 'animate-net-shake' : ''}`} style={{ opacity: 0.65, borderTop: '2px solid white', borderLeft: '1px solid rgba(255,255,255,0.8)', borderRight: '1px solid rgba(255,255,255,0.8)' }} />
                <div className="absolute left-0 top-0 bottom-0 w-[4px] sm:w-[5px] bg-gradient-to-r from-gray-100 to-white rounded-l-sm shadow-md" />
                <div className="absolute right-0 top-0 bottom-0 w-[4px] sm:w-[5px] bg-gradient-to-r from-white to-gray-100 rounded-r-sm shadow-md" />
                <div className="absolute top-0 left-0 right-0 h-[4px] sm:h-[5px] bg-gradient-to-b from-gray-100 to-white rounded-t-sm shadow-md" />

                {/* Goalkeeper */}
                <div
                  className="absolute bottom-[2%] left-1/2 -translate-x-1/2"
                  style={phase === 'kicking' || phase === 'result' ? (() => {
                    const xPx = gkDiveDir === 'left' ? -88 : gkDiveDir === 'right' ? 88 : 0
                    const yPx = gkDiveDir === 'center'
                      ? -22
                      : gkJumpDir === 'up' ? -34 : gkJumpDir === 'down' ? 16 : -4
                    const deg = gkDiveDir === 'left' ? -68 : gkDiveDir === 'right' ? 68 : 0
                    const sx = gkDiveDir !== 'center' ? 1.25 : 1
                    return {
                      transform: `translateX(-50%) translateX(${xPx}px) translateY(${yPx}px) rotate(${deg}deg) scaleX(${sx})`,
                      transition: 'transform 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }
                  })() : { transition: 'transform 0.2s ease' }}
                >
                  <div className={`flex flex-col items-center ${shotResult === 'saved' && phase === 'result' ? 'animate-pulse-soft' : ''}`}>
                    <div className="relative">
                      <div className="w-5 h-5 rounded-full bg-[#8d5524] mx-auto border border-[#704214] relative" style={{ boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.1)' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t-full bg-slate-900" />
                      </div>
                      <div className="w-7 h-6 bg-[#009543] border-t border-[#FCD116] rounded-sm mx-auto -mt-0.5 flex items-center justify-center relative">
                        <span className="text-white text-[5px] font-black">1</span>
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#CE1126] rotate-12" />
                      </div>
                      <div className="absolute -left-2 top-2.5 w-2 h-2 rounded bg-white border border-[#CE1126]" />
                      <div className="absolute -right-2 top-2.5 w-2 h-2 rounded bg-white border border-[#CE1126]" />
                    </div>
                    <div className="flex gap-1 -mt-0.5">
                      <div className="w-2 h-2.5 bg-[#FCD116] rounded-sm border-b border-[#CE1126]" />
                      <div className="w-2 h-2.5 bg-[#FCD116] rounded-sm border-b border-[#CE1126]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoreboards */}
              <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-1">
                <div className="bg-black/90 border-2 border-white rounded-lg flex items-center overflow-hidden shadow-lg h-9 sm:h-11">
                  <div className="flex items-center gap-1.5 px-3 py-1 sm:py-2">
                    <span className="text-sm sm:text-base select-none">🇨🇴</span>
                    <span className="text-white font-black text-xs sm:text-sm tracking-wider">COL</span>
                  </div>
                  <div className="w-[1.5px] h-full bg-white/40" />
                  <div className="bg-black text-white font-extrabold text-sm sm:text-base px-3.5 sm:px-4 py-1 sm:py-2 flex items-center justify-center min-w-[36px] sm:min-w-[42px] h-full">{goals}</div>
                </div>
                <div className="bg-[#002F6C] text-white text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase">Colombia</div>
              </div>

              <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                <div className="bg-black/90 border-2 border-white rounded-lg flex items-center overflow-hidden shadow-lg h-9 sm:h-11">
                  <div className="bg-black text-white font-extrabold text-sm sm:text-base px-3.5 sm:px-4 py-1 sm:py-2 flex items-center justify-center min-w-[36px] sm:min-w-[42px] h-full">{saves}</div>
                  <div className="w-[1.5px] h-full bg-white/40" />
                  <div className="flex items-center gap-1.5 px-3 py-1 sm:py-2">
                    <span className="text-white font-black text-xs sm:text-sm tracking-wider">COG</span>
                    <span className="text-sm sm:text-base select-none">🇨🇬</span>
                  </div>
                </div>
                <div className="bg-[#CE1126] text-white text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase">R. Congo</div>
              </div>

              {/* Kicks counter */}
              {(phase === 'aiming' || phase === 'kicking' || phase === 'result') && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-black/80 border border-white/30 rounded-full px-3 py-1 flex items-center gap-1.5">
                    {KICK_OUTCOMES.map((_, i) => (
                      <span key={i} className="text-base" style={{ opacity: i < kicksPlayed ? 1 : 0.3 }}>
                        {i < kicksPlayed ? (KICK_OUTCOMES[i] ? '⚽' : '💨') : '○'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kicker */}
              {(phase === 'aiming' || phase === 'kicking' || phase === 'result') && (
                <div
                  className="absolute bottom-[26%] left-1/2 z-10"
                  style={phase === 'kicking'
                    ? { transform: 'translateX(-50%) translateY(-18px) rotate(-14deg) scale(0.88)', opacity: 0.82, transition: 'all 0.28s cubic-bezier(0.22, 1, 0.36, 1)', transformOrigin: 'bottom center' }
                    : { transform: 'translateX(-50%)', transition: 'all 0.2s ease' }}
                >
                  <div className="flex flex-col items-center relative">
                    {/* Shadow */}
                    <div className="w-8 h-2 bg-black/45 blur-[2px] rounded-full absolute -bottom-1" />
                    {/* Head */}
                    <div className="w-5 h-5 rounded-full bg-[#ffcd94] border border-[#e0b080] relative" style={{ boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.1)' }}>
                      <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t-full bg-amber-950" />
                    </div>
                    {/* Jersey */}
                    <div className="w-7 h-5 bg-[#FCD116] rounded-sm -mt-0.5 flex items-center justify-center relative shadow-sm">
                      <span className="text-[#003893] text-[6px] font-black">10</span>
                      <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-[#CE1126] rounded-sm" />
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-0.5 bg-[#CE1126] rounded-sm" />
                    </div>
                    {/* Shorts */}
                    <div className="w-5.5 h-3 bg-[#003893] rounded-sm -mt-0.5" />
                    {/* Socks — right leg kicks forward when shooting */}
                    <div className="flex gap-2 -mt-0.5">
                      <div className="w-1.5 h-3 bg-[#CE1126] rounded-b-xs" />
                      <div
                        className="w-1.5 bg-[#CE1126] rounded-b-xs"
                        style={{
                          height: phase === 'kicking' ? '6px' : '12px',
                          transform: phase === 'kicking' ? 'translateX(6px) translateY(-4px) rotate(-40deg)' : 'none',
                          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    </div>
                    {/* Boots */}
                    <div className="flex gap-2 -mt-0.5">
                      <div className="w-2 h-1 bg-black rounded-xs" />
                      <div
                        className="h-1 bg-black rounded-xs"
                        style={{
                          width: phase === 'kicking' ? '14px' : '8px',
                          transform: phase === 'kicking' ? 'translateX(8px) translateY(-8px) rotate(-40deg)' : 'none',
                          transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Intro ball */}
              {phase === 'intro' && showIntroBall && (
                <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-20 animate-ball-drop">
                  <div className="text-3xl drop-shadow-lg">⚽</div>
                </div>
              )}

              {/* Ball ground shadow — stays on pitch, tracks horizontal position */}
              {(phase === 'aiming' || phase === 'kicking' || phase === 'result') && (
                <div
                  className="absolute z-10 rounded-full bg-black/30 blur-[3px]"
                  style={{
                    width: (phase === 'kicking' || phase === 'result') ? '10px' : '20px',
                    height: (phase === 'kicking' || phase === 'result') ? '4px' : '8px',
                    bottom: '21%',
                    left: (phase === 'kicking' || phase === 'result')
                      ? kickIsGoal
                        ? `${38 + (horizontalAim / 100) * 24}%`
                        : `${25 + (horizontalAim / 100) * 50}%`
                      : '50%',
                    transform: 'translateX(-50%)',
                    transition: 'left 0.78s linear, width 0.78s ease, height 0.78s ease',
                  }}
                />
              )}

              {/* Active ball */}
              {(phase === 'aiming' || phase === 'kicking' || phase === 'result') && (
                <div className="absolute z-20" style={getBallTargetStyles()}>
                  <div
                    className="text-2xl drop-shadow-lg select-none"
                    style={phase === 'kicking' ? { animation: 'spin 0.38s linear infinite' } : {}}
                  >
                    ⚽
                  </div>
                </div>
              )}

              {/* Kick effect */}
              {showKickEffect && (
                <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-30 text-2xl animate-ping select-none">💥</div>
              )}

              {/* Result overlay */}
              {phase === 'result' && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/35 backdrop-blur-xs">
                  <div className="text-center animate-fade-in bg-slate-900/90 border border-slate-700 rounded-3xl p-6 max-w-xs mx-auto shadow-2xl">
                    {shotResult === 'goal' && (
                      <div>
                        <div className="text-5xl mb-2 animate-bounce">⚽🇨🇴</div>
                        <div className="text-3xl font-black text-[#38A169] drop-shadow-lg tracking-wider">¡GOLAZO!</div>
                        <div className="text-white/80 text-xs mt-1 font-semibold">¡Superaste la defensa del Congo!</div>
                        <div className="text-white/40 text-[10px] mt-3">
                          Tiro {kicksPlayed} de {KICK_OUTCOMES.length} — preparando el siguiente…
                        </div>
                      </div>
                    )}
                    {shotResult === 'saved' && (
                      <div>
                        <div className="text-5xl mb-2">🇨🇬🧤</div>
                        <div className="text-2xl font-black text-[#E53E3E] drop-shadow-lg">¡Atajó {gkName}!</div>
                        <div className="text-white/80 text-xs mt-1 font-semibold">Congo salvó su portería.</div>
                      </div>
                    )}
                    {shotResult === 'missed' && (
                      <div>
                        <div className="text-5xl mb-2">💨</div>
                        <div className="text-2xl font-black text-amber-500 drop-shadow-lg">¡DESVIADO!</div>
                        <div className="text-white/80 text-xs mt-2 font-semibold">
                          ¡El tiro se fue fuera! Sigue intentando…
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Goal flash */}
              {celebrating && (
                <div className="absolute inset-0 z-35 pointer-events-none animate-goal-flash" />
              )}

              {/* HUD Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-xs flex items-center justify-between gap-4 z-30 border-t border-white/10">
                <div className="bg-black/90 border border-amber-500/50 rounded-full px-3.5 py-1 flex items-center gap-1.5 shadow-md">
                  <span className="text-amber-400 text-sm">⭐</span>
                  <span className="text-white font-black text-sm tracking-wider">{stars}</span>
                </div>

                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1 max-w-md">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] sm:text-[9px] text-white/95 font-black uppercase tracking-wider mb-1">Dirección</span>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'horizontal')}
                      className="relative w-20 sm:w-26 h-9 sm:h-11 bg-emerald-950 border border-white/40 rounded-md overflow-hidden shadow-inner cursor-pointer"
                      style={{ touchAction: 'none' }}
                    >
                      <div className="absolute inset-0 goal-net opacity-30" />
                      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20" />
                      <div className="absolute top-0 bottom-0 left-0 w-[26%] bg-red-600/20" />
                      <div className="absolute top-0 bottom-0 right-0 w-[26%] bg-red-600/20" />
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 h-1 bg-[#E53E3E] rounded-full" />
                      <div className="absolute bottom-0.5 w-4 h-4 -translate-x-1/2 flex items-center justify-center text-xs drop-shadow-md select-none transition-all duration-75" style={{ left: `${horizontalAim}%` }}>⚽</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[7px] sm:text-[9px] text-white/95 font-black uppercase tracking-wider mb-1">Altura</span>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'vertical')}
                      className="relative w-20 sm:w-26 h-9 sm:h-11 bg-emerald-950 border border-white/40 rounded-md overflow-hidden shadow-inner cursor-pointer"
                      style={{ touchAction: 'none' }}
                    >
                      <div className="absolute inset-0 goal-net opacity-30" />
                      <div className="absolute top-0 left-0 right-0 h-[15%] bg-red-600/20" />
                      <div className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-1 bg-[#E53E3E] rounded-full" />
                      <div className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center text-xs drop-shadow-md select-none transition-all duration-75" style={{ bottom: `${verticalAim}%` }}>⚽</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[7px] sm:text-[9px] text-white/95 font-black uppercase tracking-wider mb-1">Potencia</span>
                    <div
                      onPointerDown={(e) => handlePointerDown(e, 'power')}
                      className="relative w-9 sm:w-11 h-9 sm:h-11 flex items-center justify-center cursor-pointer"
                      style={{ touchAction: 'none' }}
                    >
                      <div className="absolute inset-0 opacity-80 border border-white/20" style={{ background: 'linear-gradient(to top, #38A169 0%, #ECC94B 50%, #E53E3E 100%)', clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }} />
                      <div className="absolute top-0.5 bottom-0.5 left-1/2 -translate-x-1/2 w-1 bg-[#E53E3E] rounded-full" />
                      <div className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center text-xs drop-shadow-md select-none transition-all duration-75" style={{ bottom: `${power}%` }}>⚽</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlayAgain}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95 shadow-md shrink-0"
                  title="Reiniciar partida"
                >
                  <div className="flex gap-0.5 justify-center items-center">
                    <div className="w-1 h-3.5 bg-white rounded-xs" />
                    <div className="w-1 h-3.5 bg-white rounded-xs" />
                  </div>
                </button>
              </div>

              {/* Kick button */}
              {phase === 'aiming' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <button
                    onClick={handleKick}
                    className="bg-[#00A99D] hover:bg-[#008B81] text-white font-black px-8 py-3.5 rounded-full text-sm sm:text-base transition-all duration-200 shadow-xl shadow-[#00A99D]/30 hover:shadow-[#00A99D]/50 active:scale-[0.96] flex items-center gap-2 tracking-wider uppercase border-2 border-white animate-pulse-soft"
                  >
                    <span>⚽</span>
                    <span>¡Disparar!</span>
                  </button>
                </div>
              )}

              {/* Intro screen */}
              {phase === 'intro' && (
                <div
                  onClick={() => setPhase('aiming')}
                  className="absolute inset-0 flex flex-col items-center justify-center z-45 bg-slate-900/90 backdrop-blur-xs p-4 text-center cursor-pointer"
                >
                  <div className="max-w-md animate-fade-in flex flex-col items-center">
                    <img src="/logo.png" className="w-24 h-24 mb-6 object-contain rounded-2xl shadow-lg border-2 border-white/20 bg-white/10 p-2" alt="Alegra Logo" />
                    <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight uppercase tracking-widest drop-shadow-md mb-8">
                      Alegra gol
                    </h1>
                    <span className="text-xs text-white/60 tracking-[0.2em] uppercase animate-pulse font-black bg-white/10 px-4 py-2 rounded-full border border-white/10">
                      Haz clic para comenzar
                    </span>
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>

    </div>
  )
}
