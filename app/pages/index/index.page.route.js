import { isCmsView } from "../../utils/utils.js"

export default isCmsView
   ? "/"
   : () => false