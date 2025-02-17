import { DockManager } from "./DockManager";
import { TabHostDirection } from "./enums/TabHostDirection";
import { IDockContainer } from "./interfaces/IDockContainer";
import { PanelContainer } from "./PanelContainer";
import { Utils } from "./Utils";

export class StickyTabHandle {
    private readonly _page: StickyTabPage;
    public readonly baseElement: HTMLDivElement;
    private readonly _titleElement: HTMLDivElement;

    public constructor(page: StickyTabPage) {
        this._page = page;

        this.baseElement = document.createElement('div');
        this._titleElement = document.createElement('div');

        this.baseElement.appendChild(this._titleElement);
    }

    public updateTitle(title: string): void {
        this._titleElement.innerHTML = title;
    }

    public destroy() {
        Utils.removeNode(this.baseElement);
    }
}

export class StickyTabPage {
    private readonly _handle: StickyTabHandle;
    private readonly _host: StickyTabHost;
    public readonly container: PanelContainer;
    private readonly _panelElement: HTMLElement;
    private _isVisible: boolean;

    public constructor(host: StickyTabHost, panel: PanelContainer) {
        this._host = host;
        this.container = panel;
        this._panelElement = panel.containerElement;

        this._handle = new StickyTabHandle(this);

        this.container.onTitleChanged = this._onTitleChanged.bind(this);
        this._onTitleChanged();

        this.container.setVisible(false);
        this.container.setDialogPosition(0, 0);
    }

    public toggleVisibility(): void {
        this.setVisible(!this._isVisible);
    }

    public setVisible(visible: boolean): void {
        this._isVisible = visible;
        this.container.setVisible(visible);
    }

    public destroy(): void {
        this._handle.destroy();
        delete this.container.onTitleChanged;
        Utils.removeNode(this._panelElement);
    }

    public resize(width: number, height: number): void {
        this.container.resize(width, height);
    }

    private _onTitleChanged(): void {
        this._handle.updateTitle(this.container.getRawTitle());
    }
}

export class StickyTabHost {
    private readonly _dockManager: DockManager;
    public tabHostDirection: TabHostDirection;
    private readonly _element: HTMLDivElement;
    private readonly _tabListElement: HTMLDivElement;
    private readonly _contentElement: HTMLDivElement;
    private readonly _pages: StickyTabPage[];

    public constructor(
        dockManager: DockManager, 
        tabHostDirection: TabHostDirection,
        element: HTMLDivElement
    ) {
        this._dockManager = dockManager;
        this.tabHostDirection = tabHostDirection;

        this._element = element;
        this._tabListElement = document.createElement('div');
        this._contentElement = document.createElement('div');

        if (this.tabHostDirection == TabHostDirection.TOP || this.tabHostDirection == TabHostDirection.LEFT) {
            this._element.appendChild(this._tabListElement);
            this._element.appendChild(this._contentElement);
        }
        else {
            this._element.appendChild(this._contentElement);
            this._element.appendChild(this._tabListElement);
        }
    }

    public performLayout(children: IDockContainer[]): void {
        for (let i = this._pages.length - 1; i >= 0; i--) {
            const page = this._pages[i];

            if (!children.includes(page.container)) {
                page.destroy();
             
                this._pages.splice(i, 1);
            }

            for (const child of children) {
                if (!(child instanceof PanelContainer)) {
                    continue;
                }

                if (!this._pages.some(p => p.container == child)) {
                    this._pages.push(this._createPage(child));
                }
            }
        }
    }

    private _createPage(container: PanelContainer): StickyTabPage {
        return new StickyTabPage(this, container);
    }
}