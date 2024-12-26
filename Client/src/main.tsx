import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './main.css'
import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import Loading from './components/shared/Loading'

// Set up a Router instance
const router = createRouter({
    defaultPendingComponent: Loading,
    routeTree,
    defaultPreload: 'intent',
    defaultStaleTime: 5000,
})

// Register things for typesafety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const rootElement = document.getElementById('root')!
const root = ReactDOM.createRoot(rootElement)

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            gcTime: 2 * 60 * 60 * 1000, // 2 hour
        },
    },
    
})

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})

// Persist the cache
persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 2000, // 2 hours
})

root.render(
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
)
