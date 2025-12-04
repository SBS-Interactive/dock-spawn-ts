import { Dialog } from "./Dialog.js";
import { DockManager } from "./DockManager.js";
import { ResizeDirection } from "./enums/ResizeDirection.js";
import { ILayoutEventListener, Localizer, StickyContainer } from "./index-webcomponent.js";
import { PanelContainer } from "./PanelContainer.js";

export class StickyPanel extends Dialog {
    private readonly _stickyContainer;
    private readonly _activePanelListener: ILayoutEventListener;

    constructor(
        panel: PanelContainer, 
        dockManager: DockManager,
        stickyContainer: StickyContainer,
        x: number, 
        y: number,
        resizeDirection: ResizeDirection
    ) {
        panel.isDialog = true;

        super(panel, dockManager, null, false);

        this.draggable.removeDecorator();
        this.draggable = null;

        this.setPosition(x, y);

        requestAnimationFrame(() => this.hide());

        this._stickyContainer = stickyContainer;
        this._activePanelListener = {
            onActivePanelChange: (dockManager, panel) => {
                if (panel != this.panel) {
                    this.hide();

                    dockManager.removeLayoutListener(this._activePanelListener);
                }
            }
        }        
    }

    public override show(): void {
        this.dockManager.addLayoutListener(this._activePanelListener);
        this.onFocus();

        super.show();
    }

    public override destroy(): void {
        this.dockManager.removeLayoutListener(this._activePanelListener);

        super.destroy();
    }

    public override close(): void {
        super.close();
        this._stickyContainer.closeTab(this.panel);
    }

    public override createContextMenuItems(): Array<Node> {
        const dockButton = document.createElement('div');
        dockButton.innerText = Localizer.getString('Dock');
        dockButton.onclick = () => {
            console.log('TODO');
            this.panel.closeContextMenu();
        };

        return [
            dockButton,
            ...super.createContextMenuItems()
        ];
    }
}