import { useMemo } from 'react'

function getWeatherType(condition) {
  if (!condition) return 'clear'
  const c = condition.toLowerCase()
  if (c.includes('thunder') || c.includes('storm')) return 'thunder'
  if (c.includes('drizzle')) return 'drizzle'
  if (c.includes('rain') || c.includes('shower')) return 'rain'
  if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard')) return 'snow'
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'fog'
  if (c.includes('overcast')) return 'overcast'
  if (c.includes('cloud')) return 'cloudy'
  if (c.includes('partly')) return 'partly'
  if (c.includes('sunny') || c.includes('clear')) return 'sunny'
  return 'clear'
}

function RainEffect({ heavy }) {
  const drops = useMemo(() => {
    const count = heavy ? 60 : 30
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      speed: 0.4 + Math.random() * 0.4,
      opacity: 0.3 + Math.random() * 0.4,
      width: 1 + Math.random() * 0.5,
      height: 15 + Math.random() * 20,
    }))
  }, [heavy])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      {drops.map(d => (
        <line
          key={d.id}
          x1={`${d.x}%`} y1="-5%"
          x2={`${d.x - 0.3}%`} y2={`${d.height / 3}%`}
          stroke={`rgba(120,180,255,${d.opacity})`}
          strokeWidth={d.width}
          strokeLinecap="round"
          style={{
            animation: `rainFall ${d.speed}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </svg>
  )
}

function DrizzleEffect() {
  const drops = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      speed: 0.8 + Math.random() * 0.6,
      opacity: 0.2 + Math.random() * 0.3,
    }))
  , [])

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      {drops.map(d => (
        <circle
          key={d.id}
          cx={`${d.x}%`} cy="0"
          r="1"
          fill={`rgba(160,200,255,${d.opacity})`}
          style={{
            animation: `drizzleFall ${d.speed}s ease-in ${d.delay}s infinite`,
          }}
        />
      ))}
    </svg>
  )
}

function SnowEffect() {
  const flakes = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      speed: 3 + Math.random() * 4,
      size: 2 + Math.random() * 3,
      drift: -15 + Math.random() * 30,
      opacity: 0.4 + Math.random() * 0.5,
    }))
  , [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map(f => (
        <div
          key={f.id}
          className="absolute rounded-full"
          style={{
            left: `${f.x}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            background: `radial-gradient(circle, rgba(255,255,255,${f.opacity}), rgba(200,220,255,${f.opacity * 0.5}))`,
            boxShadow: `0 0 ${f.size}px rgba(200,220,255,0.3)`,
            animation: `snowFall ${f.speed}s ease-in-out ${f.delay}s infinite`,
            '--drift': `${f.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

function ThunderEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <RainEffect heavy />
      <div className="absolute inset-0 thunder-flash" />
      <div className="absolute inset-0 thunder-flash-2" />
    </div>
  )
}

function SunnyEffect() {
  const rays = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      rotation: i * 30,
      delay: i * 0.2,
    }))
  , [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-[60%] -right-[30%] w-[160px] h-[160px] rounded-full sun-glow"
        style={{
          background: 'radial-gradient(circle, rgba(250,204,21,0.15), rgba(251,146,60,0.05), transparent 70%)',
        }}
      />
      {rays.map(r => (
        <div
          key={r.id}
          className="absolute sun-ray"
          style={{
            top: '-20%',
            right: '5%',
            width: '60px',
            height: '1.5px',
            background: 'linear-gradient(90deg, rgba(250,204,21,0.25), transparent)',
            transformOrigin: '0 50%',
            transform: `rotate(${r.rotation}deg)`,
            animationDelay: `${r.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function CloudyEffect() {
  const clouds = useMemo(() => [
    { id: 0, x: 5, y: 8, w: 70, h: 25, o: 0.12, dur: 18 },
    { id: 1, x: 40, y: 15, w: 55, h: 20, o: 0.1, dur: 22 },
    { id: 2, x: 15, y: 30, w: 60, h: 22, o: 0.08, dur: 25 },
    { id: 3, x: 55, y: 5, w: 50, h: 18, o: 0.09, dur: 20 },
  ], [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {clouds.map(c => (
        <div key={c.id} className="absolute" style={{
          left: `${c.x}%`, top: `${c.y}%`,
          width: `${c.w}px`, height: `${c.h}px`,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(180,190,210,${c.o}), transparent 70%)`,
          filter: 'blur(4px)',
          animation: `cloudDrift ${c.dur}s ease-in-out infinite alternate`,
          animationDelay: `${c.id * 2}s`,
        }} />
      ))}
    </div>
  )
}

function OvercastEffect() {
  const clouds = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 80,
      y: 5 + Math.random() * 40,
      w: 60 + Math.random() * 40,
      h: 20 + Math.random() * 15,
      o: 0.08 + Math.random() * 0.08,
      dur: 20 + Math.random() * 15,
    }))
  , [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {clouds.map(c => (
        <div key={c.id} className="absolute" style={{
          left: `${c.x}%`, top: `${c.y}%`,
          width: `${c.w}px`, height: `${c.h}px`,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(160,170,190,${c.o}), transparent 70%)`,
          filter: 'blur(6px)',
          animation: `cloudDrift ${c.dur}s ease-in-out infinite alternate`,
          animationDelay: `${c.id * 2}s`,
        }} />
      ))}
    </div>
  )
}

function FogEffect() {
  const layers = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      y: 10 + i * 18,
      o: 0.06 + Math.random() * 0.06,
      dur: 12 + i * 4,
      delay: i * 1.5,
    }))
  , [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {layers.map(l => (
        <div key={l.id} className="absolute fog-layer" style={{
          top: `${l.y}%`,
          left: '-30%',
          width: '160%',
          height: '25px',
          background: `linear-gradient(90deg, transparent, rgba(180,190,210,${l.o}), rgba(200,210,220,${l.o * 0.7}), transparent)`,
          filter: 'blur(8px)',
          animation: `fogDrift ${l.dur}s ease-in-out ${l.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  )
}

export default function WeatherEffects({ condition, intensity = 'normal' }) {
  const type = getWeatherType(condition)

  const style = useMemo(() => ({
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    borderRadius: 'inherit',
  }), [])

  const content = useMemo(() => {
    switch (type) {
      case 'rain': return <RainEffect heavy={false} />
      case 'drizzle': return <DrizzleEffect />
      case 'thunder': return <ThunderEffect />
      case 'snow': return <SnowEffect />
      case 'sunny': return <SunnyEffect />
      case 'partly': return <><SunnyEffect /><CloudyEffect /></>
      case 'cloudy': return <CloudyEffect />
      case 'overcast': return <OvercastEffect />
      case 'fog': return <FogEffect />
      default: return null
    }
  }, [type])

  return <div style={style}>{content}</div>
}
