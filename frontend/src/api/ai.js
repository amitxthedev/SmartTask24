import api from './axios'

function timezoneToCity(timezone) {
  const map = {
    'Asia/Kolkata': 'Malandighi', 'Asia/Calcutta': 'Malandighi',
    'America/New_York': 'New York', 'America/Los_Angeles': 'Los Angeles',
    'America/Chicago': 'Chicago', 'America/Denver': 'Denver',
    'Europe/London': 'London', 'Europe/Paris': 'Paris',
    'Europe/Berlin': 'Berlin', 'Asia/Tokyo': 'Tokyo',
    'Asia/Shanghai': 'Shanghai', 'Asia/Dubai': 'Dubai',
    'Asia/Singapore': 'Singapore', 'Australia/Sydney': 'Sydney',
    'Asia/Bangkok': 'Bangkok', 'Asia/Jakarta': 'Jakarta',
    'Asia/Ho_Chi_Minh': 'Ho Chi Minh', 'Asia/Ho_Chi_Minh': 'Saigon',
  }
  const tz = timezone || 'UTC'
  if (map[tz]) return map[tz]
  const parts = tz.split('/')
  return parts[parts.length - 1].replace(/_/g, ' ')
}

async function fetchWeatherFromCoords(lat, lon, fallbackCity) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`https://wttr.in/${lat},${lon}?format=j1`, { signal: controller.signal })
    clearTimeout(timer)
    const data = await res.json()
    const current = data.current_condition[0]
    return {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value,
      city: data.nearest_area?.[0]?.areaName?.[0]?.value || fallbackCity || 'Your Location',
      humidity: current.humidity,
      wind: current.windspeedKmph,
    }
  } catch { clearTimeout(timer); return null }
}

async function fetchWeatherFromCity(city) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { signal: controller.signal })
    clearTimeout(timer)
    const data = await res.json()
    const current = data.current_condition[0]
    return {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value,
      city: city,
      humidity: current.humidity,
      wind: current.windspeedKmph,
    }
  } catch { clearTimeout(timer); return null }
}

async function getWeather() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const tzCity = timezoneToCity(timezone)

  try {
    const cached = localStorage.getItem('smarttask24_weather')
    const cacheTime = localStorage.getItem('smarttask24_weather_time')
    if (cached && cacheTime && Date.now() - Number(cacheTime) < 30 * 60 * 1000) {
      return JSON.parse(cached)
    }
  } catch {}

  // Attempt 1: Geolocation
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 })
    })
    const { latitude, longitude } = pos.coords
    const data = await fetchWeatherFromCoords(latitude, longitude, tzCity)
    if (data) { cacheWeather(data); return data }
  } catch {}

  // Attempt 2: IP-based geolocation
  try {
    const geoRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
    const geo = await geoRes.json()
    if (geo.latitude && geo.longitude) {
      const data = await fetchWeatherFromCoords(geo.latitude, geo.longitude, geo.city || tzCity)
      if (data) { cacheWeather(data); return data }
    }
  } catch {}

  // Attempt 3: Timezone-derived city (most reliable - no geo needed)
  try {
    const data = await fetchWeatherFromCity(tzCity)
    if (data) { cacheWeather(data); return data }
  } catch {}

  // Attempt 4: Return stale cache if available
  try {
    const cached = localStorage.getItem('smarttask24_weather')
    if (cached) return JSON.parse(cached)
  } catch {}

  return {}
}

function cacheWeather(data) {
  localStorage.setItem('smarttask24_weather', JSON.stringify(data))
  localStorage.setItem('smarttask24_weather_time', String(Date.now()))
}

export const aiChat = async (prompt) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  let weather = {}
  try { weather = await getWeather() } catch {}

  // Load user profile from localStorage
  let profile = {}
  try {
    const stored = localStorage.getItem('smarttask24_profile')
    if (stored) profile = JSON.parse(stored)
  } catch {}

  return api.post('/ai/chat', {
    prompt,
    timezone,
    weatherTemp: weather.temp || null,
    weatherCondition: weather.condition || null,
    weatherCity: weather.city || null,
    university: profile.university || null,
    course: profile.course || null,
    stream: profile.stream || null,
    semester: profile.semester || null,
    year: profile.year || null,
  })
}
export const getConversations = () => api.get('/ai/conversations')
export const clearConversations = () => api.delete('/ai/conversations')
