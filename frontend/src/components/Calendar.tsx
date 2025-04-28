'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { PlusIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useAppContext } from '@/lib/AppContext'

interface CalendarEvent {
  id: number
  title: string
  date: string
  description?: string
  created_at: string
  type: 'event' | 'deadline'
  color: string
}

const eventColors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-yellow-100 text-yellow-800',
  'bg-pink-100 text-pink-800'
]

export default function Calendar() {
  const { events, loading, addEvent } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'event',
    color: eventColors[0]
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleAddEvent = async () => {
    if (selectedDate && newEvent.title.trim()) {
      const result = await addEvent({
        title: newEvent.title,
        date: selectedDate.toISOString(),
        description: newEvent.description,
        type: newEvent.type as 'event' | 'deadline',
        color: newEvent.color
      })
      
      if (result) {
        setNewEvent({
          title: '',
          description: '',
          type: 'event',
          color: eventColors[0]
        })
        setSelectedDate(null)
      }
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.date), date)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-800">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          {daysInCalendar.map(day => {
            const dayEvents = getEventsForDate(day)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            
            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`bg-white min-h-[100px] p-2 cursor-pointer transition duration-200 ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? 'text-blue-600' : 
                  !isSameMonth(day, currentDate) ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate ${event.color} ${
                        event.type === 'deadline' ? 'border-l-4 border-red-500' : ''
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </h4>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Event description (optional)"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex gap-4">
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'event' | 'deadline' })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="event">Event</option>
                    <option value="deadline">Deadline</option>
                  </select>
                  <select
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {eventColors.map(color => (
                      <option key={color} value={color}>
                        {color.split(' ')[0].replace('bg-', '').replace('-100', '')}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddEvent}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PlusIcon className="h-5 w-5 inline-block mr-2" />
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 