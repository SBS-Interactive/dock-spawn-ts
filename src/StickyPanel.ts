import { BufferedResizeDecorator } from './BufferedResizeDecorator.js';
import { DockManager } from './DockManager.js';
import { ResizeDirection } from './enums/ResizeDirection.js';
import { FloatingPanel } from './FloatingPanel.js';
import { Localizer } from './i18n/Localizer.js';
import { ILayoutEventListener } from './interfaces/ILayoutEventListener.js';
import { PanelContainer } from './PanelContainer.js';
import { ResizableContainer } from './ResizableContainer.js';
import { StickyContainer } from './StickyContainer.js';

export class StickyPanel extends FloatingPanel {
    private readonly _stickyContainer;
    private readonly _activePanelListener: ILayoutEventListener;
    private readonly _resizableContainer: ResizableContainer;
    private readonly _resizeCache: BufferedResizeDecorator;

    public static defaultPanelWidth: number = 400;
    public static defaultPanelHeight: number = 250;

    constructor(
        panel: PanelContainer, 
        dockManager: DockManager,
        stickyContainer: StickyContainer,
        resizeDirection: ResizeDirection
    ) {
        super(panel, dockManager);

        this._stickyContainer = stickyContainer;
        this._activePanelListener = {
            onActivePanelChange: (_dockManager, panel) => {
                if (panel != this.panel) {
                    this.hide();
                }
            }
        }    
        
        panel.width = StickyPanel.defaultPanelWidth;
        panel.height = StickyPanel.defaultPanelHeight;

        this._resizableContainer = new ResizableContainer(
            this,
            panel,
            this.element,
            resizeDirection);

        this._resizeCache = new BufferedResizeDecorator(this._resizableContainer);


        this._resizableContainer.onUserResize = (width, height) => this._resizeCache.resize(width, height);

        this.decoratedContainer = this._resizeCache;
    }

    //TEMP
    public override setPosition(x: number, y: number): void {
        super.setPosition(x, y);
    }

    public override initialize(): void {
        super.initialize();
        this.hide();
    }

    public override resize(width: number, height: number): void {
        super.resize(width, height);

        if (!this.isHidden) {
            this._resizeCache.performResize();
        }
    }

    protected override onShow(): void {
        this.dockManager.addLayoutListener(this._activePanelListener);
        this._resizeCache.performResize();
        this.onFocus();
    }

    protected override onHide(): void {
        this.dockManager.removeLayoutListener(this._activePanelListener);
    }

    public override destroy(): void {
        this.dockManager.removeLayoutListener(this._activePanelListener);
        this._resizableContainer.removeDecorator();
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
            dockButton
        ];
    }
}