import { DockNode } from "./DockNode.js";
import { Dialog } from "./Dialog.js";
import { StickyPanel } from "./index.js";

export class DockModel {
    rootNode: DockNode;
    documentManagerNode: DockNode;
    dialogs: Dialog[];
    stickyPanels: Record<'top' | 'bottom' | 'left' | 'right', StickyPanel[]>;

    constructor() {
        this.rootNode = this.documentManagerNode = undefined;
        this.stickyPanels = {
            top: [],
            bottom: [],
            left: [],
            right: []
        };
    }
}
