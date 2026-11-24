// État global : services et notes rapides, utilisés par plusieurs écrans.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import configurationService from '../services/configurationService'

export const fetchConfiguration = createAsyncThunk('configuration/fetchConfiguration', async () => {
  const [services, notesRapides] = await Promise.all([
    configurationService.listerServices(),
    configurationService.listerNotesRapides(),
  ])
  return { services, notesRapides }
})

const configurationSlice = createSlice({
  name: 'configuration',
  initialState: { services: [], notesRapides: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchConfiguration.fulfilled, (state, action) => {
      state.services = action.payload.services
      state.notesRapides = action.payload.notesRapides
    })
  },
})

export default configurationSlice.reducer
