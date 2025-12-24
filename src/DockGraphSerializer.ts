import { DockModel } from "./DockModel.js";
import { DockNode } from "./DockNode.js";
import { Dialog } from "./Dialog.js";
import { IPanelInfo } from "./interfaces/IPanelInfo.js";
import { INodeInfo } from "./interfaces/INodeInfo.js";
import { IState } from "./interfaces/IState.js";
import { StickyPanel } from "./index-webcomponent.js";

/**
 * The serializer saves / loads the state of the dock layout hierarchy
 */
export class DockGraphSerializer {

    serialize(model: DockModel) {
        let graphInfo = this._buildGraphInfo(model.rootNode);
        let dialogs = this._buildDialogsInfo(model.dialogs.sort((x,y)=><number><any>x.elementDialog.style.zIndex-<number><any>y.elementDialog.style.zIndex));
        let stickyPanels = {
            left: this._buildStickyPanelsInfo(model.stickyPanels.left),
            right: this._buildStickyPanelsInfo(model.stickyPanels.right),
            top: this._buildStickyPanelsInfo(model.stickyPanels.top),
            bottom: this._buildStickyPanelsInfo(model.stickyPanels.bottom)
        };

        return JSON.stringify({ graphInfo: graphInfo, dialogsInfo: dialogs, stickyPanels: stickyPanels });
    }

    _buildGraphInfo(node: DockNode): INodeInfo {
        let nodeState: IState = {};
        node.container.saveState(nodeState);

        let childrenInfo: INodeInfo[] = [];
        node.children.forEach((childNode) => {
            childrenInfo.push(this._buildGraphInfo(childNode));
        });

        let nodeInfo: INodeInfo = {
            containerType: node.container.containerType,
            state: nodeState,
            children: childrenInfo
        };
        return nodeInfo;
    }

    _buildDialogsInfo(dialogs: Dialog[]): IPanelInfo[] {
        let dialogsInfo: IPanelInfo[] = [];
        dialogs.forEach((dialog) => {
            let panelState: IState = {};
            let panelContainer = dialog.panel;
            panelContainer.saveState(panelState);

            let panelInfo: IPanelInfo = {
            containerType: panelContainer.containerType,
            state: panelState,
            position: dialog.getPosition(),
            isHidden: dialog.isHidden
        }
            dialogsInfo.push(panelInfo);
        });

        return dialogsInfo;
    }

    _buildStickyPanelsInfo(panels: StickyPanel[]): IState[] {
        return panels.map(p => {
            let panelState: IState = {};
            p.panel.saveState(panelState);

            return panelState;
        });
    }
}