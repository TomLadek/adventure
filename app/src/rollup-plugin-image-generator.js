import fs from "fs";

export default function imageGenerator(options = {}) {
  return {
    name: "image-generator",
    moduleParsed: (moduleInfo) => {
      if (/slides\.json$/.test(moduleInfo.id)) {
        const slidesData = JSON.parse(fs.readFileSync(new URL(moduleInfo.id, import.meta.url)));
        const mainImgs = [];
        const galleryImages = {
          row: [],
          grid: []
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

        for (let mainImg of mainImgs) {
          try {
            console.log(mainImg, fs.accessSync(`/adventure/src/assets/data/img/${mainImg}.jpg`) || "true");
          } catch (ex) {
            console.log(mainImg, "false");
          }
        }
      }
    }
  }
}