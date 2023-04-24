import path from "path";
import fs from "fs";
import gm from "gm";

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function pad(str) {
  while (String(str).length < 2)
    str = "0" + str;

  return str;
}

export async function generateScaledImage(originalDir, originalName, targetSize) {
  function getSrcImageExtension(imagesDir, originalDir) {
    // TODO save directory contents and only generate scaled images if they don't already exist
    return fs
            .readdirSync(path.resolve(imagesDir, originalDir))
            .reduce((ext, imgFile) => {
              const match = imgFile.match(new RegExp(`${escapeRegExp(originalName)}\\.(?<imgExt>[a-zA-Z0-9]+)`));

              if (match)
                ext = match.groups.imgExt.toLowerCase();

              return ext;
            }, "") || "jpg";
  }

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
        srcImgExtension = getSrcImageExtension(imagesDir, originalDir),
        srcImgName = originalName,
        srcImgNameWithExtension = `${srcImgName}.${srcImgExtension}`,
        srcImgPath = path.resolve(imagesDir, originalDir, srcImgNameWithExtension),
        { width, height } = parseSize(targetSize),
        sizeSuffix = targetSize,
        scaledImgExtension = /gif|png/.test(srcImgExtension) ? srcImgExtension : "webp",
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