import { readFile, cp, access, mkdir } from "node:fs/promises";
import path from "node:path";

export default function cmsBuildTransformer(isCmsView, resourcePath) {
  return {
    async buildStart() {
      const relativeResourcePath = resourcePath.replace(/^\//, ""),
            appResourcePath = path.resolve(".", relativeResourcePath),
            publicResourcePath = path.resolve("public", relativeResourcePath)

      async function dirExists(dir) {
        try {
          await access(dir)
          return true
        } catch (ex) {
          return false
        }
      }

      // Create directory passed in RESOURCE_PATH in app root
      if (!await dirExists(appResourcePath)) {
        console.log(`creating ${appResourcePath}`)
        await mkdir(appResourcePath, { recursive: true })
      } else {
        // console.log(`${appResourcePath} already exists`)
      }

      // Create directory passed in RESOURCE_PATH in /adventure/public and copy /adventure/src/assets/fonts and /adventure/src/assets/favicon.ico there
      if (!await dirExists(publicResourcePath)) {
        console.log(`creating ${publicResourcePath}`)
        await cp(path.resolve("src/assets/fonts"), path.resolve(publicResourcePath, "fonts"), { recursive: true })
        await cp(path.resolve("src/assets/favicon.ico"), path.resolve(publicResourcePath, "favicon.ico"))
      } else {
        // console.log(`${publicResourcePath} already exists`)
      }
    },
    async load(id) {
      if (isCmsView || !/adventure\/(src|pages|renderer|server|database)/.test(id))
        return null

      // console.log(id)

      if (/.*\/cms.*?\.vue(\?.*)?/i.test(id)) {
        // console.log(`cms vue file found, returning empty (${id})`)
        return '<template></template>'
      }

      const res = await readFile(id.replace(/\?.*/, ""), 'utf8');

      return res
              .replace(/\/\* CMS \*\/[\s\S]*?\/\* \/CMS \*\//g, "")
              .replace(/<!-- CMS -->[\s\S]*?<!-- \/CMS -->/g, "")
    }
  }
}