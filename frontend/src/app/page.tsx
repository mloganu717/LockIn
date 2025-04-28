import TodoList from '@/components/TodoList'
import Calendar from '@/components/Calendar'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-900">Todo Calendar App</h1>
      <div className="grid grid-cols-1 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Calendar</h2>
          <Calendar />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Todo List</h2>
          <TodoList />
        </div>
      </div>
    </div>
  )
} 