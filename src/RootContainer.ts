import { DockManager } from "./DockManager";
import { IDockContainer } from "./interfaces/IDockContainer";
import { IState } from "./interfaces/IState";

export class RootContainer {
    public readonly dockManager: DockManager;
    public readonly containerElement: HTMLElement;
    public readonly rootElement: HTMLElement;

    private readonly _leftTabs: HTMLElement;
    private readonly _rightTabs: HTMLElement;
    private readonly _bottomTabs: HTMLElement;

    public constructor(dockManager: DockManager) {
        this.dockManager = dockManager;

        this.rootElement = document.createElement('div');
        this.rootElement.classList.add('dockspawn-root-element');

        this._leftTabs = document.createElement('div');
        this._rightTabs = document.createElement('div');
        this._bottomTabs = document.createElement('div');
        this._bottomTabs.classList.add('dockspawn-bottom-pins-tab-container')
        this.containerElement = document.createElement('div');
        
        const mainRow = document.createElement('div');
        mainRow.classList.add('dockspawn-vertical-pins-row');

        mainRow.append(this._leftTabs, this.containerElement, this._rightTabs);
        this.rootElement.append(mainRow, this._bottomTabs);
        this.dockManager.element.append(this.rootElement);
    }

    resize(width: number, height: number): void {
        this.rootElement.style.width = width + 'px';
        this.rootElement.style.height = height + 'px';

        this._bottomTabs.style.width = width + 'px';
        this._bottomTabs.style.height = '25px';

        const contentWidth = width;
        const contentHeight = height - 25;

        this.containerElement.style.width = contentWidth + 'px';
        this.containerElement.style.height = contentHeight + 'px';

        this.dockManager.context.model.rootNode.container.resize(contentWidth, contentHeight);
    }
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
        throw new Error("Method not implemented.");
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    setActiveChild(child: IDockContainer): void {
        throw new Error("Method not implemented.");
    }
    saveState(state: IState): void {
        throw new Error("Method not implemented.");
    }
    loadState(state: IState): void {
        throw new Error("Method not implemented.");
    }

    public get width(): number {
        return 0;
    }

    public get height(): number {
        return 0;
    }
}