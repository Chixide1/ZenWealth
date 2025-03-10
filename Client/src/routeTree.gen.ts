/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginImport } from './routes/login'
import { Route as LayoutImport } from './routes/_layout'
import { Route as LayoutIndexImport } from './routes/_layout/index'
import { Route as LayoutTransactionsImport } from './routes/_layout/transactions'
import { Route as LayoutBudgetsImport } from './routes/_layout/budgets'
import { Route as LayoutAnalyticsImport } from './routes/_layout/analytics'
import { Route as LayoutAccountsImport } from './routes/_layout/accounts'

// Create/Update Routes

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const LayoutRoute = LayoutImport.update({
  id: '/_layout',
  getParentRoute: () => rootRoute,
} as any)

const LayoutIndexRoute = LayoutIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutTransactionsRoute = LayoutTransactionsImport.update({
  id: '/transactions',
  path: '/transactions',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutBudgetsRoute = LayoutBudgetsImport.update({
  id: '/budgets',
  path: '/budgets',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutAnalyticsRoute = LayoutAnalyticsImport.update({
  id: '/analytics',
  path: '/analytics',
  getParentRoute: () => LayoutRoute,
} as any)

const LayoutAccountsRoute = LayoutAccountsImport.update({
  id: '/accounts',
  path: '/accounts',
  getParentRoute: () => LayoutRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_layout': {
      id: '/_layout'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof LayoutImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/_layout/accounts': {
      id: '/_layout/accounts'
      path: '/accounts'
      fullPath: '/accounts'
      preLoaderRoute: typeof LayoutAccountsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/analytics': {
      id: '/_layout/analytics'
      path: '/analytics'
      fullPath: '/analytics'
      preLoaderRoute: typeof LayoutAnalyticsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/budgets': {
      id: '/_layout/budgets'
      path: '/budgets'
      fullPath: '/budgets'
      preLoaderRoute: typeof LayoutBudgetsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/transactions': {
      id: '/_layout/transactions'
      path: '/transactions'
      fullPath: '/transactions'
      preLoaderRoute: typeof LayoutTransactionsImport
      parentRoute: typeof LayoutImport
    }
    '/_layout/': {
      id: '/_layout/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof LayoutIndexImport
      parentRoute: typeof LayoutImport
    }
  }
}

// Create and export the route tree

interface LayoutRouteChildren {
  LayoutAccountsRoute: typeof LayoutAccountsRoute
  LayoutAnalyticsRoute: typeof LayoutAnalyticsRoute
  LayoutBudgetsRoute: typeof LayoutBudgetsRoute
  LayoutTransactionsRoute: typeof LayoutTransactionsRoute
  LayoutIndexRoute: typeof LayoutIndexRoute
}

const LayoutRouteChildren: LayoutRouteChildren = {
  LayoutAccountsRoute: LayoutAccountsRoute,
  LayoutAnalyticsRoute: LayoutAnalyticsRoute,
  LayoutBudgetsRoute: LayoutBudgetsRoute,
  LayoutTransactionsRoute: LayoutTransactionsRoute,
  LayoutIndexRoute: LayoutIndexRoute,
}

const LayoutRouteWithChildren =
  LayoutRoute._addFileChildren(LayoutRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof LayoutRouteWithChildren
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/accounts': typeof LayoutAccountsRoute
  '/analytics': typeof LayoutAnalyticsRoute
  '/budgets': typeof LayoutBudgetsRoute
  '/transactions': typeof LayoutTransactionsRoute
  '/': typeof LayoutIndexRoute
}

export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/accounts': typeof LayoutAccountsRoute
  '/analytics': typeof LayoutAnalyticsRoute
  '/budgets': typeof LayoutBudgetsRoute
  '/transactions': typeof LayoutTransactionsRoute
  '/': typeof LayoutIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_layout': typeof LayoutRouteWithChildren
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/_layout/accounts': typeof LayoutAccountsRoute
  '/_layout/analytics': typeof LayoutAnalyticsRoute
  '/_layout/budgets': typeof LayoutBudgetsRoute
  '/_layout/transactions': typeof LayoutTransactionsRoute
  '/_layout/': typeof LayoutIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/login'
    | '/register'
    | '/accounts'
    | '/analytics'
    | '/budgets'
    | '/transactions'
    | '/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/register'
    | '/accounts'
    | '/analytics'
    | '/budgets'
    | '/transactions'
    | '/'
  id:
    | '__root__'
    | '/_layout'
    | '/login'
    | '/register'
    | '/_layout/accounts'
    | '/_layout/analytics'
    | '/_layout/budgets'
    | '/_layout/transactions'
    | '/_layout/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  LayoutRoute: typeof LayoutRouteWithChildren
  LoginRoute: typeof LoginRoute
  RegisterRoute: typeof RegisterRoute
}

const rootRouteChildren: RootRouteChildren = {
  LayoutRoute: LayoutRouteWithChildren,
  LoginRoute: LoginRoute,
  RegisterRoute: RegisterRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_layout",
        "/login",
        "/register"
      ]
    },
    "/_layout": {
      "filePath": "_layout.tsx",
      "children": [
        "/_layout/accounts",
        "/_layout/analytics",
        "/_layout/budgets",
        "/_layout/transactions",
        "/_layout/"
      ]
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/_layout/accounts": {
      "filePath": "_layout/accounts.tsx",
      "parent": "/_layout"
    },
    "/_layout/analytics": {
      "filePath": "_layout/analytics.tsx",
      "parent": "/_layout"
    },
    "/_layout/budgets": {
      "filePath": "_layout/budgets.tsx",
      "parent": "/_layout"
    },
    "/_layout/transactions": {
      "filePath": "_layout/transactions.tsx",
      "parent": "/_layout"
    },
    "/_layout/": {
      "filePath": "_layout/index.tsx",
      "parent": "/_layout"
    }
  }
}
ROUTE_MANIFEST_END */
