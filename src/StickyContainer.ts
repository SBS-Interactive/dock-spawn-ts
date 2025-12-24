import { DockManager } from './DockManager.js';
import { DockNode } from './DockNode.js';
import { ResizeDirection } from './enums/ResizeDirection.js';
import { HorizontalDockContainer } from './HorizontalDockContainer.js';
import { PanelContainer } from './PanelContainer.js';
import { StickyPanel } from './StickyPanel.js';
import { VerticalDockContainer } from './VerticalDockContainer.js';

export class StickyContainer {
    public static readonly TabsHeight: number = 22;
    public static readonly TabsWidth: number = 22;

    public readonly element: HTMLElement;
    public readonly dockingArea: HTMLElement;

    private readonly _dockManager: DockManager;
    private readonly _bottomTabsContainer: HTMLElement;
    private readonly _leftTabsContainer: HTMLElement;
    private readonly _rightTabsContainer: HTMLElement;
    private readonly _topTabsContainer: HTMLElement;

    private readonly _tabsHandle: Map<PanelContainer, HTMLElement> = new Map();

    public get hasLeftTabs(): boolean {
        return this._dockManager.context.model.stickyPanels.left.length > 0;
    }

    public get hasRightTabs(): boolean {
        return this._dockManager.context.model.stickyPanels.right.length > 0;
    }

    public get hasBottomTabs(): boolean {
        return this._dockManager.context.model.stickyPanels.bottom.length > 0;
    }

    public get hasTopTabs(): boolean {
        return this._dockManager.context.model.stickyPanels.top.length > 0;
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
            'dockspawn-sticky-tabrow-top');

        this.element.append(
            this._leftTabsContainer,
            this._rightTabsContainer,
            this._bottomTabsContainer,
            this._topTabsContainer,
            this.dockingArea);

