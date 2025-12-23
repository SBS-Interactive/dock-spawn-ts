import { ContainerType } from './ContainerType';
import { DockManager } from './DockManager';
import { IDockContainer, IState } from './index-webcomponent';

export class BufferedResizeDecorator implements IDockContainer {
    public dockManager: DockManager;
    public containerElement: HTMLElement;
    public containerType: ContainerType;
    public minimumAllowedChildNodes: number;

    private _width: number;
    private _height: number;
    private readonly _delegate: IDockContainer;

    public constructor(delegate: IDockContainer) {
        this._delegate = delegate;
        this.dockManager = delegate.dockManager;
        this.containerElement = delegate.containerElement;
        this.containerType = delegate.containerType;
        this.minimumAllowedChildNodes = delegate.minimumAllowedChildNodes;
        this._width = this._delegate.width;
        this._height = this._delegate.height;
    }

    public get width(): number {
        return this._width;
    }

    public set width(value: number) {
        this._width = value;
    }

    public get height(): number {
        return this._height;
    }

    public set height(value: number) {
        this._height = value;
    }

    public get name(): string {
        return this._delegate.name;
    }

    public set name(value: string) {
        this._delegate.name = value;
    }

    public performResize(): void {
        this._delegate.resize(this.width, this.height);
    }

    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    public performLayout(children: IDockContainer[], relayoutEvenIfEqual: boolean): void {
        this._delegate.performLayout(children, relayoutEvenIfEqual);
    }

    public destroy(): void {
        this._delegate.destroy();
    }

    public setActiveChild(child: IDockContainer): void {
        this._delegate.setActiveChild(child);
    }

    //TODO revoir s'il faut faire ça
    public saveState(state: IState): void {
        this._delegate.saveState(state);
        state.width = this.width;
        state.height = this.height;
    }

    public loadState(state: IState): void {
        this._delegate.loadState(state);
    }
}
