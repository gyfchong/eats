import {
  Outlet,
  Link,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ChefHat, Utensils } from 'lucide-react'

import ConvexProvider from '../integrations/convex/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ConvexProvider>
        <div className="min-h-screen flex flex-col">
          <nav className="border-b bg-white">
            <div className="container mx-auto px-8 py-4 flex items-center gap-8">
              <Link to="/" className="font-bold text-xl">
                Eats
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  to="/recipes"
                  className="flex items-center gap-2 hover:text-blue-600"
                  activeProps={{
                    className: 'text-blue-600 font-semibold',
                  }}
                >
                  <ChefHat className="size-4" />
                  Recipes
                </Link>
                <Link
                  to="/restaurants"
                  className="flex items-center gap-2 hover:text-blue-600"
                  activeProps={{
                    className: 'text-blue-600 font-semibold',
                  }}
                >
                  <Utensils className="size-4" />
                  Restaurants
                </Link>
              </div>
            </div>
          </nav>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      </ConvexProvider>
    </>
  ),
})
