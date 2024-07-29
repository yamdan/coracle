import type { JsonLdDocument } from './jsonld';

export interface VCMetadata {
  issuer?: string;
  issuanceDate?: string;
  expirationDate?: string;
  subject?: any;
}

export interface VPMetadata {
  holder?: string;
  created?: string;
  domain?: string;
  challenge?: string;
  boundVCs?: VCMetadata[];
  unboundVCs?: VCMetadata[];
}

export interface VerifiedVP {
  result: boolean;
  vp: JsonLdDocument;
  metadata?: VPMetadata;
  error?: unknown;
}
