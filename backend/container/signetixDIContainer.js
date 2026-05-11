const Container = require("inversify");
const EventDispatcher = require("../events/eventDispatcher.js");

class SignetixDIContainer {
  constructor() {
    this.container = new Container();
    this.bindObjectsToContainer.bind(this);
    this.bindObjectsToContainer();
  }

  bindObjectsToContainer() {
    this.container.bind(EventDispatcher).toSelf().inSingletonScope();
  }
}

module.exports = SignetixDIContainer;
