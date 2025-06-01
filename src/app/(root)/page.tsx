import React from 'react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Project Management</h1>
        <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition">
          New Project
        </button>
      </header>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-700">Your Projects</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((id) => (
            <div
              key={id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:shadow-lg transition"
            >
              <h3 className="mb-2 text-lg font-bold text-blue-700">Project {id}</h3>
              <p className="mb-4 text-gray-600">
                This is a sample project description. Track tasks, deadlines, and team members.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>3 Tasks</span>
                <span>Due: 2024-07-01</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
