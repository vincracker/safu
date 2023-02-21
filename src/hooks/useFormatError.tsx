export const getTxError = (rawError: any) => {
  const errorString = rawError.toString().replace("MetaMask Tx Signature:", "").trim();

  if (IsJsonString(errorString)) {
    const error = JSON.parse(errorString);
    return error.message || rawError.message;
  }
  return rawError.message;
};

function IsJsonString(str: any) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
