import fs from "fs";
import path from "path";
import gm from "gm";

const sizes = {
  "main": {"widths": [576, 768, 992, 1200, 1400, 1600, 1920, 2200]},
  "gallery1": {"heights": [96, 192, 288]}
}

export default function imageGenerator(options = {}) {
  return {
    name: "image-generator",
    moduleParsed: (moduleInfo) => {
      if (/slides\.json$/.test(moduleInfo.id)) {
        const imgBasePath = path.resolve(path.dirname(moduleInfo.id), "img"),
          existingImages = fs.readdirSync(imgBasePath).reduce((prev, curr) => { prev[curr] = true; return prev }, {}),
          slidesData = JSON.parse(fs.readFileSync(new URL(moduleInfo.id, import.meta.url))),
          mainImgs = [],
          galleryImages = {
            row: [],
            grid: []
          }

        function scaleImages(images, sizes) {
          const mode = sizes.widths ? "widths" : "heights";

          for (let image of images) {
            const imgName = `${image}.jpg`,
                imgPath = `${imgBasePath}/${imgName}`;

            if (existingImages[imgName] >= 0) {
              for (let imgWidthOrHeight of sizes[mode]) {
                const sizeSuffix = mode === "widths" ? `${imgWidthOrHeight}x0` : `0x${imgWidthOrHeight}`;
                const scaledImg = `${image}_${sizeSuffix}.webp`;

                if (!existingImages[scaledImg]) {
                  const magick = gm(imgPath);

                  if (mode === "widths")
                    magick.resize(imgWidthOrHeight);
                  else
                    magick.resize(null, imgWidthOrHeight);

                  magick
                    .autoOrient()
                    .filter("Catrom")
                    .unsharp(0, 0.62, 0.71, 0.01)
                    .define("webp:method=6")
                    .quality(36)
                    .noProfile()
                    .write(`${imgBasePath}/${scaledImg}`, function (err) {
                      if (err)
                        console.log(err);
                    });
                }
              }
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

        console.log({
          mainImgs: mainImgs,
          galleryImages: galleryImages
        });

        scaleImages(mainImgs, sizes.main);
        scaleImages(galleryImages.row, sizes.gallery1);
        scaleImages(galleryImages.grid, sizes.gallery1);
      }
    }
  }
}