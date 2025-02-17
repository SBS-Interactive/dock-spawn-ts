import { ContainerType } from "./ContainerType";
import { DockManager } from "./DockManager";
import { IDockContainer } from "./interfaces/IDockContainer";
import { IState } from "./interfaces/IState";
export declare class StickyTabsDockContainer implements IDockContainer {
    readonly dockManager: DockManager;
    readonly containerElement: HTMLElement;
    containerType: ContainerType;
    name: string;
    minimumAllowedChildNodes: number;
    constructor(dockManager: DockManager);
    resize(width: number, height: number): void;
    performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void;
    destroy(): void;
    saveState(state: IState): void;
    loadState(state: IState): void;
    setActiveChild(child: IDockContainer): void;
    get width(): number;
    get height(): number;
}
