import { Device } from '@capacitor/device';

export const getDeviceId = async (): Promise<string> => {
  try {
    const info = await Device.getId();
    return info.identifier || generateFallbackId();
  } catch (error) {
    console.error('Error getting device ID:', error);
    return generateFallbackId();
  }
};

export const getDeviceInfo = async () => {
  try {
    const info = await Device.getInfo();
    return {
      platform: info.platform,
      model: info.model,
      manufacturer: info.manufacturer,
      osVersion: info.osVersion
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
};

const generateFallbackId = (): string => {
  // Generate a unique ID for web testing
  let id = localStorage.getItem('device_id_fallback');
  if (!id) {
    id = 'web_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_id_fallback', id);
  }
  return id;
};
