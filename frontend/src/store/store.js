// Le store Redux : l'état global de l'application.
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import appelsReducer from './appelsSlice'
import configurationReducer from './configurationSlice'

export const reducer = {
  auth: authReducer,
  appels: appelsReducer,
  configuration: configurationReducer,
}

// Fonction utilisée aussi par les tests, pour avoir un store neuf à chaque test
export const creerStore = (preloadedState) => configureStore({ reducer, preloadedState })

export const store = creerStore()
