import { useState, useEffect } from 'react'
import { MapPin, Check, X, Loader2 } from 'lucide-react'

export default function LocationPrompt() {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const asked = sessionStorage.getItem('smarttask24_location_asked')
    if (!asked) {
      setTimeout(() => setVisible(true), 1500)
    }
  }, [])

  const fetchWeatherIP = async () => {
    const geoRes = await fetch('https://ipapi.co/json/')
    const geo = await geoRes.json()
    if (!geo.latitude) throw new Error('No geo')
    const res = await fetch(`https://wttr.in/${geo.latitude},${geo.longitude}?format=j1`)
    const data = await res.json()
    const current = data.current_condition[0]
    return {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value,
      city: geo.city || geo.region || 'Your Location',
      humidity: current.humidity,
      wind: current.windspeedKmph,
    }
  }

  const fetchWeatherGeo = async () => {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
    })
    const { latitude, longitude } = pos.coords
    const res = await fetch(`https://wttr.in/${latitude},${longitude}?format=j1`)
    const data = await res.json()
    const current = data.current_condition[0]
    return {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value,
      city: data.nearest_area?.[0]?.areaName?.[0]?.value || 'Your Location',
      humidity: current.humidity,
      wind: current.windspeedKmph,
    }
  }

  const handleAllow = async () => {
    setLoading(true)
    try {
      let weatherData
      try {
        weatherData = await fetchWeatherGeo()
      } catch {
        weatherData = await fetchWeatherIP()
      }
      localStorage.setItem('smarttask24_weather', JSON.stringify(weatherData))
      localStorage.setItem('smarttask24_weather_time', String(Date.now()))
      sessionStorage.setItem('smarttask24_location_asked', 'true')
      setVisible(false)
    } catch (err) {
      console.error('Weather fetch failed:', err)
      sessionStorage.setItem('smarttask24_location_asked', 'true')
      setVisible(false)
    }
  }

  const handleDeny = () => {
    sessionStorage.setItem('smarttask24_location_asked', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm mx-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#16161a] to-[#111114] shadow-2xl animate-scale-in">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F97316]/[0.08] blur-[60px] pointer-events-none" />

        <div className="relative z-10 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/5 border border-[#F97316]/20 flex items-center justify-center">
            <MapPin size={28} className="text-[#F97316]" />
          </div>

          <h3 className="font-heading text-[16px] font-bold text-white/80 mb-2">
            Enable Weather
          </h3>
          <p className="text-[13px] text-white/35 leading-relaxed mb-1">
            Allow location access to show local weather in your AI assistant greetings.
          </p>
          <p className="text-[11px] text-white/20 mb-6">
            Your location is only used for weather — nothing else.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDeny}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] font-medium text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-all"
            >
              <X size={14} />
              Not now
            </button>
            <button
              onClick={handleAllow}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-[13px] font-semibold text-white shadow-lg shadow-[#F97316]/20 hover:shadow-[#F97316]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {loading ? 'Detecting...' : 'Allow Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
