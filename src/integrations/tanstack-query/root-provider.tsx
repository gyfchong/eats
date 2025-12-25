import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { convexQueryClient } from '~/integrations/convex/provider'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        staleTime: Infinity, // Convex queries are never stale - they update reactively
      },
    },
  })
  convexQueryClient.connect(queryClient)
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
