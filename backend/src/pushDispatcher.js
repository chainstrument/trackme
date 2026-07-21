import { listDevices } from './deviceStore.js';
import { sendPushNotification } from './pushService.js';

async function dispatchAlerts(triggeredAlerts) {
  if (!triggeredAlerts.length) {
    return [];
  }
  const devices = listDevices();
  const deliveries = [];
  for (const alert of triggeredAlerts) {
    for (const device of devices) {
      deliveries.push(
        sendPushNotification({ to: device.token, title: 'TrackMe', body: alert.message }).catch((error) => ({
          error: error.message,
          token: device.token
        }))
      );
    }
  }
  return Promise.all(deliveries);
}

export { dispatchAlerts };
