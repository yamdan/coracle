import {BUILTIN_CONTEXTS} from "./contexts"
import BUILTIN_DIDDOCS from "./didDocs.json"
import {customDocumentLoader} from "./documentLoader"
import {verifyRemoteVP, verifyVP} from "./verify"

const DOMAIN_FOR_PPID = "nostr.com"

export {
  BUILTIN_CONTEXTS,
  BUILTIN_DIDDOCS,
  customDocumentLoader,
  DOMAIN_FOR_PPID,
  verifyRemoteVP,
  verifyVP,
}
