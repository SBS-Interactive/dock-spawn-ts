import { DockManager } from "./DockManager.js";
import { ResizeDirection } from "./enums/ResizeDirection.js";
import { PanelContainer } from "./PanelContainer.js";
import { StickyPanel } from "./StickyPanel.js";

type StickyTabContext = {
    container: PanelContainer;
    tabElement: HTMLElement;
}

export class StickyContainer {
    private static readonly _tabsHeight: number = 24;
    private static readonly _tabsWidth: number = 24;

    public readonly element: HTMLElement;
    public readonly dockingArea: HTMLElement;
    
    private readonly _dockManager: DockManager;
    private readonly _bottomTabsContainer: HTMLElement;
    private readonly _leftTabsContainer: HTMLElement;
    private readonly _rightTabsContainer: HTMLElement;
    private readonly _topTabsContainer: HTMLElement;

    private readonly _leftTabs: Array<StickyTabContext> = [];
    private readonly _rightTabs: Array<StickyTabContext> = [];
    private readonly _bottomTabs: Array<StickyTabContext> = [];
    private readonly _topTabs: Array<StickyTabContext> = [];

    public get hasLeftTabs(): boolean {
        console.log('hasLeft', this._leftTabs.length > 0);
        return this._leftTabs.length > 0;
    }

    public get hasRightTabs(): boolean {
        return this._rightTabs.length > 0;
    }

    public get hasBottomTabs(): boolean {
        return this._bottomTabs.length > 0;
    }

    public get hasTopTabs(): boolean {
        return this._topTabs.length > 0;
    }

    public constructor(dockManager: DockManager) {
        this._dockManager = dockManager;

        this.element = document.createElement('div');
        this.element.classList.add('dockspawn-sticky-container');

        this._leftTabsContainer = document.createElement('div');
        this._leftTabsContainer.classList.add(
            'dockspawn-sticky-tabrow',
            'dockspawn-sticky-tabrow-vertical', 
            'dockspawn-sticky-tabrow-left');

        this._rightTabsContainer = document.createElement('div');
        this._rightTabsContainer.classList.add(
            'dockspawn-sticky-tabrow',
            'dockspawn-sticky-tabrow-vertical',
            'dockspawn-sticky-tabrow-right');

        this.dockingArea = document.createElement('div');
        this.dockingArea.classList.add('dockspawn-sticky-container-docking-area');

        this._bottomTabsContainer = document.createElement('div');
        this._bottomTabsContainer.classList.add(
            'dockspawn-sticky-tabrow',
            'dockspawn-sticky-tabrow-bottom');

        this._topTabsContainer = document.createElement('div');
        this._topTabsContainer.classList.add(
            'dockspawn-sticky-tabrow',
            'dockspawn-sticky-tabrow-bottom');

        this.element.append(
            this._leftTabsContainer,
            this.dockingArea,
            this._rightTabsContainer,
            this._bottomTabsContainer);

        this._dockManager.element.appendChild(this.element);
    }

    public resize(width: number, height: number): void {
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;

        const leftTabsWidth = this.hasLeftTabs
            ? StickyContainer._tabsWidth
            : 0;

        const rightTabsWidth = this.hasRightTabs
            ? StickyContainer._tabsWidth
            : 0;

        const bottomTabsHeight = this.hasBottomTabs
            ? StickyContainer._tabsHeight
            : 0;
        
        this.element.style.gridTemplateRows = `minmax(0, 1fr) ${bottomTabsHeight}px`;
        this.element.style.gridTemplateColumns = `${leftTabsWidth}px minmax(0, 1fr) ${rightTabsWidth}px`;

        //Rotated by css
        this._leftTabsContainer.style.width = `${height}px`;
        this._leftTabsContainer.style.height = `${leftTabsWidth}px`;

        this._rightTabsContainer.style.width = `${height}px`;
        this._rightTabsContainer.style.height = `${rightTabsWidth}px`;

        this._dockManager.context.model.rootNode.container.resize(
            width - leftTabsWidth - rightTabsWidth, 
            height - bottomTabsHeight); 
    }

    public async pinLeftAsync(panelContainer: PanelContainer): Promise<void> {
        await panelContainer.close();
        const tab = document.createElement('div');
        tab.style.border = 'solid 1px black';
        tab.style.backgroundColor = 'orange';
        tab.style.height = '100%';
        tab.append(panelContainer.getRawTitle());
        this._leftTabsContainer.append(tab);

        this._leftTabs.push({
            container: panelContainer,
            tabElement: tab
        });

        if (this._leftTabs.length == 1) {
            this.resize(this.element.clientWidth, this.element.clientHeight);
        }

        const rect: DOMRect = this.dockingArea.getBoundingClientRect();

        const dialog = new StickyPanel(
            panelContainer, 
            this._dockManager,
            this,
            rect.x,
            rect.y,
            ResizeDirection.East);

        tab.onclick = () => {
            if (dialog.isHidden) {
                dialog.show();
            }
            else {
                dialog.hide();
            }
        };
    }

    public closeTab(panelContainer: PanelContainer): void {
        this._tryCloseTab(panelContainer, this._leftTabs)
            || this._tryCloseTab(panelContainer, this._rightTabs)
            || this._tryCloseTab(panelContainer, this._bottomTabs);
    }

    private _tryCloseTab(panelContainer: PanelContainer, contexts: Array<StickyTabContext>): boolean {
        const index: number = contexts.findIndex(c => c.container == panelContainer);

        if (index < 0) {
            return false;
        }

        const context = contexts[index];
        context.tabElement.remove();
        contexts.splice(index, 1);

        if (contexts.length == 0) {
            this.resize(this.element.clientWidth, this.element.clientHeight);
        }

        return true;
    }
}