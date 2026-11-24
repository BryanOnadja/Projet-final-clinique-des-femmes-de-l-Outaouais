// État global : la liste des appels actifs et les filtres du tableau.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import appelsService from '../services/appelsService'

export const FILTRES_VIDES = { statut: '', service: '', langue: '', q: '' }

// Charge la liste avec les filtres actuels
export const fetchAppels = createAsyncThunk('appels/fetchAppels', async (_, { getState }) =>
  appelsService.lister(getState().appels.filtres),
)

const appelsSlice = createSlice({
  name: 'appels',
  initialState: {
    items: [],
    filtres: FILTRES_VIDES,
    status: 'idle', // idle | loading | succeeded | failed
    erreur: null,
  },
  reducers: {
    filtreModifie(state, action) {
      const { cle, valeur } = action.payload
      state.filtres[cle] = valeur
    },
    filtresEffaces(state) {
      state.filtres = FILTRES_VIDES
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppels.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAppels.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAppels.rejected, (state, action) => {
        state.status = 'failed'
        state.erreur = action.error.message
      })
  },
})

export const { filtreModifie, filtresEffaces } = appelsSlice.actions
export default appelsSlice.reducer
