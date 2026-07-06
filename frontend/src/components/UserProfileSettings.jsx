import { useState, useEffect } from 'react'
import { X, GraduationCap, BookOpen, Building2, Calendar, Save, Sparkles } from 'lucide-react'

const UNIVERSITIES = [
  'MAKAUT (Maulana Abul Kalam Azad University of Technology)',
  'VIT (Vellore Institute of Technology)',
  'SRM (SRM Institute of Science and Technology)',
  'Amity University',
  'Lovely Professional University',
  'KIIT (Kalinga Institute of Industrial Technology)',
  'Manipal Institute of Technology',
  'Thapar Institute of Engineering & Technology',
  'NIT (National Institute of Technology)',
  'IIT (Indian Institute of Technology)',
  'BITS Pilani',
  'DTU (Delhi Technological University)',
  'NSUT (Netaji Subhas University of Technology)',
  'IIIT (Indian Institute of Information Technology)',
  'Anna University',
  'VTU (Visvesvaraya Technological University)',
  'GTU (Gujarat Technological University)',
  'Mumbai University',
  'Pune University',
  'Other',
]

const COURSES = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'B.E', 'M.E', 'PhD', 'Other']

const STREAMS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science',
  'Artificial Intelligence & ML',
  'Cyber Security',
  'Other',
]

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

export default function UserProfileSettings({ open, onClose }) {
  const [profile, setProfile] = useState({
    university: '',
    course: '',
    stream: '',
    semester: '',
    year: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('smarttask24_profile')
        if (stored) setProfile(JSON.parse(stored))
      } catch {}
    }
  }, [open])

  const handleSave = () => {
    localStorage.setItem('smarttask24_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#111114] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F97316]/[0.05] to-purple-500/[0.03]" />
          <div className="relative z-10 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/10 flex items-center justify-center border border-[#F97316]/10">
                <GraduationCap size={18} className="text-[#F97316]" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-[15px] text-white/80">Academic Profile</h2>
                <p className="text-[10px] text-white/30">Help AI generate subject-specific tasks</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* University */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">
              <Building2 size={10} /> University
            </label>
            <select
              value={profile.university}
              onChange={e => handleChange('university', e.target.value)}
              className="input-field w-full"
              style={{ color: '#fff', backgroundColor: '#1a1a1e' }}
            >
              <option value="" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>Select your university</option>
              {UNIVERSITIES.map(u => <option key={u} value={u} style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>{u}</option>)}
            </select>
          </div>

          {/* Course + Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">
                <BookOpen size={10} /> Course
              </label>
              <select
                value={profile.course}
                onChange={e => handleChange('course', e.target.value)}
                className="input-field w-full"
                style={{ color: '#fff', backgroundColor: '#1a1a1e' }}
              >
                <option value="" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>Select course</option>
                {COURSES.map(c => <option key={c} value={c} style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">
                <Sparkles size={10} /> Stream
              </label>
              <select
                value={profile.stream}
                onChange={e => handleChange('stream', e.target.value)}
                className="input-field w-full"
                style={{ color: '#fff', backgroundColor: '#1a1a1e' }}
              >
                <option value="" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>Select stream</option>
                {STREAMS.map(s => <option key={s} value={s} style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Semester + Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">
                <Calendar size={10} /> Semester
              </label>
              <select
                value={profile.semester}
                onChange={e => handleChange('semester', e.target.value)}
                className="input-field w-full"
                style={{ color: '#fff', backgroundColor: '#1a1a1e' }}
              >
                <option value="" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>Select semester</option>
                {SEMESTERS.map(s => <option key={s} value={s} style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold text-white/40 mb-2 uppercase tracking-wider">
                <Calendar size={10} /> Year
              </label>
              <select
                value={profile.year}
                onChange={e => handleChange('year', e.target.value)}
                className="input-field w-full"
                style={{ color: '#fff', backgroundColor: '#1a1a1e' }}
              >
                <option value="" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>Select year</option>
                <option value="1st Year" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>1st Year</option>
                <option value="2nd Year" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>2nd Year</option>
                <option value="3rd Year" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>3rd Year</option>
                <option value="4th Year" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>4th Year</option>
                <option value="5th Year" style={{ color: '#fff', backgroundColor: '#1a1a1e' }}>5th Year</option>
              </select>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl bg-[#F97316]/[0.04] border border-[#F97316]/[0.08] p-3">
            <p className="text-[11px] text-[#F97316]/60 leading-relaxed">
              <span className="font-bold">Why this matters:</span> When you say "create 10 studying tasks", AI will generate tasks specific to your course, semester, and subjects. For CSE 7th sem, it creates tasks like "DS: Trees & Graphs", "OS: Deadlock Prevention", etc.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            {saved ? (
              <>Saved!</>
            ) : (
              <><Save size={14} /> Save Profile</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
