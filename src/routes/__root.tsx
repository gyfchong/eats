import { useState } from 'react'
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ChefHat, Utensils, Menu, X } from 'lucide-react'

import ConvexProvider from '../integrations/convex/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const router = useRouterState()
  const isIndexPage = router.location.pathname === '/'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <ConvexProvider>
        <div className="min-h-screen flex flex-col">
          {!isIndexPage && (
            <nav className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
              <div className="container mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between gap-4 sm:gap-8">
                <Link to="/" className="font-display text-xl sm:text-2xl tracking-tight">
                  Eats.
                </Link>

                {/* Desktop navigation */}
                <div className="hidden sm:flex items-center gap-6">
                  <Link
                    to="/recipes"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    activeProps={{
                      className: 'text-primary font-semibold',
                    }}
                  >
                    <ChefHat className="size-4" />
                    Recipes
                  </Link>
                  <Link
                    to="/restaurants"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    activeProps={{
                      className: 'text-primary font-semibold',
                    }}
                  >
                    <Utensils className="size-4" />
                    Restaurants
                  </Link>
                </div>

                {/* Mobile menu button */}
                <button
                  className="sm:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
              </div>

              {/* Mobile menu overlay */}
              {mobileMenuOpen && (
                <div
                  className="sm:hidden fixed inset-0 top-[57px] bg-background/95 backdrop-blur-sm z-30"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex flex-col p-4 gap-2 animate-fade-up">
                    <Link
                      to="/recipes"
                      className="flex items-center gap-3 p-4 rounded-xl text-lg bg-card border border-border/50 text-muted-foreground hover:text-primary transition-colors"
                      activeProps={{
                        className: 'text-primary font-semibold bg-primary/5 border-primary/20',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ChefHat className="size-5" />
                      Recipes
                    </Link>
                    <Link
                      to="/restaurants"
                      className="flex items-center gap-3 p-4 rounded-xl text-lg bg-card border border-border/50 text-muted-foreground hover:text-primary transition-colors"
                      activeProps={{
                        className: 'text-primary font-semibold bg-primary/5 border-primary/20',
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Utensils className="size-5" />
                      Restaurants
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          )}
          <main className={isIndexPage ? '' : 'flex-1'}>
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
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
