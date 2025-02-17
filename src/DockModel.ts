import { DockNode } from "./DockNode.js";
import { Dialog } from "./Dialog.js";
import { StickyTabPage } from "./StickyTabHost.js";

export class DockModel {
    rootNode: DockNode;
    documentManagerNode: DockNode;
    dialogs: Dialog[];
    stickyPanels: StickyTabPage[];

    constructor() {
        this.rootNode = this.documentManagerNode = undefined;
    }
}
