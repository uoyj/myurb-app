import { StyleSheet } from 'react-native';
import 'expo-router/entry';

// NativeWind v4 requires dark mode to be set as 'class' for web
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(StyleSheet as any).setFlag?.('darkMode', 'class');
