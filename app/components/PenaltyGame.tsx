'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

type GamePhase = 'intro' | 'aiming' | 'kicking' | 'result' | 'meme' | 'info'

interface SecuritySection {
  icon: string
  title: string
  problem: string
  example: string
  solution: string
  tips: string[]
  vulnerableCode: string
  secureCode: string
  codeLanguage: string
}

const sections: SecuritySection[] = [
  {
    icon: '🔒',
    title: 'Datos Personales',
    problem: 'Almacenar datos sensibles de clientes y colaboradores en texto plano en repositorios o logs expuestos sin encriptación.',
    example: 'Una hoja de cálculo con salarios y cédulas guardada en una carpeta compartida sin restricción de acceso.',
    solution: 'Clasificar la información, aplicar el principio de mínimo privilegio y encriptar los datos en tránsito y en reposo.',
    tips: ['Identifica datos sensibles: correos, finanzas, salarios', 'Nunca imprimas PII en los logs del sistema', 'Aplica encriptación robusta (AES-256)'],
    codeLanguage: 'javascript',
    vulnerableCode: `// ❌ Código Inseguro: Guarda datos sensibles en logs
function saveUser(user) {
  // Almacena información sensible en texto plano en la consola
  console.log("Registrando usuario:", user.name, user.salary);
  db.insert(user);
}`,
    secureCode: `// ✅ Código Seguro: Enmascara y encripta datos
function saveUser(user) {
  // Oculta información sensible antes de registrar en logs
  const maskedEmail = maskEmail(user.email);
  console.log("Registrando usuario:", user.id, maskedEmail);
  
  // Encripta la información antes de guardar en la base de datos
  db.insert(encryptSensitiveData(user));
}`,
  },
  {
    icon: '🔑',
    title: 'Tokens Expuestos',
    problem: 'Mantener tokens, contraseñas de bases de datos o llaves de API expuestas directamente dentro del código fuente.',
    example: 'Dejar un token de producción de Stripe o AWS hardcodeado en GitHub. Cualquiera con acceso al repositorio podrá usarlo.',
    solution: 'Hacer uso de variables de entorno (`.env`), almacenar las credenciales en un Secrets Vault y rotarlas periódicamente.',
    tips: ['Nunca escribas tokens directo en el código', 'Asegúrate de agregar .env a tu archivo .gitignore', 'Configura sistemas de escaneo de secretos (GitGuardian)'],
    codeLanguage: 'javascript',
    vulnerableCode: `// ❌ Código Inseguro: Credenciales expuestas
// Token y contraseña expuestos directamente en el código
const stripe = require('stripe')('sk_live_51N2x...xyz890');
const databasePassword = "admin_super_secret_password_123";`,
    secureCode: `// ✅ Código Seguro: Uso de variables de entorno
// Se cargan las credenciales desde un entorno seguro
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const databasePassword = process.env.DATABASE_PASSWORD;`,
  },
  {
    icon: '⚙️',
    title: 'Automatizaciones Seguras',
    problem: 'Automatizaciones con accesos elevados innecesarios, webhooks sin firma de autenticación y consultas vulnerables.',
    example: 'Un webhook sin autenticar que permite a un atacante ejecutar comandos o consultas maliciosas en tus bases de datos internas.',
    solution: 'Diseñar automatizaciones bajo el mínimo privilegio, validar todas las entradas e implementar firmas HMAC.',
    tips: ['Valida y sanitiza cada entrada recibida', 'Verifica firmas HMAC en webhooks externos', 'No otorgues permisos de Administrador a scripts sencillos'],
    codeLanguage: 'javascript',
    vulnerableCode: `// ❌ Código Inseguro: Inyección SQL y entrada no validada
app.post('/webhook/update-user', (req, res) => {
  // Ejecuta directamente el ID del usuario recibido sin sanitizar
  const query = \`UPDATE users SET status = 'active' WHERE id = \${req.body.id}\`;
  db.query(query);
});`,
    secureCode: `// ✅ Código Seguro: Webhook firmado y consulta parametrizada
app.post('/webhook/update-user', (req, res) => {
  // 1. Validar la firma HMAC del webhook para verificar el origen
  if (!verifyWebhookSignature(req)) return res.status(401).send();
  
  // 2. Usar consultas parametrizadas para evitar inyección SQL
  const query = 'UPDATE users SET status = ? WHERE id = ?';
  db.query(query, ['active', req.body.id]);
});`,
  },
  {
    icon: '🧠',
    title: 'IA Responsable',
    problem: 'Fuga de datos de propiedad intelectual o información sensible al enviarla a proveedores de IA externos sin anonimizar.',
    example: 'Enviar reportes financieros de clientes directamente a ChatGPT para generar un resumen, exponiendo datos confidenciales.',
    solution: 'Filtrar la información sensible en los prompts, usar pasarelas de anonimización y validar siempre las respuestas generadas.',
    tips: ['Anonimiza datos personales antes de enviarlos a la IA', 'No confíes ciegamente en el código generado por IA', 'Usa modelos con acuerdos corporativos de privacidad'],
    codeLanguage: 'javascript',
    vulnerableCode: `// ❌ Código Inseguro: Envío de PII directo a IA externa
async function analyzeClientData(client) {
  // Envía datos financieros reales y confidenciales a la API pública
  const prompt = \`Analiza este cliente: \${client.name}, Salario: \${client.salary}, Deudas: \${client.debts}\`;
  return await openAI.getCompletion(prompt);
}`,
    secureCode: `// ✅ Código Seguro: Anonimización previa al envío
async function analyzeClientData(client) {
  // Se extraen los datos sensibles y se usan identificadores genéricos
  const prompt = \`Analiza el perfil financiero ID: \${client.id} (Rango Salarial: \${client.salaryRange})\`;
  const response = await openAI.getCompletion(prompt);
  
  // Validar y sanitizar la respuesta de la IA antes de procesarla
  return sanitizeAIOutput(response);
}`,
  },
  {
    icon: '🤝',
    title: 'Cultura de Seguridad',
    problem: 'Ignorar o posponer alertas de seguridad críticas en librerías o dependencias desactualizadas para acelerar los despliegues.',
    example: 'Mantener una versión antigua de una librería con vulnerabilidades conocidas que permiten la ejecución remota de código.',
    solution: 'Resolver alertas críticas antes de subir a producción y automatizar la actualización de dependencias.',
    tips: ['Nunca ignores los reportes de Dependabot o Snyk', 'Fomenta la cultura de reporte rápido de incidentes', 'Realiza auditorías de dependencias periódicamente'],
    codeLanguage: 'json',
    vulnerableCode: `// ❌ Código Inseguro: Uso de dependencias obsoletas
"dependencies": {
  // Versión antigua con vulnerabilidad crítica conocida (ReDoS)
  "express": "4.16.0" 
}`,
    secureCode: `// ✅ Código Seguro: Dependencias actualizadas
"dependencies": {
  // Versión actualizada con parches de seguridad aplicados
  "express": "^4.21.0" 
}`,
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
  
  // Game scores (Colombia COL vs Congo COG)
  const [goals, setGoals] = useState(0)
  const [saves, setSaves] = useState(0)
  
  const [gkName] = useState('Mosquera')
  const [gkDiveDir, setGkDiveDir] = useState<'left' | 'center' | 'right'>('center')
  const [shotResult, setShotResult] = useState<'goal' | 'saved' | 'missed' | null>(null)
  
  const [showKickEffect, setShowKickEffect] = useState(false)
  const [showIntroBall, setShowIntroBall] = useState(true)
  const [stars, setStars] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [slideDir, setSlideDir] = useState<'forward' | 'back'>('forward')

  // Pagination for the security slides
  const [activePage, setActivePage] = useState(0)

  // References for scrolling
  const boardRef = useRef<HTMLDivElement>(null)

  const handleKick = useCallback(() => {
    if (phase !== 'aiming') return
    setPhase('kicking')
    setShowKickEffect(true)

    // Ball boundaries logic
    const isOffTarget = horizontalAim < 26 || horizontalAim > 74 || verticalAim > 85 || power > 95
    
    // Keeper dive choice
    const gkChoice = (['left', 'center', 'right'] as const)[
      Math.floor(Math.random() * 3)
    ]
    setGkDiveDir(gkChoice)

    // Shot horizontal zone
    const shotZone = horizontalAim < 42 ? 'left' : horizontalAim > 58 ? 'right' : 'center'

    setTimeout(() => {
      setShowKickEffect(false)
      
      if (isOffTarget) {
        setShotResult('missed')
        setSaves((prev) => prev + 1)
        setPhase('result')
      } else {
        const isSaved = shotZone === gkChoice
        if (isSaved) {
          setShotResult('saved')
          setSaves((prev) => prev + 1)
          setPhase('result')
        } else {
          setShotResult('goal')
          setGoals((prev) => prev + 1)
          setPhase('result')
          setCelebrating(true)

          setTimeout(() => {
            setCelebrating(false)
            setPhase('meme')
          }, 1500)
        }
      }
    }, 900)
  }, [phase, horizontalAim, verticalAim, power])

  const handleRetry = useCallback(() => {
    setPhase('aiming')
    setShotResult(null)
    setShowKickEffect(false)
    setHorizontalAim(50)
    setVerticalAim(50)
    setPower(50)
  }, [])

  const handlePlayAgain = useCallback(() => {
    setPhase('intro')
    setShotResult(null)
    setShowKickEffect(false)
    setShowIntroBall(true)
    setStars(0)
    setGoals(0)
    setSaves(0)
    setHorizontalAim(50)
    setVerticalAim(50)
    setPower(50)
    setCelebrating(false)
    setActivePage(0)
    setTimeout(() => setShowIntroBall(false), 1500)
  }, [])

  // Calculate ball target position in 3D perspective coordinates
  const getBallTargetStyles = () => {
    if (phase === 'kicking' || phase === 'result') {
      const left = 25 + (horizontalAim / 100) * 50
      const top = 5 + ((100 - verticalAim) / 100) * 35
      return {
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%, -50%) scale(0.4)',
        transition: 'left 0.9s cubic-bezier(0.25, 1, 0.5, 1), top 0.9s cubic-bezier(0.25, 1, 0.5, 1), transform 0.9s cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: (shotResult === 'saved' || shotResult === 'missed') && phase === 'result' ? 0.3 : 1,
      }
    }
    return {
      left: '50%',
      bottom: '22%',
      transform: 'translateX(-50%) scale(1.1)',
    }
  }

  // Pointer event slider handlers for HUD controls
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    type: 'horizontal' | 'vertical' | 'power'
  ) => {
    if (phase !== 'aiming') return
    
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    
    const updateValue = (clientX: number, clientY: number) => {
      if (type === 'horizontal') {
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        setHorizontalAim(Math.round((x / rect.width) * 100));
      } else if (type === 'vertical') {
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        setVerticalAim(Math.round(((rect.height - y) / rect.height) * 100));
      } else if (type === 'power') {
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
        setPower(Math.round(((rect.height - y) / rect.height) * 100));
      }
    }

    updateValue(e.clientX, e.clientY)
    container.setPointerCapture(e.pointerId)

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateValue(moveEvent.clientX, moveEvent.clientY)
    }

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
    if (activePage < 4) {
      setActivePage((prev) => {
        const next = prev + 1
        setStars((s) => Math.max(s, next + 1))
        return next
      })
    } else {
      setActivePage(5)
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
  }, [phase])

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 bg-[#E2E8F0] font-sans">

      {/* MEME TRANSITION — aparece tras marcar gol */}
      {phase === 'meme' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white animate-presentation-enter overflow-y-auto p-6">
          <div className="max-w-sm w-full flex flex-col items-center gap-5 py-8">

            {/* Hook */}
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-[#002F6C] leading-tight">
                ¡Como caíste! 🎣
              </p>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Pensabas que ibas a recibir el premio...
              </p>
            </div>

            {/* Meme image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#002F6C]/10 w-full max-w-xs">
              <img
                src="/meme-dog.jpg"
                alt="Meme perro ciberseguridad"
                className="w-full h-auto"
              />
            </div>

            {/* Mensaje */}
            <div className="text-center bg-[#002F6C]/5 border border-[#002F6C]/10 rounded-2xl p-5">
              <p className="text-base font-semibold text-slate-700 leading-relaxed">
                Ahora que caíste en la trampa... 🔐<br />
                Ve al módulo y aprende a{' '}
                <span className="text-[#00A99D] font-black">no dejar que te anoten goles de seguridad</span>.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                setPhase('info')
                setActivePage(0)
                setSlideDir('forward')
                setStars(1)
              }}
              className="bg-[#00A99D] hover:bg-[#008B81] text-white font-black px-10 py-4 rounded-full text-sm tracking-widest uppercase transition-all shadow-xl active:scale-95 animate-pulse-soft w-full max-w-xs"
            >
              🔐 Ver módulo de seguridad
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN PRESENTATION OVERLAY — Info Phase */}
      {phase === 'info' && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-presentation-enter">

          {/* Header bar */}
          <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-200 shrink-0">
            <span className="text-[#002F6C]/60 text-[10px] sm:text-xs font-black uppercase tracking-widest">
              Módulos de Seguridad
            </span>

            {/* Dot step indicators */}
            {activePage < 5 && (
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
              {activePage < 5 ? `${activePage + 1} / 5` : '✓ Completado'}
            </span>
          </div>

          {/* Scrollable slide content */}
          <div className="flex-1 overflow-y-auto bg-[#F8FAFF]">
            {activePage < 5 ? (
              <div
                key={activePage}
                className={`p-6 sm:p-10 lg:p-14 flex flex-col gap-6 ${slideDir === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
              >
                {/* Module title */}
                <div className="flex items-center gap-4">
                  <span className="text-5xl sm:text-6xl select-none">{sections[activePage].icon}</span>
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-[#002F6C] tracking-wide leading-tight">
                      {sections[activePage].title}
                    </h2>
                    <p className="text-[#00A99D] text-xs sm:text-sm font-bold uppercase tracking-widest mt-1">
                      Vulnerabilidad en Desarrollo
                    </p>
                  </div>
                </div>

                {/* Problem / Example / Solution cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <p className="text-red-600 text-[10px] font-black tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      ⚠️ El Problema
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {sections[activePage].problem}
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="text-amber-600 text-[10px] font-black tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      📌 Ejemplo Real
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed italic">
                      "{sections[activePage].example}"
                    </p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <p className="text-emerald-600 text-[10px] font-black tracking-widest uppercase mb-3 flex items-center gap-1.5">
                      ✅ La Solución
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {sections[activePage].solution}
                    </p>
                  </div>
                </div>

                {/* Code comparison */}
                <div>
                  <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                    Comparación de Código
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-slate-950 rounded-2xl border border-red-500/30 overflow-hidden shadow-sm">
                      <div className="bg-red-950/60 border-b border-red-500/30 px-4 py-3 flex items-center justify-between">
                        <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">❌ Código Inseguro</span>
                        <span className="text-gray-500 text-[10px] uppercase">{sections[activePage].codeLanguage}</span>
                      </div>
                      <pre className="p-5 text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
                        <code>{sections[activePage].vulnerableCode}</code>
                      </pre>
                    </div>
                    <div className="bg-slate-950 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-sm">
                      <div className="bg-emerald-950/60 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between">
                        <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">✅ Código Seguro</span>
                        <span className="text-gray-500 text-[10px] uppercase">{sections[activePage].codeLanguage}</span>
                      </div>
                      <pre className="p-5 text-xs sm:text-sm font-mono text-gray-300 overflow-x-auto leading-relaxed">
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
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] shrink-0" />
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              /* Completion screen */
              <div className="flex flex-col items-center justify-center text-center p-10 min-h-[70vh]">
                <div className="text-7xl mb-6 animate-bounce">🏆🇨🇴🎉</div>
                <h3 className="text-3xl sm:text-5xl font-black text-[#002F6C] mb-4 tracking-wide leading-tight">
                  ¡CULTURA DE SEGURIDAD<br />COMPLETADA!
                </h3>
                <p className="text-slate-500 text-sm sm:text-base mb-10 max-w-lg leading-relaxed">
                  Has superado a la defensa del Congo y aprendido los 5 pilares para escribir código limpio, seguro y confiable en los proyectos de Alegra SAS.
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

          {/* Footer navigation */}
          {activePage < 5 && (
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
                {activePage === 4 ? 'Finalizar lección 🏆' : 'Siguiente ➡'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game / Board Container - Centered */}
      <div ref={boardRef} className="w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden select-none">

          {/* Main board content container */}
          <div
            className="relative w-full transition-all duration-300"
            style={{ paddingBottom: '62%' }}
          >
            <>
                {/* 1. STADIUM BACKGROUND (Sky & Crowd) */}
                <div className="absolute inset-0 bg-[#0F172A]" />
                
                {/* Crowd rows of spectators */}
                <div className="absolute top-0 left-0 right-0 h-[18%] opacity-35 overflow-hidden flex flex-col justify-between py-1 px-4">
                  {/* Row 1 */}
                  <div className="flex gap-[3px] justify-between">
                    {Array.from({ length: 70 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i % 4 === 0 ? '#475569' : i % 4 === 1 ? '#334155' : i % 4 === 2 ? '#FF5F00' : '#1e293b' }} />
                    ))}
                  </div>
                  {/* Row 2 */}
                  <div className="flex gap-[3px] justify-between px-2">
                    {Array.from({ length: 68 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i % 4 === 0 ? '#334155' : i % 4 === 1 ? '#475569' : i % 4 === 2 ? '#002F6C' : '#0F172A' }} />
                    ))}
                  </div>
                  {/* Row 3 */}
                  <div className="flex gap-[3px] justify-between px-1">
                    {Array.from({ length: 69 }).map((_, i) => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i % 4 === 0 ? '#475569' : i % 4 === 1 ? '#FF5F00' : i % 4 === 2 ? '#334155' : '#1e293b' }} />
                    ))}
                  </div>
                </div>

                {/* LED Advertising Board/Barrier with Scrolling Text */}
                <div className="absolute top-[18%] left-0 right-0 h-[4%] bg-slate-800 border-t border-b border-slate-700 flex items-center overflow-hidden">
                  <div className="w-full flex overflow-hidden select-none">
                    <div className="animate-marquee flex gap-20 text-[#00C4D3] font-black text-[10px] sm:text-[12px] tracking-[0.25em] uppercase">
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                    </div>
                    <div className="animate-marquee flex gap-20 text-[#00C4D3] font-black text-[10px] sm:text-[12px] tracking-[0.25em] uppercase" aria-hidden="true">
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                      <span>Alegra</span>
                    </div>
                  </div>
                </div>

                {/* 2. PITCH (3D Grass Stripes) */}
                <div className="absolute top-[22%] left-0 right-0 bottom-0 overflow-hidden flex flex-col">
                  {PITCH_STRIPES.map((stripe, idx) => (
                    <div
                      key={idx}
                      style={{
                        height: stripe.h,
                        backgroundColor: stripe.color,
                        width: '100%',
                      }}
                    />
                  ))}

                  {/* White lines in perspective */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                    {/* Penalty Area */}
                    <polygon points="110,0 290,0 360,260 40,260" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                    {/* Goal Area */}
                    <polygon points="150,0 250,0 270,100 130,100" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                    {/* Penalty Spot */}
                    <circle cx="200" cy="180" r="3" fill="white" opacity="0.9" />
                    {/* Penalty Arc */}
                    <path d="M 160,260 A 55,55 0 0,1 240,260" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                  </svg>
                </div>

                {/* 3. GOAL & NET */}
                <div className="absolute" style={{ top: '16%', left: '36%', right: '36%', height: '24%' }}>
                  <div className="absolute bottom-0 left-[-3%] right-[-3%] h-[3px] bg-black/35 blur-[1px] rounded-full" />
                  <div className={`absolute inset-0 goal-net rounded-t-sm transition-transform duration-100 ${celebrating ? 'animate-net-shake' : ''}`} style={{ opacity: 0.65, borderTop: '2px solid white', borderLeft: '1px solid rgba(255,255,255,0.8)', borderRight: '1px solid rgba(255,255,255,0.8)' }} />
                  {/* Goalposts */}
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] sm:w-[5px] bg-gradient-to-r from-gray-100 to-white rounded-l-sm shadow-md" />
                  <div className="absolute right-0 top-0 bottom-0 w-[4px] sm:w-[5px] bg-gradient-to-r from-white to-gray-100 rounded-r-sm shadow-md" />
                  <div className="absolute top-0 left-0 right-0 h-[4px] sm:h-[5px] bg-gradient-to-b from-gray-100 to-white rounded-t-sm shadow-md" />

                  {/* GOALKEEPER (Congo Colors) */}
                  <div
                    className="absolute bottom-[2%] left-1/2 -translate-x-1/2 transition-all duration-500"
                    style={phase === 'kicking' || phase === 'result' ? {
                      transform: `translateX(-50%) translateX(${gkDiveDir === 'left' ? '-55px' : gkDiveDir === 'right' ? '55px' : '0px'}) translateY(${gkDiveDir === 'center' ? '-10px' : '5px'}) rotate(${gkDiveDir === 'left' ? '-45deg' : gkDiveDir === 'right' ? '45deg' : '0deg'})`,
                      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    } : {}}
                  >
                    <div className={`flex flex-col items-center ${shotResult === 'saved' && phase === 'result' ? 'animate-pulse-soft' : ''}`}>
                      <div className="relative">
                        {/* Head */}
                        <div className="w-5 h-5 rounded-full bg-[#8d5524] mx-auto border border-[#704214] relative" style={{ boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.1)' }}>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t-full bg-slate-900" />
                        </div>
                        {/* Green Jersey */}
                        <div className="w-7 h-6 bg-[#009543] border-t border-[#FCD116] rounded-sm mx-auto -mt-0.5 flex items-center justify-center relative">
                          <span className="text-white text-[5px] font-black">1</span>
                          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#CE1126] rotate-12" />
                        </div>
                        {/* Gloves */}
                        <div className="absolute -left-2 top-2.5 w-2 h-2 rounded bg-white border border-[#CE1126]" />
                        <div className="absolute -right-2 top-2.5 w-2 h-2 rounded bg-white border border-[#CE1126]" />
                      </div>
                      {/* Yellow Shorts & Red Socks */}
                      <div className="flex gap-1 -mt-0.5">
                        <div className="w-2 h-2.5 bg-[#FCD116] rounded-sm border-b border-[#CE1126]" />
                        <div className="w-2 h-2.5 bg-[#FCD116] rounded-sm border-b border-[#CE1126]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. SCOREBOARDS */}
                {/* Left (Colombia) */}
                <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-1">
                  <div className="bg-black/90 border-2 border-white rounded-lg flex items-center overflow-hidden shadow-lg h-9 sm:h-11">
                    <div className="flex items-center gap-1.5 px-3 py-1 sm:py-2">
                      <span className="text-sm sm:text-base select-none">🇨🇴</span>
                      <span className="text-white font-black text-xs sm:text-sm tracking-wider">COL</span>
                    </div>
                    <div className="w-[1.5px] h-full bg-white/40" />
                    <div className="bg-black text-white font-extrabold text-sm sm:text-base px-3.5 sm:px-4 py-1 sm:py-2 flex items-center justify-center min-w-[36px] sm:min-w-[42px] h-full">
                      {goals}
                    </div>
                  </div>
                  <div className="bg-[#002F6C] text-white text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase">
                    Colombia
                  </div>
                </div>

                {/* Right (República del Congo) */}
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                  <div className="bg-black/90 border-2 border-white rounded-lg flex items-center overflow-hidden shadow-lg h-9 sm:h-11">
                    <div className="bg-black text-white font-extrabold text-sm sm:text-base px-3.5 sm:px-4 py-1 sm:py-2 flex items-center justify-center min-w-[36px] sm:min-w-[42px] h-full">
                      {saves}
                    </div>
                    <div className="w-[1.5px] h-full bg-white/40" />
                    <div className="flex items-center gap-1.5 px-3 py-1 sm:py-2">
                      <span className="text-white font-black text-xs sm:text-sm tracking-wider">COG</span>
                      <span className="text-sm sm:text-base select-none">🇨🇬</span>
                    </div>
                  </div>
                  <div className="bg-[#CE1126] text-white text-[8px] sm:text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase">
                    R. Congo
                  </div>
                </div>

                {/* 5. KICKER (Colombia) */}
                {(phase === 'aiming' || phase === 'kicking' || phase === 'result') && (
                  <div
                    className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-10 transition-all"
                    style={phase === 'kicking' ? {
                      transform: 'translateX(-50%) translateY(-10px) scale(0.95)',
                      opacity: 0.9,
                      transition: 'all 0.5s ease-out',
                    } : {}}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-2 bg-black/45 blur-[2px] rounded-full -bottom-1 absolute" />
                      {/* Head */}
                      <div className="w-5 h-5 rounded-full bg-[#ffcd94] border border-[#e0b080] relative" style={{ boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.1)' }}>
                        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-4 h-1.5 rounded-t-full bg-amber-950" />
                      </div>
                      {/* Colombia Yellow Jersey */}
                      <div className="w-7 h-5 bg-[#FCD116] rounded-sm -mt-0.5 flex items-center justify-center relative shadow-sm">
                        <span className="text-[#003893] text-[6px] font-black">9</span>
                        <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-[#CE1126] rounded-sm" />
                        <div className="absolute top-0.5 right-0.5 w-1.5 h-0.5 bg-[#CE1126] rounded-sm" />
                      </div>
                      {/* Colombia Blue Shorts */}
                      <div className="w-5.5 h-3 bg-[#003893] rounded-sm -mt-0.5" />
                      {/* Red Socks */}
                      <div className="flex gap-2 -mt-0.5">
                        <div className="w-1.5 h-3 bg-[#CE1126] rounded-b-xs" />
                        <div className="w-1.5 h-3 bg-[#CE1126] rounded-b-xs" />
                      </div>
                      {/* Boots */}
                      <div className="flex gap-2 -mt-0.5">
                        <div className="w-2 h-1 bg-black rounded-xs" />
                        <div className="w-2 h-1 bg-black rounded-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ball intro animation */}
                {phase === 'intro' && showIntroBall && (
                  <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-20 animate-ball-drop">
                    <div className="text-3xl drop-shadow-lg">⚽</div>
                  </div>
                )}

                {/* Active game ball */}
                {(phase === 'aiming' || phase === 'kicking' || phase === 'result') && (
                  <div
                    className="absolute z-20"
                    style={getBallTargetStyles()}
                  >
                    <div
                      className="text-2xl drop-shadow-lg select-none"
                      style={phase === 'kicking' ? {
                        animation: 'spin 0.8s linear infinite',
                      } : {}}
                    >
                      ⚽
                    </div>
                  </div>
                )}

                {/* Kick impact overlay */}
                {showKickEffect && (
                  <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 z-30 text-2xl animate-ping select-none">💥</div>
                )}

                {/* Game result overlays */}
                {phase === 'result' && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/35 backdrop-blur-xs">
                    <div className="text-center animate-fade-in bg-slate-900/90 border border-slate-700 rounded-3xl p-6 max-w-xs mx-auto shadow-2xl">
                      {shotResult === 'goal' && (
                        <div>
                          <div className="text-5xl mb-2 animate-bounce">⚽🇨🇴</div>
                          <div className="text-3xl font-black text-[#38A169] drop-shadow-lg tracking-wider">
                            ¡GOLAZO!
                          </div>
                          <div className="text-white/80 text-xs mt-1 font-semibold">
                            ¡Superaste la defensa del Congo!
                          </div>
                        </div>
                      )}
                      {shotResult === 'saved' && (
                        <div>
                          <div className="text-5xl mb-2">🇨🇬🧤</div>
                          <div className="text-2xl font-black text-[#E53E3E] drop-shadow-lg">
                            ¡Atajó {gkName}!
                          </div>
                          <div className="text-white/80 text-xs mt-1 font-semibold">
                            Congo salvó su portería.
                          </div>
                          <button
                            onClick={handleRetry}
                            className="mt-4 bg-[#00A99D] hover:bg-[#008B81] text-white font-extrabold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-[#00A99D]/40 text-xs tracking-wider uppercase active:scale-95"
                          >
                            🔄 Intentar de nuevo
                          </button>
                        </div>
                      )}
                      {shotResult === 'missed' && (
                        <div>
                          <div className="text-5xl mb-2">💨</div>
                          <div className="text-2xl font-black text-amber-500 drop-shadow-lg">
                            ¡DESVIADO!
                          </div>
                          <div className="text-white/80 text-xs mt-1 font-semibold">
                            El tiro se fue fuera. ¡Afina la puntería!
                          </div>
                          <button
                            onClick={handleRetry}
                            className="mt-4 bg-[#00A99D] hover:bg-[#008B81] text-white font-extrabold px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-[#00A99D]/40 text-xs tracking-wider uppercase active:scale-95"
                          >
                            🔄 Intentar de nuevo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flash on goal */}
                {celebrating && (
                  <div className="absolute inset-0 z-35 pointer-events-none animate-goal-flash" />
                )}

                {/* ARCADE HUD CONTROLS (Bottom Overlay) */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-xs flex items-center justify-between gap-4 z-30 border-t border-white/10">
                  
                  {/* Stars Badging */}
                  <div className="bg-black/90 border border-amber-500/50 rounded-full px-3.5 py-1 flex items-center gap-1.5 shadow-md">
                    <span className="text-amber-400 text-sm">⭐</span>
                    <span className="text-white font-black text-sm tracking-wider">{stars}</span>
                  </div>

                  {/* Sliders */}
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1 max-w-md">
                    
                    {/* Direction */}
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] sm:text-[9px] text-white/95 font-black uppercase tracking-wider mb-1">
                        Dirección
                      </span>
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
                        <div
                          className="absolute bottom-0.5 w-4 h-4 -translate-x-1/2 flex items-center justify-center text-xs drop-shadow-md select-none transition-all duration-75"
                          style={{ left: `${horizontalAim}%` }}
                        >
                          ⚽
                        </div>
                      </div>
                    </div>

                    {/* Height */}
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] sm:text-[9px] text-white/95 font-black uppercase tracking-wider mb-1">
                        Altura
                      </span>
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'vertical')}
                        className="relative w-20 sm:w-26 h-9 sm:h-11 bg-emerald-950 border border-white/40 rounded-md overflow-hidden shadow-inner cursor-pointer"
                        style={{ touchAction: 'none' }}
                      >
                        <div className="absolute inset-0 goal-net opacity-30" />
                        <div className="absolute top-0 left-0 right-0 h-[15%] bg-red-600/20" />
                        <div className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-1 bg-[#E53E3E] rounded-full" />
                        <div
                          className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center text-xs drop-shadow-md select-none transition-all duration-75"
                          style={{ bottom: `${verticalAim}%` }}
                        >
                          ⚽
                        </div>
                      </div>
                    </div>

                    {/* Power */}
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] sm:text-[9px] text-white/95 font-black uppercase tracking-wider mb-1">
                        Potencia
                      </span>
                      <div
                        onPointerDown={(e) => handlePointerDown(e, 'power')}
                        className="relative w-9 sm:w-11 h-9 sm:h-11 flex items-center justify-center cursor-pointer"
                        style={{ touchAction: 'none' }}
                      >
                        <div
                          className="absolute inset-0 opacity-80 border border-white/20"
                          style={{
                            background: 'linear-gradient(to top, #38A169 0%, #ECC94B 50%, #E53E3E 100%)',
                            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
                          }}
                        />
                        <div className="absolute top-0.5 bottom-0.5 left-1/2 -translate-x-1/2 w-1 bg-[#E53E3E] rounded-full" />
                        <div
                          className="absolute left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center text-xs drop-shadow-md select-none transition-all duration-75"
                          style={{ bottom: `${power}%` }}
                        >
                          ⚽
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Reset Button */}
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

                {/* Kick Button */}
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

                {/* Clean Intro Screen (Logo, Alegra gol, Tap to Start) */}
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
