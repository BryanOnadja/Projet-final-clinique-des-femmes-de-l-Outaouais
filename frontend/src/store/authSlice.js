// État global : qui est connectée, et si la connexion temps réel est active.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authService from '../services/authService'

function utilisateurEnregistre() {
  try {
    const texte = sessionStorage.getItem('utilisateur')
    return texte ? JSON.parse(texte) : null
  } catch {
    return null
  }
}

// Connexion : appelle l'API, puis garde la session pour l'onglet (sessionStorage)
export const connexion = createAsyncThunk('auth/connexion', async ({ courriel, motDePasse }) => {
  const { jeton, utilisateur } = await authService.connexion(courriel, motDePasse)
  sessionStorage.setItem('jeton', jeton)
  sessionStorage.setItem('utilisateur', JSON.stringify(utilisateur))
  return utilisateur
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    utilisateur: utilisateurEnregistre(),
    statut: 'idle', // idle | loading | failed
    erreur: null,
    enDirect: false,
  },
  reducers: {
    deconnecte(state) {
      state.utilisateur = null
      state.statut = 'idle'
      state.enDirect = false
    },
    enDirectChange(state, action) {
      state.enDirect = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connexion.pending, (state) => {
        state.statut = 'loading'
        state.erreur = null
      })
      .addCase(connexion.fulfilled, (state, action) => {
        state.statut = 'idle'
        state.utilisateur = action.payload
      })
      .addCase(connexion.rejected, (state, action) => {
        state.statut = 'failed'
        state.erreur = action.error.message
      })
  },
})

export const { deconnecte, enDirectChange } = authSlice.actions

// Déconnexion : on efface la session, puis on met l'état à jour
export const deconnexion = () => (dispatch) => {
  sessionStorage.removeItem('jeton')
  sessionStorage.removeItem('utilisateur')
  dispatch(deconnecte())
}

export default authSlice.reducer
