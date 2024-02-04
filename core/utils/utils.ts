import CryptoJS from "crypto-js";
export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function encryptData(data: string, key: string) {
  const dataEncrypt = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key
  ).toString();

  return dataEncrypt;
}

export function decryptData(data: string, key: string) {
  const bytes = CryptoJS.AES.decrypt(data, key);
  try {
    if (!bytes.toString()) {
      return null;
    }

    JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

  return decryptedData;
}
