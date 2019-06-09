import { Dialog } from "./Dialog.js";
import { DockManager } from "./DockManager.js";
import { EventHandler } from "./EventHandler.js";
import { Point } from "./Point.js";
import { Utils } from "./Utils.js";
import { IDockContainer } from "./interfaces/IDockContainer.js";
import { ContainerType } from "./ContainerType.js";
import { IState } from "./interfaces/IState.js";

export class DraggableContainer implements IDockContainer {

    dialog: Dialog;
    delegate: IDockContainer;
    containerElement: HTMLElement;
    dockManager: DockManager;
    topLevelElement: HTMLElement;
    containerType: ContainerType;
    mouseDownHandler: EventHandler;
    touchDownHandler: EventHandler;
    minimumAllowedChildNodes: number;
    previousMousePosition: { x: any; y: any; };
    mouseMoveHandler: EventHandler;
    touchMoveHandler: EventHandler;
    mouseUpHandler: EventHandler;
    touchUpHandler: EventHandler;

    constructor(dialog: Dialog, delegate: IDockContainer, topLevelElement: HTMLElement, dragHandle: HTMLElement) {
        this.dialog = dialog;
        this.delegate = delegate;
        this.containerElement = delegate.containerElement;
        this.dockManager = delegate.dockManager;
        this.topLevelElement = topLevelElement;
        this.containerType = delegate.containerType;
        this.mouseDownHandler = new EventHandler(dragHandle, 'mousedown', this.onMouseDown.bind(this));
        this.touchDownHandler = new EventHandler(dragHandle, 'touchstart', this.onMouseDown.bind(this));
        this.topLevelElement.style.marginLeft = topLevelElement.offsetLeft + 'px';
        this.topLevelElement.style.marginTop = topLevelElement.offsetTop + 'px';
        this.minimumAllowedChildNodes = delegate.minimumAllowedChildNodes;
    }

    destroy() {
        this.removeDecorator();
        this.delegate.destroy();
    }

    saveState(state: IState) {
        this.delegate.saveState(state);
    }

    loadState(state: IState) {
        this.delegate.loadState(state);
    }

    setActiveChild(/*child*/) {
    }

    get width(): number {
        return this.delegate.width;
    }

    get height(): number {
        return this.delegate.height;
    }

    get name() {
        return this.delegate.name;
    }
    set name(value) {
        if (value)
            this.delegate.name = value;
    }

    resize(width:number, height:number) {
        this.delegate.resize(width, height);
    }

    performLayout(children: IDockContainer[]) {
        this.delegate.performLayout(children, false);
    }

    removeDecorator() {
        if (this.mouseDownHandler) {
            this.mouseDownHandler.cancel();
            delete this.mouseDownHandler;
        }
        if (this.touchDownHandler) {
            this.touchDownHandler.cancel();
            delete this.touchDownHandler;
        }
    }

    onMouseDown(event) {
        if (event.touches)
            event = event.touches[0];

        this._startDragging(event);
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
        if (this.mouseMoveHandler) {
            this.mouseMoveHandler.cancel();
            delete this.mouseMoveHandler;
        }
        if (this.touchMoveHandler) {
            this.touchMoveHandler.cancel();
            delete this.touchMoveHandler;
        }
        if (this.mouseUpHandler) {
            this.mouseUpHandler.cancel();
            delete this.mouseUpHandler;
        }
        if (this.touchUpHandler) {
            this.touchUpHandler.cancel();
            delete this.touchUpHandler;
        }

        this.mouseMoveHandler = new EventHandler(window, 'mousemove', this.onMouseMove.bind(this));
        this.touchMoveHandler = new EventHandler(window, 'touchmove', this.onMouseMove.bind(this));
        this.mouseUpHandler = new EventHandler(window, 'mouseup', this.onMouseUp.bind(this));
        this.touchUpHandler = new EventHandler(window, 'touchend', this.onMouseUp.bind(this));
    }

    onMouseUp(event) {
        this._stopDragging(event);
        this.mouseMoveHandler.cancel();
        delete this.mouseMoveHandler;
        this.touchMoveHandler.cancel();
        delete this.touchMoveHandler;
        this.mouseUpHandler.cancel();
        delete this.mouseUpHandler;
        this.touchUpHandler.cancel();
        delete this.touchUpHandler;
    }

    _startDragging(event) {
        if (this.dialog.eventListener)
            this.dialog.eventListener._onDialogDragStarted(this.dialog, event);
        document.body.classList.add('disable-selection');
    }

    _stopDragging(event) {
        if (this.dialog.eventListener)
            this.dialog.eventListener._onDialogDragEnded(this.dialog, event);
        document.body.classList.remove('disable-selection');
    }

    onMouseMove(event: TouchEvent | MouseEvent) {
        let br = document.body.getBoundingClientRect();
        if ((<TouchEvent>event).touches != null) {
            for (let w in this.dockManager.dockWheel.wheelItems) {
                let item = this.dockManager.dockWheel.wheelItems[w];
                let offset = item.element.getBoundingClientRect();
                if ((<TouchEvent>event).touches[0].clientX > (offset.left - br.left) &&
                    (<TouchEvent>event).touches[0].clientX < (offset.left + item.element.clientWidth - br.left) &&
                    (<TouchEvent>event).touches[0].clientY > (offset.top - br.top) &&
                    (<TouchEvent>event).touches[0].clientY < (offset.top + item.element.clientHeight - br.top)) {
                    item.onMouseMoved(event);
                } else {
                    item.onMouseOut(event);
                }
            }
        }

        if ((<TouchEvent>event).changedTouches != null) { // TouchMove Event
            event = <any>(<TouchEvent>event).changedTouches[0];
        }

        let currentMousePosition = new Point((<MouseEvent>event).clientX, (<MouseEvent>event).clientY);

        let dx = this.dockManager.checkXBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition);
        let dy = this.dockManager.checkYBounds(this.topLevelElement, currentMousePosition, this.previousMousePosition);
        this._performDrag(dx, dy);
        this.previousMousePosition = currentMousePosition;
    }

    _performDrag(dx: number, dy: number) {
        let left = dx + Utils.getPixels(this.topLevelElement.style.marginLeft);
        let top = dy + Utils.getPixels(this.topLevelElement.style.marginTop);
        this.topLevelElement.style.marginLeft = left + 'px';
        this.topLevelElement.style.marginTop = top + 'px';
    }
}