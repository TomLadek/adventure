import fs from "fs";
import path from "path";
import gm from "gm";

export const isCmsView = process.env.NODE_ENV === 'development';

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

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function pad(str) {
  while (str.length < 2)
    str = "0" + str;

  return str;
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

export async function generateScaledImage(originalDir, originalName, targetSize) {
  function parseSize(sizeStr) {
    const allowedSizes = {
            widths: [576, 768, 992, 1200, 1400, 1600, 1920, 2200],
            heights: [96, 192, 288]
          },
          match = sizeStr.match(/^(?<width>\d+)x(?<height>\d+)$/);

    if (!match)
      throw new Error(`invalid size '${targetSize}'`);

    const width = Number(match.groups.width) || null,
          height = Number(match.groups.height) || null;

    if (width === null && allowedSizes.heights.indexOf(height) < 0
         || height === null && allowedSizes.widths.indexOf(width) < 0
         || width !== null && height !== null) {
      throw new Error(`unsupported size '${sizeStr}'`);
    }

    return { width, height };
  }

  const imagesDir = "/adventure/public/img",
        srcImgName = originalName,
        srcImgExtension = "jpg", // TODO find the extension based on the existing file
        srcImgNameWithExtension = `${srcImgName}.${srcImgExtension}`,
        srcImgPath = path.resolve(imagesDir, originalDir, srcImgNameWithExtension),
        { width, height } = parseSize(targetSize),
        sizeSuffix = targetSize,
        scaledImgExtension = /gif|png/i.test(srcImgExtension) ? srcImgExtension : "webp",
        scaledImgNameWithExtension = `${srcImgName}_${sizeSuffix}.${scaledImgExtension}`,
        scaledImgDestPath = path.resolve(imagesDir, originalDir, scaledImgNameWithExtension),
        magick = gm(srcImgPath);

  return await new Promise((resolve, reject) => {
    magick
      .resize(width, height)
      .autoOrient()
      .filter("Catrom")
      .unsharp(0, 0.62, 0.71, 0.01)
      .define("webp:method=6")
      .quality(50)
      .noProfile()
      .write(scaledImgDestPath, (err) => {
        if (err)
          return reject(new Error(err))

        resolve(scaledImgDestPath);
      });
  })
}