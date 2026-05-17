import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import OtpScreen   from './src/screens/OtpScreen';
import HomeScreen  from './src/screens/HomeScreen';
import { getToken } from './src/utils/storage';

export type RootStackParamList = {
  Login: undefined;
  Otp:   { identifier: string; mode: 'mobile' | 'email' };
  Home:  undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setInitialRoute(token ? 'Home' : 'Login');
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#065F46' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Otp"   component={OtpScreen}   />
        <Stack.Screen name="Home"  component={HomeScreen}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
