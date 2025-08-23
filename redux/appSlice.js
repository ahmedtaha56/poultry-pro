import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    loadedProfiles: {},
    firstAppLaunch: true,
    profileLoadedOnce: false, // <-- Add this line
  },
  reducers: {
    markProfileAsLoaded: (state, action) => {
      const userId = action.payload;
      state.loadedProfiles[userId] = true;
      
      // Also persist to AsyncStorage for cross-session persistence
      AsyncStorage.setItem('loadedProfiles', JSON.stringify(state.loadedProfiles));
    },
    setFirstAppLaunch: (state, action) => {
      state.firstAppLaunch = action.payload;
    },
    loadPersistedProfiles: (state, action) => {
      state.loadedProfiles = action.payload;
    },
    setProfileLoadedOnce: (state, action) => {
      state.profileLoadedOnce = action.payload;
    },
  },
});

export const { markProfileAsLoaded, setFirstAppLaunch, loadPersistedProfiles, setProfileLoadedOnce } = appSlice.actions;

// Async action to load persisted profiles from AsyncStorage
export const loadPersistedProfilesAsync = () => async (dispatch) => {
  try {
    const stored = await AsyncStorage.getItem('loadedProfiles');
    if (stored) {
      const loadedProfiles = JSON.parse(stored);
      dispatch(loadPersistedProfiles(loadedProfiles));
    }
  } catch (error) {
    console.error('Error loading persisted profiles:', error);
  }
};

export default appSlice.reducer;
