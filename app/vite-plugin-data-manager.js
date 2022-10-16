import fs from "fs";
import { fileURLToPath, URL } from "node:url";

export default function dataManager(options = {}) {
  return {
    name: "dataManager",
    config() {
      // Reads the slides data from ./src/assets/data/slides.json to get to the base path setting.
      // If the file (or the directory) doesn't exist, sample data is copied from ./sample_data to
      // ./src/assets/data/, including the slides.json file.
      const dataDirPath = fileURLToPath(new URL("./src/assets/data", import.meta.url)),
        samplePath = fileURLToPath(new URL("./sample_data", import.meta.url)),
        sampleImgPath = `${samplePath}/img`;
      
      if (!fs.existsSync(dataDirPath))
      fs.mkdirSync(dataDirPath);
      
      if (!fs.existsSync(`${dataDirPath}/img`))
      fs.mkdirSync(`${dataDirPath}/img`);
      
      const dataDir = fs.readdirSync(new URL(dataDirPath, import.meta.url));
      
      if (!dataDir.includes("slides.json")) {
        fs.copyFileSync(`${samplePath}/slides.json`, `${dataDirPath}/slides.json`);
        
        for (let img of fs.readdirSync(new URL(sampleImgPath, import.meta.url))) {
          const copiedImgPath = `${dataDirPath}/img/${img}`;
          
          fs.copyFileSync(`${sampleImgPath}/${img}`, copiedImgPath);
        }
      }

      const slidesData = JSON.parse(fs.readFileSync(`${dataDirPath}/slides.json`, "UTF-8"));

      if (slidesData && slidesData.meta && slidesData.meta.basePath)
        return { base: slidesData.meta.basePath };
    }
  }
}