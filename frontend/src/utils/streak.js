export function trackCompletion() {
  try {
    const today = new Date().toDateString()
    const data = JSON.parse(localStorage.getItem('smarttask24_streak') || '{}')
    data[today] = (data[today] || 0) + 1
    localStorage.setItem('smarttask24_streak', JSON.stringify(data))
  } catch {}
}

export function resetStreakIfBroken() {
  try {
    const data = JSON.parse(localStorage.getItem('smarttask24_streak') || '{}')
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    if (data[yesterday] && !data[today]) {
      // streak is still valid (today hasn't had completions yet, but yesterday did)
    }
  } catch {}
}

export function getStreak() {
  try {
    const data = JSON.parse(localStorage.getItem('smarttask24_streak') || '{}')
    const today = new Date().toDateString()
    let streak = 0
    let checkDate = new Date()
    while (true) {
      const key = checkDate.toDateString()
      if (data[key] && data[key] > 0) {
        streak++
        checkDate = new Date(checkDate.getTime() - 86400000)
      } else if (key === today) {
        checkDate = new Date(checkDate.getTime() - 86400000)
      } else {
        break
      }
    }
    return { streak, todayCount: data[today] || 0 }
  } catch { return { streak: 0, todayCount: 0 } }
}
