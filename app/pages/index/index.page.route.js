import { isCmsView } from "../../src/utils"

export default isCmsView
   ? "/"
   : () => false