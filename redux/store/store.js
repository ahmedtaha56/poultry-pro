import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import profileReducer from '../profileslice/profileSlice';
import appReducer from '../appSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

// Create persisted reducers
const persistedProfileReducer = persistReducer(persistConfig, profileReducer);
const persistedAppReducer = persistReducer(persistConfig, appReducer);

// Configure the store
export const store = configureStore({
  reducer: {
    profile: persistedProfileReducer, // Persist profile reducer
    app: persistedAppReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }),
});

// Create the persistor
export const persistor = persistStore(store);
