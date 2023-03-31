import { isCmsView } from "../../src/utils.js"

export default isCmsView
   ? "/"
   : () => false