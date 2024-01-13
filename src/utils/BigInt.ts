// Do not know how to serialize a BigInt
// https://github.com/prisma/studio/issues/614
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString()
}

export {}
