export class CodedError<TCode extends string = string> extends Error {
  public constructor(public readonly code: TCode) {
    super(code);

    this.name = 'CodedError';
  }
}
