import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

export const initializeNotifications = async () => {
  try {
    // Request permission for push notifications
    const result = await PushNotifications.requestPermissions();
    
    if (result.receive === 'granted') {
      await PushNotifications.register();
    }
    
    // Request permission for local notifications
    await LocalNotifications.requestPermissions();
    
    // Listen for push notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  type: 'success' | 'warning' | 'info' = 'info'
) => {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: { type }
        }
      ]
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export const notifyDeposit = async (amount: number) => {
  await sendLocalNotification(
    'Deposit Confirmed',
    `RWF ${amount.toLocaleString()} has been added to your account`,
    'success'
  );
};

export const notifyWithdrawal = async (amount: number) => {
  await sendLocalNotification(
    'Withdrawal Alert',
    `RWF ${amount.toLocaleString()} has been withdrawn from your account`,
    'warning'
  );
};

export const notifyLowBalance = async (balance: number) => {
  await sendLocalNotification(
    'Low Balance Warning',
    `Your account balance is low: RWF ${balance.toLocaleString()}`,
    'warning'
  );
};

export const notifyVerification = async (status: 'approved' | 'pending') => {
  if (status === 'approved') {
    await sendLocalNotification(
      'Device Verified',
      'Your device has been verified. You can now access all features.',
      'success'
    );
  } else {
    await sendLocalNotification(
      'Verification Pending',
      'Your account is pending verification. Please wait for admin approval.',
      'info'
    );
  }
};

export const notifyLogin = async () => {
  await sendLocalNotification(
    'Login Successful',
    'You have successfully logged in to your account',
    'success'
  );
};
