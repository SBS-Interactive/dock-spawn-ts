import { DockManager } from "./DockManager";
import { IDockContainer } from "./interfaces/IDockContainer";
import { IState } from "./interfaces/IState";
export declare class RootContainer {
    readonly dockManager: DockManager;
    readonly containerElement: HTMLElement;
    readonly rootElement: HTMLElement;
    private readonly _leftTabs;
    private readonly _rightTabs;
    private readonly _bottomTabs;
    constructor(dockManager: DockManager);
    resize(width: number, height: number): void;
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void;
    destroy(): void;
    setActiveChild(child: IDockContainer): void;
    saveState(state: IState): void;
    loadState(state: IState): void;
    get width(): number;
    get height(): number;
}
