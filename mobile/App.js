import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { listAlertRules } from './lib/alertRulesRepository';
import { initDatabase } from './lib/db';
import { ensureNotificationPermission, syncScheduledNotifications } from './lib/localNotifications';
import TodayScreen from './screens/TodayScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [notificationsGranted, setNotificationsGranted] = useState(null);
  const notificationListener = useRef();

  useEffect(() => {
    ensureNotificationPermission().then(setNotificationsGranted);

    initDatabase()
      .then(() => listAlertRules())
      .then((rules) => syncScheduledNotifications(rules))
      .catch((error) => console.error('SQLite init / notification sync failed:', error));

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
          {() => <TodayScreen notificationsGranted={notificationsGranted} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
