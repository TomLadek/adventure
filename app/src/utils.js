export function getCaptionText(captionHtml) {
  if (!captionHtml || typeof document !== "object")
    return null;

  const dummy = document.createElement("span");

  dummy.innerHTML = captionHtml;

  return dummy.textContent;
}

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
  
export default function mergeDeep(target, source) {
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