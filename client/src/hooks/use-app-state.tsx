// 'use client'

// import type { ReactNode, Dispatch } from 'react'
// import React, { createContext, useReducer, useContext } from 'react'

// // Define types for folder, file, list, and grid actions with name payloads
// type RefreshAction = { type: 'REFRESH_PAGE'; payload: boolean }
// type FolderAction = { type: 'DISPLAY_FOLDER'; payload: string }
// type FileAction = { type: 'DISPLAY_FILE'; payload: string }
// type ListAction = { type: 'DISPLAY_LIST'; payload: string }
// type GridAction = { type: 'DISPLAY_GRID'; payload: string }

// type AppAction =
//   | RefreshAction
//   | FolderAction
//   | FileAction
//   | ListAction
//   | GridAction

// // Define the initial state and reducer
// interface AppState {
//   refresh: boolean
//   folders: string
//   files: string
//   lists: string
//   grids: string
// }

// const initialAppState: AppState = {
//   refresh: false,
//   folders: '',
//   files: '',
//   lists: '',
//   grids: '',
// }

// const appReducer = (state: AppState, action: AppAction): AppState => {
//   switch (action.type) {
//     case 'REFRESH_PAGE':
//       return { ...state, refresh: action.payload }
//     case 'DISPLAY_FOLDER':
//       return { ...state, folders: action.payload }
//     case 'DISPLAY_FILE':
//       return { ...state, files: action.payload }
//     case 'DISPLAY_LIST':
//       return { ...state, lists: action.payload }
//     case 'DISPLAY_GRID':
//       return { ...state, grids: action.payload }
//     default:
//       return state
//   }
// }

// // Create context with types for the state and dispatch
// interface AppStateContextProps {
//   state: AppState
//   dispatch: Dispatch<AppAction>
// }

// const AppStateContext = createContext<AppStateContextProps | undefined>(
//   undefined
// )

// interface AppStateProviderProps {
//   children: ReactNode
// }

// // Create the context provider component
// export const AppStateProvider: React.FC<AppStateProviderProps> = ({
//   children,
// }) => {
//   const [state, dispatch] = useReducer(appReducer, initialAppState)

//   return (
//     <AppStateContext.Provider value={{ state, dispatch }}>
//       {children}
//     </AppStateContext.Provider>
//   )
// }

// // Custom hook to use the AppState context
// export const useAppState = (): AppStateContextProps => {
//   const context = useContext(AppStateContext)

//   if (context === undefined) {
//     throw new Error('useAppState must be used within an AppStateProvider')
//   }

//   return context
// }
