const encode = (str: string): string => {
  return str
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
};

export const getStringChecksum = (str: string): string => {
  let chk = encode(str);
  const len = chk.length;

  let nSum = 0;
  let isSecond = false;
  for (let i = len - 1; i >= 0; i--) {
    let d = chk.charCodeAt(i) - "0".charCodeAt(0);

    if (isSecond) {
      d *= 2;
    }

    nSum += parseInt(d / 10, 10);
  }
  for (let i = 0; i < len; i++) {
    chk += (str.charCodeAt(i) * (i + 1));
  }

  return ()
};
