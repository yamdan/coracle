import * as jsonld from "jsonld"
import type {JsonLdDocument} from "./types/jsonld"
import {verifyProof} from "@zkp-ld/jsonld-proofs"
import type {VCMetadata, VPMetadata, VerifiedVP} from "./types/VCVP"
import type {RemoteDocument} from "./types/jsonld/jsonld-spec"
import {exampleSnarkVerifyingKeys} from "./snarkVerifyingKeys"
import {BUILTIN_CONTEXTS, BUILTIN_DIDDOCS, customDocumentLoader} from "."

const BBS_BOUND = "bbs-termwise-bound-signature-2023"
const BBS_UNBOUND = "bbs-termwise-signature-2023"
// JSON-LD keywords
const GRAPH = "@graph"
const ID = "@id"
const VALUE = "@value"
// RDF Vocabularies
const CREDS = "https://www.w3.org/2018/credentials#"
const CREDS_ISSUER = `${CREDS}issuer`
const CREDS_VC = `${CREDS}verifiableCredential`
const CREDS_HOLDER = `${CREDS}holder`
const CREDS_ISSUANCE_DATE = `${CREDS}issuanceDate`
const CREDS_EXPIRATION_DATE = `${CREDS}expirationDate`
const CREDS_CREDENTIAL_SUBJECT = `${CREDS}credentialSubject`
const SECURITY = "https://w3id.org/security#"
const SECURITY_PROOF = `${SECURITY}proof`
const SECURITY_DOMAIN = `${SECURITY}domain`
const SECURITY_CHALLENGE = `${SECURITY}challenge`
const SECURITY_CRYPTOSUITE = `${SECURITY}cryptosuite`
const DCTERMS = "http://purl.org/dc/terms/"
const DCTERMS_CREATED = `${DCTERMS}created`

const PPID = "https://zkp-ld.org/.well-known/genid/"

// TBD
const didDocs = BUILTIN_DIDDOCS
const jsonldContexts = BUILTIN_CONTEXTS
const documentLoader = customDocumentLoader(jsonldContexts)

export const verifyRemoteVP = async (vpLink: string, pubkey: string) => {
  try {
    if (vpLink) {
      const response = await fetch(vpLink)
      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const vp = await response.json()
      if (vp) {
        const verified = await verifyVP(vp, didDocs, documentLoader, {challenge: pubkey})

        return verified
      }
    }
  } catch (error) {
    console.error("Error verifying profile:", error)
  }

  return undefined
}

export const verifyVP = async (
  vp: JsonLdDocument,
  didDocs: JsonLdDocument,
  documentLoader: (url: string) => Promise<RemoteDocument>,
  options: {challenge?: string; domain?: string} = {},
): Promise<VerifiedVP> => {
  try {
    const extendedVP: any = await jsonld.expand(vp, {documentLoader, safe: true})
    const vpMetadata = getVPmetadata(extendedVP)
    const result = await verifyProof(vp, didDocs, documentLoader, {
      challenge: options.challenge ?? vpMetadata.challenge,
      domain: options.domain ?? vpMetadata.domain,
      snarkVerifyingKeys: exampleSnarkVerifyingKeys,
    })

    return {
      vp,
      metadata: vpMetadata,
      result: result.verified,
      error: result.error,
    }
  } catch (e: any) {
    console.error(e)

    return {
      vp,
      result: false,
      error: e.message,
    }
  }
}

// get metadata from VC
const getVCmetadata = (vc: any): VCMetadata => ({
  issuer: getIssuer(vc),
  issuanceDate: getIssuanceDate(vc),
  expirationDate: getExpirationDate(vc),
  credentialSubject: getCredentialSubject(vc),
})

const getIssuer = (vc: any): string | undefined => vc?.[0]?.[CREDS_ISSUER]?.[0]?.[ID]

const getIssuanceDate = (vc: any): string | undefined =>
  vc?.[0]?.[CREDS_ISSUANCE_DATE]?.[0]?.[VALUE]

const getExpirationDate = (vc: any): string | undefined =>
  vc?.[0]?.[CREDS_EXPIRATION_DATE]?.[0]?.[VALUE]

const getCredentialSubject = (vc: any): string | undefined => vc?.[0]?.[CREDS_CREDENTIAL_SUBJECT]

// get metadata from VP
const getVPmetadata = (vp: any): VPMetadata => ({
  domain: getDomain(vp),
  challenge: getChallenge(vp),
  holder: getHolder(vp),
  created: getCreated(vp),
  ...getVCs(vp),
})

const getDomain = (vp: any): string | undefined =>
  vp?.[0]?.[SECURITY_PROOF]?.[0]?.[GRAPH]?.[0]?.[SECURITY_DOMAIN]?.[0]?.[VALUE]

const getChallenge = (vp: any): string | undefined =>
  vp?.[0]?.[SECURITY_PROOF]?.[0]?.[GRAPH]?.[0]?.[SECURITY_CHALLENGE]?.[0]?.[VALUE]

const getHolder = (vp: any): string | undefined => {
  const holderWithPrefix = vp?.[0]?.[CREDS_HOLDER]?.[0]?.[ID]

  return holderWithPrefix?.replace(PPID, "ppid:")
}

const getCreated = (vp: any): string | undefined =>
  vp?.[0]?.[SECURITY_PROOF]?.[0]?.[GRAPH]?.[0]?.[DCTERMS_CREATED]?.[0]?.[VALUE]

const getVCs = (vp: any) => {
  const vcGraphs = vp?.[0]?.[CREDS_VC]
  const vcs = vcGraphs?.map((vpGraph: any) => vpGraph?.[GRAPH])

  const boundVCs = vcs
    ?.filter((vc: any) => getProofCryptosuite(vc) === BBS_BOUND)
    .map(getVCmetadata)
  const unboundVCs = vcs
    ?.filter((vc: any) => getProofCryptosuite(vc) === BBS_UNBOUND)
    .map(getVCmetadata)

  return {boundVCs, unboundVCs}
}

const getProofCryptosuite = (vc: any) =>
  vc?.[0]?.[SECURITY_PROOF]?.[0]?.[GRAPH]?.[0]?.[SECURITY_CRYPTOSUITE]?.[0]?.[VALUE]
