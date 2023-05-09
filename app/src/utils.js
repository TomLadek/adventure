export const isCmsView = process.env.NODE_ENV === 'development';

export function getCaptionText(captionHtml) {
  if (!captionHtml)
    return null
  
  if (typeof document !== "object")
    return captionHtml;

  const dummy = document.createElement("div");

  dummy.innerHTML = captionHtml;

  return dummy.textContent;
}

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