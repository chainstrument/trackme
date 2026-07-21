const devices = [];

function listDevices() {
  return devices;
}

function registerDevice(payload) {
  const token = payload.token;
  const existing = devices.find((device) => device.token === token);
  if (existing) {
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
  const device = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    token,
    platform: payload.platform || 'unknown',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  devices.push(device);
  return device;
}

export { listDevices, registerDevice };
