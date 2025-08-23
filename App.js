import React from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store/store';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}