class ErrorHandler extends Error {
  statusCode: Number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;
