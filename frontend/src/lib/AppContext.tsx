'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './supabase'

export interface Todo {
  id: number
  text: string
  completed: boolean
  due_date?: string
  due_time?: string
  created_at: string
  priority: 'low' | 'medium' | 'high'
}

export interface CalendarEvent {
  id: number
  title: string
  date: string
  description?: string
  created_at: string
  type: 'event' | 'deadline'
  color: string
  related_todo_id?: number
}

interface AppContextType {
  todos: Todo[]
  events: CalendarEvent[]
  loading: boolean
  addTodo: (todo: Omit<Todo, 'id' | 'created_at'>) => Promise<Todo | null>
  toggleTodo: (id: number) => Promise<void>
  deleteTodo: (id: number) => Promise<void>
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => Promise<CalendarEvent | null>
  deleteEvent: (id: number) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch todos
        const { data: todosData, error: todosError } = await supabase
          .from('todos')
          .select('*')
          .order('due_date', { ascending: true })
          .order('created_at', { ascending: false })

        if (todosError) throw todosError
        
        // Fetch events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true })

        if (eventsError) throw eventsError
        
        setTodos(todosData || [])
        setEvents(eventsData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addTodo = async (todo: Omit<Todo, 'id' | 'created_at'>) => {
    try {
      const { data: todoData, error: todoError } = await supabase
        .from('todos')
        .insert([{
          ...todo,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (todoError) throw todoError
      
      setTodos([todoData, ...todos])
      
      // If the todo has a due date, add it as a deadline event on the calendar
      if (todo.due_date) {
        const dueDateTime = todo.due_date + (todo.due_time ? `T${todo.due_time}:00` : 'T00:00:00')
        
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .insert([{
            title: todo.text,
            date: dueDateTime,
            description: `Priority: ${todo.priority}`,
            created_at: new Date().toISOString(),
            type: 'deadline',
            color: 'bg-red-100 text-red-800',
            related_todo_id: todoData.id
          }])
          .select()
          .single()
          
        if (eventError) throw eventError
        setEvents([...events, eventData])
      }
      
      return todoData
    } catch (error) {
      console.error('Error adding todo:', error)
      return null
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id)

      if (error) throw error
      
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ))
      
      // Update the related event if it exists
      const relatedEvent = events.find(e => e.related_todo_id === id)
      if (relatedEvent) {
        // If completed, update the color to indicate completion
        const newColor = !todo.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        
        const { error: eventError } = await supabase
          .from('events')
          .update({ color: newColor })
          .eq('id', relatedEvent.id)
          
        if (eventError) throw eventError
        
        setEvents(events.map(e => 
          e.id === relatedEvent.id ? { ...e, color: newColor } : e
        ))
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTodos(todos.filter(todo => todo.id !== id))
      
      // Delete any related events
      const relatedEvent = events.find(e => e.related_todo_id === id)
      if (relatedEvent) {
        await deleteEvent(relatedEvent.id)
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...event,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      setEvents([...events, data])
      return data
    } catch (error) {
      console.error('Error adding event:', error)
      return null
    }
  }

  const deleteEvent = async (id: number) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setEvents(events.filter(event => event.id !== id))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <AppContext.Provider value={{ 
      todos, 
      events, 
      loading, 
      addTodo, 
      toggleTodo, 
      deleteTodo, 
      addEvent, 
      deleteEvent 
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
} 