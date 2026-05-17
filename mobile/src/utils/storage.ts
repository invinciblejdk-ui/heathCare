import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@healthcare_token';
const USER_KEY  = '@healthcare_user';

export const saveToken = (token: string) =>
  AsyncStorage.setItem(TOKEN_KEY, token);

export const getToken = () =>
  AsyncStorage.getItem(TOKEN_KEY);

export const removeToken = () =>
  AsyncStorage.removeItem(TOKEN_KEY);

export const saveUser = (data: object) =>
  AsyncStorage.setItem(USER_KEY, JSON.stringify(data));

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const clearAll = () =>
  AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
