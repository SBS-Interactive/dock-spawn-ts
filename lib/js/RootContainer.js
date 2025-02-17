export class RootContainer {
    dockManager;
    containerElement;
    rootElement;
    _leftTabs;
    _rightTabs;
    _bottomTabs;
    constructor(dockManager) {
        this.dockManager = dockManager;
        this.rootElement = document.createElement('div');
        this.rootElement.classList.add('dockspawn-root-element');
        this._leftTabs = document.createElement('div');
        this._rightTabs = document.createElement('div');
        this._bottomTabs = document.createElement('div');
        this._bottomTabs.classList.add('dockspawn-bottom-pins-tab-container');
        this.containerElement = document.createElement('div');
        const mainRow = document.createElement('div');
        mainRow.classList.add('dockspawn-vertical-pins-row');
        mainRow.append(this._leftTabs, this.containerElement, this._rightTabs);
        this.rootElement.append(mainRow, this._bottomTabs);
        this.dockManager.element.append(this.rootElement);
    }
    resize(width, height) {
        this.rootElement.style.width = width + 'px';
        this.rootElement.style.height = height + 'px';
        this._bottomTabs.style.width = width + 'px';
        this._bottomTabs.style.height = '25px';
        const contentWidth = width;
        const contentHeight = height - 25;
        this.containerElement.style.width = contentWidth + 'px';
        this.containerElement.style.height = contentHeight + 'px';
        this.dockManager.context.model.rootNode.container.resize(contentWidth, contentHeight);
    }
    performLayout(children, relayoutEvenIfEqual) {
        throw new Error("Method not implemented.");
    }
    destroy() {
        throw new Error("Method not implemented.");
    }
    setActiveChild(child) {
        throw new Error("Method not implemented.");
    }
    saveState(state) {
        throw new Error("Method not implemented.");
    }
    loadState(state) {
        throw new Error("Method not implemented.");
    }
    get width() {
        return 0;
    }
    get height() {
        return 0;
    }
}
//# sourceMappingURL=RootContainer.js.map