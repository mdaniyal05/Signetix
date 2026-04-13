class SignetixException {
  constructor(status, message) {
    this.status = status;
    this.message = message;
  }

  loadResult() {
    return { StatusCode: this.status, Message: this.message };
  }
}

module.exports = SignetixException;
