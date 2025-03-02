//data/protocols/encrypter.ts
export interface Encrypter {
  encrypt(value: string): Promise<string>;
  hash(value: string): Promise<string>;
  compare(value: string, hash: string): Promise<boolean>;
}
