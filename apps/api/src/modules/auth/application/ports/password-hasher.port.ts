export interface PasswordHasherPort {
  hash(value: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
