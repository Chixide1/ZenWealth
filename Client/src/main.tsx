import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './main.css'
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import Loading from './components/shared/Loading'
import { Provider } from 'jotai'
import { queryClientAtom } from 'jotai-tanstack-query'
import { useHydrateAtoms } from 'jotai/utils'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'

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

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
            gcTime: 1000 * 60 * 60 * 12, // 12 hours
        },
        
    },
})

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})

const HydrateAtoms = ({ children }: any) => {
    useHydrateAtoms([[queryClientAtom, queryClient]] as any)
    return children
}

root.render(
    <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
            persister,
            maxAge: 1000 * 60 * 60 * 12,
    }}
    >
        <Provider>
            <HydrateAtoms>
                <RouterProvider router={router} />
            </HydrateAtoms>
        </Provider>
    </PersistQueryClientProvider>
)

