import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  component: HomePage,
})

function HomePage() {
    
  return (
      <div className="px-4">
      </div>
  )
}
