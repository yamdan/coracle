import {BUILTIN_CONTEXTS} from "./contexts"
import BUILTIN_DIDDOCS from "./didDocs.json"
import {customDocumentLoader} from "./documentLoader"
import {verifyEmbeddedVP, verifyRemoteVP, verifyVP} from "./verify"
import type {VerifiedVP} from "./types/VCVP"

const DOMAIN_FOR_PPID = "nostr.com"

export {
  BUILTIN_CONTEXTS,
  BUILTIN_DIDDOCS,
  customDocumentLoader,
  DOMAIN_FOR_PPID,
  verifyEmbeddedVP,
  verifyRemoteVP,
  verifyVP,
}

export type {VerifiedVP}
