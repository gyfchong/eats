import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/meal-plans/new')({
  component: () => <Outlet />,
})
