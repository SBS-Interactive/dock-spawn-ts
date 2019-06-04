import { TabHandle } from "./TabHandle";
import { PanelContainer } from "./PanelContainer";
import { IDockContainer } from "./IDockContainer";
import { TabHost } from "./TabHost";

export class TabPage {

    selected: boolean;
    host: TabHost;
    container: IDockContainer;
    handle: TabHandle;
    containerElement: HTMLElement;
    _initContent: any;

    constructor(host, container) {
        if (arguments.length === 0) {
            return;
        }

        this.selected = false;
        this.host = host;
        this.container = container;

        this.handle = new TabHandle(this);
        this.containerElement = container.containerElement;

        if (container instanceof PanelContainer) {
            let panel = container;
            panel.onTitleChanged = this.onTitleChanged.bind(this);
        }
    }

    onTitleChanged(/*sender, title*/) {
        this.handle.updateTitle();
    }

    destroy() {
        this.handle.destroy();

        if (this.container instanceof PanelContainer) {
            var panel = this.container;
            delete panel.onTitleChanged;
        }
    }

    onSelected() {
        this.host.onTabPageSelected(this);
        if (this.container instanceof PanelContainer) {
            var panel = this.container;
            panel.dockManager.notifyOnTabChange(this);
        }

    }

    setSelected(flag) {
        this.selected = flag;
        this.handle.setSelected(flag);

        if (!this._initContent)
            this.host.contentElement.appendChild(this.containerElement);
        this._initContent = true;
        if (this.selected) {
            this.containerElement.style.display = 'block';
            // force a resize again
            var width = this.host.contentElement.clientWidth;
            var height = this.host.contentElement.clientHeight;
            this.container.resize(width, height);
        }
        else {
            this.containerElement.style.display = 'none';
        }
    }

    resize(width, height) {
        this.container.resize(width, height);
    }
}