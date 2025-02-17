import { Utils } from "./Utils";
export class StickyTabsDockContainer {
    dockManager;
    containerElement;
    containerType;
    name;
    minimumAllowedChildNodes;
    constructor(dockManager) {
        this.dockManager = dockManager;
        this.name = Utils.getNextId('stickypanels_');
        this.minimumAllowedChildNodes = 1;
    }
    resize(width, height) {
        this.containerElement.style.width = `${width}px`;
        this.containerElement.style.height = `${height}px`;
    }
    performLayout(children, relayoutEvenIfEqual) {
        throw new Error("Method not implemented.");
    }
    destroy() {
        throw new Error("Method not implemented.");
    }
    saveState(state) {
        throw new Error("Method not implemented.");
    }
    loadState(state) {
        throw new Error("Method not implemented.");
    }
    setActiveChild(child) {
        throw new Error("Not supported.");
    }
    get width() {
        return this.containerElement.clientWidth;
    }
    get height() {
        return this.containerElement.clientHeight;
    }
}
//# sourceMappingURL=StickyTabsDockContainer.js.map