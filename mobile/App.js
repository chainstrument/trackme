import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { initDatabase } from './lib/db';
import { registerDeviceWithBackend, registerForPushNotificationsAsync } from './lib/pushNotifications';
import TodayScreen from './screens/TodayScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [pushToken, setPushToken] = useState(null);
  const [pushError, setPushError] = useState(null);
  const notificationListener = useRef();

  useEffect(() => {
    initDatabase().catch((error) => console.error('SQLite init failed:', error));

    registerForPushNotificationsAsync().then(({ token, error }) => {
      setPushToken(token);
      setPushError(error);
      if (token) {
        registerDeviceWithBackend(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Today" options={{ title: 'Aujourd’hui' }}>
          {() => <TodayScreen pushToken={pushToken} pushError={pushError} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
