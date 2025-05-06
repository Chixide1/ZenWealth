/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_ASPNETCORE_URLS: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}