        this._dockManager.element.appendChild(this.element);
    }

    public resize(width: number, height: number): void {
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;

        const leftTabsWidth = this.hasLeftTabs
            ? StickyContainer.TabsWidth
            : 0;

        const rightTabsWidth = this.hasRightTabs
            ? StickyContainer.TabsWidth
            : 0;

        const bottomTabsHeight = this.hasBottomTabs
            ? StickyContainer.TabsHeight
            : 0;

        const topTabsHeight = this.hasTopTabs
            ? StickyContainer.TabsHeight
            : 0;

        const dockingWidth: number = width - leftTabsWidth - rightTabsWidth;
        const dockingHeight: number = height - bottomTabsHeight - topTabsHeight;

        this._dockManager.context.model.rootNode.container.resize(dockingWidth, dockingHeight);

        const rect = this.element.getBoundingClientRect();

        for (const left of this._dockManager.context.model.stickyPanels.left) {
            left.setPosition(rect.left + StickyContainer.TabsWidth, rect.top + topTabsHeight);

            left.resize(
                Math.min(dockingWidth, left.width),
                dockingHeight);
        }

        for (const right of this._dockManager.context.model.stickyPanels.right) {
            const width: number = Math.min(dockingWidth, right.width);
            right.setPosition(rect.right - StickyContainer.TabsWidth - width, rect.top + topTabsHeight);

            right.resize(
                width,
                dockingHeight);
        }

        for (const top of this._dockManager.context.model.stickyPanels.top) {
            top.setPosition(rect.left + leftTabsWidth, rect.top + StickyContainer.TabsHeight);
            top.resize(
                dockingWidth,
                Math.min(dockingHeight, top.height));
        }

        for (const bottom of this._dockManager.context.model.stickyPanels.bottom) {
            const height: number = Math.min(dockingHeight, bottom.height);
            bottom.setPosition(rect.left + leftTabsWidth, rect.bottom - StickyContainer.TabsHeight - height);
            bottom.resize(
                dockingWidth,
                height);
        }
    }

    public invalidate(): void {
        this.resize(this.element.clientWidth, this.element.clientHeight);
    }

    public async pinRightAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._rightTabsContainer,
            ResizeDirection.West,
            'right');
    }

    public async pinTopAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._topTabsContainer,
            ResizeDirection.South,
            'top');
    }

    public async pinBottomAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._bottomTabsContainer,
            ResizeDirection.North,
            'bottom');
    }

    public async pinLeftAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._leftTabsContainer,
            ResizeDirection.East,
            'left');
    }

    public async pinAutoDirection(panelContainer: PanelContainer): Promise<void> {
        const node: DockNode = this._dockManager.findNodeFromContainerElement(panelContainer.containerElement);
        const documentManagerNode: DockNode = this._dockManager.context.model.documentManagerNode;

        //If the PanelContainer is not already docked, pin it left by default
        if (!node) {
            await this.pinLeftAsync(panelContainer);
            return;
        }

        const ancestors: Map<DockNode, number> = new Map();

        let currentNode: DockNode = node;

        while (currentNode.parent) {
            ancestors.set(currentNode.parent, currentNode.parent.children.indexOf(currentNode));
            currentNode = currentNode.parent;
        }
        
        let lowestCommonAncestor: DockNode = documentManagerNode;
        let documentPosition: number = -1;

        while (lowestCommonAncestor && !ancestors.has(lowestCommonAncestor)) {
            documentPosition = lowestCommonAncestor.parent?.children.indexOf(lowestCommonAncestor);
            lowestCommonAncestor = lowestCommonAncestor.parent;
        }

        if (!lowestCommonAncestor) {
            await this.pinLeftAsync(panelContainer);
            return;
        }

        const nodeIsBeforeDocuments: boolean = ancestors.get(lowestCommonAncestor) < documentPosition;

        if (lowestCommonAncestor.container instanceof HorizontalDockContainer) {
            if (nodeIsBeforeDocuments) {
                await this.pinLeftAsync(panelContainer);
            }
            else {
                await this.pinRightAsync(panelContainer);
            }
        }
        else if (lowestCommonAncestor.container instanceof VerticalDockContainer) {
            if (nodeIsBeforeDocuments) {
                await this.pinTopAsync(panelContainer);
            }
            else {
                await this.pinBottomAsync(panelContainer);
            }
        }
        else {
            await this.pinLeftAsync(panelContainer);
        } 
    }

    public closeTab(panelContainer: PanelContainer): void {
        this._tryCloseTab(panelContainer, 'left')
            || this._tryCloseTab(panelContainer, 'right')
            || this._tryCloseTab(panelContainer, 'top')
            || this._tryCloseTab(panelContainer, 'bottom');
    }

    public dockBack(panelContainer: PanelContainer): void {
        const rootNode: DockNode = this._dockManager.context.model.rootNode;

        if (this._tryCloseTab(panelContainer, 'left')) {
            this._dockManager.dockLeft(
                rootNode,
                panelContainer,
                panelContainer.width / this.dockingArea.clientWidth);
        }
        else if (this._tryCloseTab(panelContainer, 'right')) {
            this._dockManager.dockRight(
                rootNode,
                panelContainer,
                panelContainer.width / this.dockingArea.clientWidth);
        }
        else if (this._tryCloseTab(panelContainer, 'top')) {
            this._dockManager.dockUp(
                rootNode,
                panelContainer,
                panelContainer.height / this.dockingArea.clientHeight);
        }
        else if (this._tryCloseTab(panelContainer, 'bottom')) {
            this._dockManager.dockDown(
                rootNode,
                panelContainer,
                panelContainer.height / this.dockingArea.clientHeight);
        }
    }

    private _tryCloseTab(panelContainer: PanelContainer, direction: 'top' | 'left' | 'right' | 'bottom'): boolean {
        const stickyPanels = this._dockManager.context.model.stickyPanels[direction];    
        const index: number = stickyPanels.findIndex(c => c.panel == panelContainer);

        if (index < 0) {
            return false;
        }

        this._tabsHandle.get(panelContainer).remove();
        this._tabsHandle.delete(panelContainer);

        stickyPanels.splice(index, 1);

        if (stickyPanels.length == 0) {
            this.invalidate();
        }

        return true;
    }

    private _createTabHandle(stickyPanel: StickyPanel): HTMLDivElement {
        const tab = document.createElement('div');
        tab.classList.add('disable-selection');
        tab.append(stickyPanel.panel.title);

        tab.onclick = () => {
            if (stickyPanel.isHidden) {
                stickyPanel.show();
            }
            else {
                stickyPanel.hide();
            }
        };

        return tab;
    }

    private async _pinAsync(
        panelContainer: PanelContainer,
        tabsContainer: HTMLElement,
        resizeDirection: ResizeDirection,
        position: 'left' | 'right' | 'top' | 'bottom'
    ): Promise<void> {
        await panelContainer.close();

        const stickyPanel = new StickyPanel(
            panelContainer,
            this._dockManager,
            this,
            resizeDirection,
            position);

        const tabHandle: HTMLDivElement = this._createTabHandle(stickyPanel);
        tabsContainer.append(tabHandle);
        this._dockManager.context.model.stickyPanels[position].push(stickyPanel);
        this._tabsHandle.set(panelContainer, tabHandle);

        this.invalidate();

        stickyPanel.initialize();
    }
}