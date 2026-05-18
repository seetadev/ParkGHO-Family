import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import * as dagCBOR from "@ipld/dag-cbor";
import { base58btc } from "multiformats/bases/base58";
import type { AgentIdentity, TaskNode, ExecutionLog } from "../schemas/index";

export async function encode<T extends Record<string, unknown>>(data: T): Promise<{ cid: CID; bytes: Uint8Array }> {
  const bytes = dagCBOR.encode(data);
  const hash  = await sha256.digest(bytes);
  const cid   = CID.createV1(dagCBOR.code, hash);
  return { cid, bytes };
}

export function decode<T>(bytes: Uint8Array): T {
  return dagCBOR.decode(bytes) as T;
}

export function parseCID(s: string): CID { return CID.parse(s); }
export function cidToString(cid: CID): string { return cid.toString(base58btc); }
export function cidEquals(a: CID, b: CID): boolean { return a.equals(b); }

export async function verifyCID(bytes: Uint8Array, claimed: CID | string): Promise<boolean> {
  const expected = typeof claimed === "string" ? parseCID(claimed) : claimed;
  const hash = await sha256.digest(bytes);
  return CID.createV1(dagCBOR.code, hash).equals(expected);
}

export function encodePublicKey(raw: Uint8Array): string { return base58btc.encode(raw); }
export function decodePublicKey(s: string): Uint8Array { return base58btc.decode(s); }

// Typed encode helpers for agent data structures
export async function encodeAgentIdentity(identity: AgentIdentity): Promise<{ cid: CID; bytes: Uint8Array }> {
  return encode(identity as unknown as Record<string, unknown>);
}

export async function encodeTaskNode(task: TaskNode): Promise<{ cid: CID; bytes: Uint8Array }> {
  return encode(task as unknown as Record<string, unknown>);
}

export async function encodeExecutionLog(log: ExecutionLog): Promise<{ cid: CID; bytes: Uint8Array }> {
  return encode(log as unknown as Record<string, unknown>);
}

export class MemoryBlockStore {
  private store = new Map<string, Uint8Array>();
  async put(cid: CID, bytes: Uint8Array) { this.store.set(cidToString(cid), bytes); }
  async get(cid: CID): Promise<Uint8Array | undefined> { return this.store.get(cidToString(cid)); }
  async has(cid: CID): Promise<boolean> { return this.store.has(cidToString(cid)); }
  size(): number { return this.store.size; }
}
