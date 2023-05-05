export function useImageLoader() {
  function loadImage(imgFile) {
    const fileTypeMatch = imgFile.type.match(/^image\/(?<imgFileType>jpeg|png|gif)$/);

    if (!fileTypeMatch) {
      const errMsg = `invalid file type: ${imgFile.type}`;
      console.error(errMsg);
      alert(errMsg);
      return;
    }

    return new Promise(resolve => {
      const reader = new FileReader();
      
      reader.addEventListener("load", () => {
        const img = new Image();
    
        img.addEventListener("load", () => {
          // console.log("loaded image", { width: img.width, height: img.height, type: fileTypeMatch.groups.imgFileType, fileName: imgFile.name });
          resolve({
            imgFile: imgFile,
            imgType: fileTypeMatch.groups.imgFileType,
            imgWidth: img.width,
            imgHeight: img.height
          });
        });

        img.src = reader.result;
      });

      reader.readAsDataURL(imgFile);
    });
  }

  return { loadImage }
}