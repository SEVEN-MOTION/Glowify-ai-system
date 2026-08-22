export class ExtensionContractError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'ExtensionContractError'
    this.code = code
  }
}
