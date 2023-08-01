export const isCmsView = process.env.NODE_ENV === 'development';

export const resourcePath = import.meta.env.VITE_RESOURCE_PATH || "";

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, source) {
  let output = Object.assign({}, target);

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {

      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

export function pad(str) {
  while (String(str).length < 2)
    str = "0" + str;

  return str;
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function closest(elem, className) {
  if (elem.classList && elem.classList.contains(className))
    return elem;

  if (elem.parentElement === null)
    return null;

  return closest(elem.parentElement, className);
}

export function setCookie(name, value) {
  const cookieExpireDate = new Date();
  cookieExpireDate.setFullYear(cookieExpireDate.getFullYear() + 1);

  document.cookie = `${name}=${value}; Expires=${cookieExpireDate}; SameSite=Lax; Secure`;
}