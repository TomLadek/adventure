import fs from "fs";
import path from "path";
import gm from "gm";

const sizes = {
  "main": {"widths": [576, 768, 992, 1200, 1400, 1600, 1920, 2200]},
  "gallery1": {"heights": [96, 192, 288]}
};

export default function imageGenerator(options = {}) {
  let config;

  return {
    name: "image-generator",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    load(id) {
      if (!/slides\.json$/.test(id))
        return;

      const self = this,
        imgBasePath = new URL("../public/img", import.meta.url),
        existingImages = fs.readdirSync(imgBasePath).reduce((prev, curr) => { prev[curr] = true; return prev }, {}),
        slidesData = JSON.parse(fs.readFileSync(new URL(id, import.meta.url))),
        mainImgs = [],
        galleryImages = {
          row: [],
          grid: []
        };

      function scaleImages(images, sizes) {
        const mode = sizes.widths ? "widths" : "heights";

        for (let image of images) {
          const srcImgMatch = image.match(/(.*?)(\.(\w+))?$/),
            srcImgName = srcImgMatch[1],
            srcImgExtension = srcImgMatch[3] || "jpg",
            srcImgNameWithExtension = `${srcImgName}.${srcImgExtension}`,
            srcImgPath = `${imgBasePath}/${srcImgNameWithExtension}`;

          // Skip if the source image doesn't exist
          if (!existingImages[srcImgNameWithExtension])
            continue;

          for (let imgWidthOrHeight of sizes[mode]) {
            const sizeSuffix = mode === "widths" ? `${imgWidthOrHeight}x0` : `0x${imgWidthOrHeight}`,
              scaledImgExtension = srcImgExtension  === "png" ? srcImgExtension : "webp",
              scaledImgNameWithExtension = `${srcImgName}_${sizeSuffix}.${scaledImgExtension}`;

            // Skip if the scaled image already exists
            if (existingImages[scaledImgNameWithExtension])
              continue;

            const scaledImgPath = `${imgBasePath}/${scaledImgNameWithExtension}`,
              magick = gm(srcImgPath);

            if (mode === "widths")
              magick.resize(imgWidthOrHeight);
            else
              magick.resize(null, imgWidthOrHeight);

            magick
              .autoOrient()
              .filter("Catrom")
              .unsharp(0, 0.62, 0.71, 0.01)
              .define("webp:method=6")
              .quality(50)
              .noProfile()
              .toBuffer(function (err, buffer) {
                if (err) {
                  console.error(err);
                } else {
                  if (config.command !== "serve") { // In 'vite dev' build, emitFile is not available
                    self.emitFile({
                      type: "asset",
                      name: scaledImgNameWithExtension,
                      source: buffer
                    });
                  }

                  fs.writeFile(scaledImgPath, buffer, (err) => {
                    if (err)
                      console.error(err);
                  });
                }
              });
          }
        }
      }

      for (let slide of slidesData.slides) {
        if (slide.mainImg && slide.mainImg.src) {
          mainImgs.push(slide.mainImg.src);
        }

        if (slide.gallery) {
          let galleryImagesArray;

          if (slide.gallery.style === "grid")
            galleryImagesArray = galleryImages.grid;
          else
            galleryImagesArray = galleryImages.row;

          for (let image of slide.gallery.images) {
            if (image.src) {
              galleryImagesArray.push(image.src);
            }
          }
        }
      }

      scaleImages(mainImgs, sizes.main);
      scaleImages(galleryImages.row, sizes.gallery1);
      scaleImages(galleryImages.grid, sizes.gallery1);
    }
  }
}