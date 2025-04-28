'use client'

import { useState } from 'react'
import { PlusIcon, TrashIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { format, isPast, isToday } from 'date-fns'
import { useAppContext } from '@/lib/AppContext'

export default function TodoList() {
  const { todos, loading, addTodo, toggleTodo, deleteTodo } = useAppContext()
  const [newTodo, setNewTodo] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newDueTime, setNewDueTime] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      const result = await addTodo({
        text: newTodo,
        completed: false,
        due_date: newDueDate || undefined,
        due_time: newDueTime || undefined,
        priority
      })
      
      if (result) {
        setNewTodo('')
        setNewDueDate('')
        setNewDueTime('')
        setPriority('medium')
      }
    }
  }

  const getDueDateColor = (dueDate: string | undefined, dueTime: string | undefined) => {
    if (!dueDate) return 'text-gray-500'
    
    let dateToCheck = new Date(dueDate)
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number)
      dateToCheck.setHours(hours, minutes)
    }
    
    if (isPast(dateToCheck) && !isToday(dateToCheck)) return 'text-red-500'
    if (isToday(dateToCheck)) {
      if (dueTime) {
        const now = new Date()
        if (dateToCheck < now) return 'text-red-500'
        return 'text-orange-500'
      }
      return 'text-orange-500'
    }
    return 'text-green-500'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 gap-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Due Time</label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-4 py-2 text-gray-700 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                onClick={handleAddTodo}
                className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
              >
                <PlusIcon className="h-5 w-5 inline-block mr-1" />
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {todos.map(todo => (
            <div
              key={todo.id}
              className={`py-4 flex items-center justify-between group ${
                todo.completed ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`rounded-full p-1 hover:bg-gray-100 transition duration-200 ${
                    todo.completed ? 'text-green-500' : 'text-gray-400'
                  }`}
                >
                  <CheckCircleIcon className="h-6 w-6" />
                </button>
                <div>
                  <p className={`text-gray-800 ${todo.completed ? 'line-through' : ''}`}>
                    {todo.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {todo.due_date && (
                      <div className={`flex items-center text-sm ${getDueDateColor(todo.due_date, todo.due_time)}`}>
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(todo.due_date), 'MMM d, yyyy')}
                        {todo.due_time && (
                          <>
                            <ClockIcon className="h-4 w-4 ml-2 mr-1" />
                            {todo.due_time}
                          </>
                        )}
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                      {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition duration-200"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {todos.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No todos yet. Add one above!
          </div>
        )}
      </div>
    </div>
  )
} 