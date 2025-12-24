import { DockManager } from './DockManager.js';
import { DockNode } from './DockNode.js';
import { ResizeDirection } from './enums/ResizeDirection.js';
import { HorizontalDockContainer } from './HorizontalDockContainer.js';
import { PanelContainer } from './PanelContainer.js';
import { StickyPanel } from './StickyPanel.js';
import { VerticalDockContainer } from './VerticalDockContainer.js';

type StickyTabContext = {
    container: PanelContainer;
    tabElement: HTMLElement;
}

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

    private readonly _leftTabs: Array<StickyTabContext> = [];
    private readonly _rightTabs: Array<StickyTabContext> = [];
    private readonly _bottomTabs: Array<StickyTabContext> = [];
    private readonly _topTabs: Array<StickyTabContext> = [];

    public get hasLeftTabs(): boolean {
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

        for (const left of this._leftTabs) {
            const stickyPanel = left.container.floatingPanel as StickyPanel;

            stickyPanel.setPosition(rect.left + StickyContainer.TabsWidth, rect.top + topTabsHeight);

            stickyPanel.resize(
                Math.min(dockingWidth, stickyPanel.width),
                dockingHeight);
        }

        for (const right of this._rightTabs) {
            const stickyPanel = right.container.floatingPanel as StickyPanel;

            const width: number = Math.min(dockingWidth, stickyPanel.width);
            stickyPanel.setPosition(rect.right - StickyContainer.TabsWidth - width, rect.top + topTabsHeight);

            stickyPanel.resize(
                width,
                dockingHeight);
        }

        for (const top of this._topTabs) {
            const stickyPanel = top.container.floatingPanel as StickyPanel;

            stickyPanel.setPosition(rect.left + leftTabsWidth, rect.top + StickyContainer.TabsHeight);
            stickyPanel.resize(
                dockingWidth,
                Math.min(dockingHeight, stickyPanel.height));
        }

        for (const bottom of this._bottomTabs) {
            const stickyPanel = bottom.container.floatingPanel as StickyPanel;

            const height: number = Math.min(dockingHeight, stickyPanel.height);
            stickyPanel.setPosition(rect.left + leftTabsWidth, rect.bottom - StickyContainer.TabsHeight - height);
            stickyPanel.resize(
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
            this._rightTabs,
            ResizeDirection.West);
    }

    public async pinTopAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._topTabsContainer,
            this._topTabs,
            ResizeDirection.South);
    }

    public async pinBottomAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._bottomTabsContainer,
            this._bottomTabs,
            ResizeDirection.North);
    }

    public async pinLeftAsync(panelContainer: PanelContainer): Promise<void> {
        await this._pinAsync(
            panelContainer,
            this._leftTabsContainer,
            this._leftTabs,
            ResizeDirection.East);
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
        this._tryCloseTab(panelContainer, this._leftTabs)
            || this._tryCloseTab(panelContainer, this._rightTabs)
            || this._tryCloseTab(panelContainer, this._topTabs)
            || this._tryCloseTab(panelContainer, this._bottomTabs);
    }

    public dockBack(panelContainer: PanelContainer): void {
        const rootNode: DockNode = this._dockManager.context.model.rootNode;

        if (this._tryCloseTab(panelContainer, this._leftTabs)) {
            this._dockManager.dockLeft(
                rootNode,
                panelContainer,
                panelContainer.width / this.dockingArea.clientWidth);
        }
        else if (this._tryCloseTab(panelContainer, this._rightTabs)) {
            this._dockManager.dockRight(
                rootNode,
                panelContainer,
                panelContainer.width / this.dockingArea.clientWidth);
        }
        else if (this._tryCloseTab(panelContainer, this._topTabs)) {
            this._dockManager.dockUp(
                rootNode,
                panelContainer,
                panelContainer.height / this.dockingArea.clientHeight);
        }
        else if (this._tryCloseTab(panelContainer, this._bottomTabs)) {
            this._dockManager.dockDown(
                rootNode,
                panelContainer,
                panelContainer.height / this.dockingArea.clientHeight);
        }
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
        tabs: Array<StickyTabContext>,
        resizeDirection: ResizeDirection
    ): Promise<void> {
        await panelContainer.close();

        const stickyPanel = new StickyPanel(
            panelContainer,
            this._dockManager,
            this,
            resizeDirection);

        const tabHandle: HTMLDivElement = this._createTabHandle(stickyPanel);
        tabsContainer.append(tabHandle);

        tabs.push({
            tabElement: tabHandle,
            container: panelContainer
        });

        this.invalidate();

        stickyPanel.initialize();
    }
}