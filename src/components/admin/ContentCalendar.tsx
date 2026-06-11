import { useState } from 'react'
import { useSocialStore } from '@/stores/socialStore'

const DAYS_OF_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  return days
}

export default function ContentCalendar() {
  const posts = useSocialStore((s) => s.posts)
  const campaigns = useSocialStore((s) => s.campaigns)
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const days = getMonthDays(year, month)
  const monthName = new Date(year, month).toLocaleDateString('es-CR', {
    month: 'long',
    year: 'numeric',
  })

  const scheduledPosts = posts.filter((p) => p.status === 'scheduled' || p.status === 'published')

  const postsByDay = new Map<number, typeof posts>()
  for (const post of scheduledPosts) {
    const date = post.scheduledAt
      ? new Date(post.scheduledAt)
      : post.publishedAt
        ? new Date(post.publishedAt)
        : null
    if (date && date.getMonth() === month && date.getFullYear() === year) {
      const day = date.getDate()
      const existing = postsByDay.get(day) ?? []
      existing.push(post)
      postsByDay.set(day, existing)
    }
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const getCampaignName = (campaignId: string) =>
    campaigns.find((c) => c.id === campaignId)?.name ?? ''

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  return (
    <div className='social-section'>
      <h3>Calendario de Contenidos</h3>

      <div className='calendar-nav'>
        <button className='btn-small btn-outline' onClick={prevMonth} type='button'>
          ←
        </button>
        <span className='calendar-nav__month'>{monthName}</span>
        <button className='btn-small btn-outline' onClick={nextMonth} type='button'>
          →
        </button>
      </div>

      <div className='calendar-grid'>
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className='calendar-grid__header'>
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dayPosts = day ? (postsByDay.get(day) ?? []) : []
          const dayKey = day !== null ? `day-${day}` : `empty-${i}`
          return (
            <button
              key={dayKey}
              className={`calendar-day ${day === null ? 'calendar-day--empty' : ''} ${dayPosts.length > 0 ? 'calendar-day--has-posts' : ''} ${selectedDay === day ? 'calendar-day--selected' : ''}`}
              onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
              type='button'
              disabled={day === null}
            >
              {day !== null && (
                <>
                  <span className='calendar-day__num'>{day}</span>
                  {dayPosts.length > 0 && (
                    <span className='calendar-day__count'>{dayPosts.length}</span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (postsByDay.get(selectedDay)?.length ?? 0) > 0 && (
        <div className='calendar-day-detail'>
          <h4>
            Posts — {selectedDay} de {monthName}
          </h4>
          {postsByDay.get(selectedDay)?.map((post) => (
            <div key={post.id} className='calendar-post-item'>
              <span className='post-status post-status--{post.status}'>
                {post.status === 'published' ? '✅' : '📌'}
              </span>
              <span className='calendar-post-item__text'>
                {post.text.slice(0, 80)}
                {post.text.length > 80 ? '...' : ''}
              </span>
              {post.campaignId && (
                <span className='calendar-post-item__campaign'>
                  {getCampaignName(post.campaignId)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
