import '@/global.css';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Providers } from '@/src/providers';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <StatusBar style="dark" />
        <Slot />
      </Providers>
    </GestureHandlerRootView>
  );
}
