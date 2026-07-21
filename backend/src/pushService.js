const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

async function sendPushNotification({ to, title, body, data }) {
  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to, title, body, data })
  });
  return response.json();
}

export { sendPushNotification };
