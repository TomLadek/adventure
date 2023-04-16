import { readFile } from "node:fs/promises";

export default function cmsBuildTransformer(isCmsView) {
  return {
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