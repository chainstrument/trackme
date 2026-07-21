import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

function buildTrigger(rule) {
  if (rule.trigger_type === 'interval') {
    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(60, Number(rule.interval_minutes) * 60),
      repeats: true
    };
  }
  const [hour, minute] = (rule.schedule || '09:00').split(':').map(Number);
  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute
  };
}

async function scheduleNotificationForRule(rule) {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'TrackMe', body: rule.message },
    trigger: buildTrigger(rule)
  });
}

async function cancelNotification(notificationId) {
  if (!notificationId) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

async function fireNow(message) {
  return Notifications.scheduleNotificationAsync({
    content: { title: 'TrackMe', body: message },
    trigger: null
  });
}

async function syncScheduledNotifications(rules) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const scheduled = [];
  for (const rule of rules) {
    if (!rule.active) {
      continue;
    }
    const notificationId = await scheduleNotificationForRule(rule);
    scheduled.push({ ruleId: rule.id, notificationId });
  }
  return scheduled;
}

export { cancelNotification, ensureNotificationPermission, fireNow, scheduleNotificationForRule, syncScheduledNotifications };
