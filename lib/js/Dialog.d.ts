import { DockManager } from "./DockManager.js";
import { Point } from "./Point.js";
import { PanelContainer } from "./PanelContainer.js";
import { DraggableContainer } from "./DraggableContainer.js";
import { ResizableContainer } from "./ResizableContainer.js";
import { EventHandler } from "./EventHandler.js";
export declare class Dialog {
    elementDialog: HTMLDivElement & {
        floatingDialog: Dialog;
    };
    draggable: DraggableContainer;
    panel: PanelContainer;
    dockManager: DockManager;
    eventListener: DockManager;
    position: Point;
    resizable: ResizableContainer;
    mouseDownHandler: any;
    touchDownHandler: any;
    onKeyPressBound: any;
    noDocking: boolean;
    isHidden: boolean;
    keyPressHandler: EventHandler;
    constructor(panel: PanelContainer, dockManager: DockManager);
    saveState(x: number, y: number): void;
    static fromElement(id: string, dockManager: DockManager): Dialog;
    _initialize(): void;
    setPosition(x: number, y: number): void;
    getPosition(): Point;
    onMouseDown(): void;
    destroy(): void;
    resize(width: number, height: number): void;
    setTitle(title: string): void;
    setTitleIcon(iconName: string): void;
    bringToFront(): void;
    hide(): void;
    close(): void;
    remove(): void;
    show(): void;
}