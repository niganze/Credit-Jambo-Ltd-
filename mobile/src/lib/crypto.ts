import CryptoJS from 'crypto-js';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA512(password).toString();
};

export const generateToken = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};
