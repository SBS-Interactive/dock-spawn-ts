import { DockManager } from "./DockManager";
import { IDockContainer } from "./IDockContainer";
import { Utils } from "./Utils";
import { UndockInitiator } from "./UndockInitiator";
import { ContainerType } from "./ContainerType";
import { EventHandler } from "./EventHandler";

/**
 * This dock container wraps the specified element on a panel frame with a title bar and close button
 */
export class PanelContainer implements IDockContainer {

    onTitleChanged: any;
    elementPanel: HTMLDivElement;
    elementTitle: HTMLDivElement;
    elementTitleText: HTMLDivElement;
    elementContentHost: HTMLDivElement;
    name: string;
    state: { width: any; height: any; };
    elementContent: HTMLElement & { resizeHandler?: any };
    dockManager: DockManager;
    title: string;
    containerType: ContainerType;
    iconName: string;
    iconTemplate: any;
    minimumAllowedChildNodes: number;
    _floatingDialog: any;
    isDialog: boolean;
    _canUndock: boolean;
    eventListeners: any[];
    undockInitiator: UndockInitiator;
    elementButtonClose: HTMLDivElement;
    closeButtonClickedHandler: any;
    _cachedWidth: number;
    _cachedHeight: number;

    constructor(elementContent: HTMLElement, dockManager: DockManager, title?: string, hideCloseButton?: Boolean) {
        if (!title)
            title = 'Panel';
        this.elementContent = elementContent;
        this.dockManager = dockManager;
        this.title = title;
        this.containerType = ContainerType.panel;
        this.iconName = 'fa fa-arrow-circle-right';
        this.iconTemplate = null;
        this.minimumAllowedChildNodes = 0;
        this._floatingDialog = undefined;
        this.isDialog = false;
        this._canUndock = dockManager._undockEnabled;
        this.eventListeners = [];
        this.hideCloseButton(hideCloseButton);
        this._initialize();

        //@ts-ignore
        elementContent._dockSpawnPanelContainer = this;
    }

    canUndock(state) {
        this._canUndock = state;
        this.undockInitiator.enabled = state;
        this.eventListeners.forEach((listener) => {
            if (listener.onDockEnabled) {
                listener.onDockEnabled({ self: this, state: state });
            }
        });

    }

    addListener(listener) {
        this.eventListeners.push(listener);
    }

    removeListener(listener) {
        this.eventListeners.splice(this.eventListeners.indexOf(listener), 1);
    }

    get floatingDialog() {
        return this._floatingDialog;
    }
    set floatingDialog(value) {
        this._floatingDialog = value;
        var canUndock = (this._floatingDialog === undefined);
        this.undockInitiator.enabled = canUndock;
    }

    static loadFromState(state, dockManager: DockManager) {
        let elementName = state.element;
        let elementContent = document.getElementById(elementName);
        if (elementContent === null) {
            return null;
        }
        let ret = new PanelContainer(elementContent, dockManager);
        ret.loadState(state);
        return ret;
    }

    saveState(state) {
        state.element = this.elementContent.id;
        state.width = this.width;
        state.height = this.height;
    }

    loadState(state) {
        this.width = state.width;
        this.height = state.height;
        this.state = { width: state.width, height: state.height };
    }

    setActiveChild(/*child*/) {
    }

    get containerElement() {
        return this.elementPanel;
    }

    _initialize() {
        this.name = Utils.getNextId('panel_');
        this.elementPanel = document.createElement('div');
        this.elementTitle = document.createElement('div');
        this.elementTitleText = document.createElement('div');
        this.elementContentHost = document.createElement('div');
        if (!this.hideCloseButton)
            this.elementButtonClose = document.createElement('div');

        this.elementPanel.appendChild(this.elementTitle);
        this.elementTitle.appendChild(this.elementTitleText);
        if (!this.hideCloseButton) {
            this.elementTitle.appendChild(this.elementButtonClose);
            this.elementButtonClose.innerHTML = '<i class="fa fa-times"></i>';
            this.elementButtonClose.classList.add('panel-titlebar-button-close');
        }
        this.elementPanel.appendChild(this.elementContentHost);

        this.elementPanel.classList.add('panel-base');
        this.elementTitle.classList.add('panel-titlebar');
        this.elementTitle.classList.add('disable-selection');
        this.elementTitleText.classList.add('panel-titlebar-text');
        this.elementContentHost.classList.add('panel-content');

        // set the size of the dialog elements based on the panel's size
        let panelWidth = this.elementContent.clientWidth;
        let panelHeight = this.elementContent.clientHeight;
        let titleHeight = this.elementTitle.clientHeight;
        this._setPanelDimensions(panelWidth, panelHeight + titleHeight);

        // Add the panel to the body
        //document.body.appendChild(this.elementPanel);

        if (!this.hideCloseButton) {
            this.closeButtonClickedHandler =
                new EventHandler(this.elementButtonClose, 'click', this.onCloseButtonClicked.bind(this));
        }

        Utils.removeNode(this.elementContent);
        this.elementContentHost.appendChild(this.elementContent);

        // Extract the title from the content element's attribute
        let contentTitle = this.elementContent.dataset.panelCaption;
        let contentIcon = this.elementContent.dataset.panelIcon;
        if (contentTitle) this.title = contentTitle;
        if (contentIcon) this.iconName = contentIcon;
        this._updateTitle();

        this.undockInitiator = new UndockInitiator(this.elementTitle, this.performUndockToDialog.bind(this));
        delete this.floatingDialog;
    }


    hideCloseButton(state: Boolean) {
        this.elementButtonClose.style.display = state ? 'none' : 'block';
        this.eventListeners.forEach((listener) => {
            if (listener.onHideCloseButton) {
                listener.onHideCloseButton({ self: this, state: state });
            }
        });
    }


    destroy() {
        Utils.removeNode(this.elementPanel);
        if (this.closeButtonClickedHandler) {
            this.closeButtonClickedHandler.cancel();
            delete this.closeButtonClickedHandler;
        }
    }

    /**
     * Undocks the panel and and converts it to a dialog box
     */
    performUndockToDialog(e, dragOffset) {
        this.isDialog = true;
        this.undockInitiator.enabled = false;
        this.elementContent.style.display = "block";
        this.elementPanel.style.position = "";
        return this.dockManager.requestUndockToDialog(this, e, dragOffset);
    }

    /**
    * Closes the panel
    */
    performClose() {
        this.isDialog = true;
        this.undockInitiator.enabled = false;
        this.elementContent.style.display = "block";
        this.elementPanel.style.position = "";
        this.dockManager.requestClose(this);
    }

    /**
     * Undocks the container and from the layout hierarchy
     * The container would be removed from the DOM
     */
    performUndock() {
        this.undockInitiator.enabled = false;
        this.dockManager.requestUndock(this);
    };

    prepareForDocking() {
        this.isDialog = false;
        this.undockInitiator.enabled = this._canUndock;
    }

    get width(): number {
        return this._cachedWidth;
    }
    set width(value: number) {
        if (value !== this._cachedWidth) {
            this._cachedWidth = value;
            this.elementPanel.style.width = value + 'px';
        }
    }

    get height(): number {
        return this._cachedHeight;
    }
    set height(value: number) {
        if (value !== this._cachedHeight) {
            this._cachedHeight = value;
            this.elementPanel.style.height = value + 'px';
        }
    }


    resize(width, height) {
        // if (this._cachedWidth === width && this._cachedHeight === height)
        // {
        //     // Already in the desired size
        //     return;
        // }
        this._setPanelDimensions(width, height);
        this._cachedWidth = width;
        this._cachedHeight = height;
        try {
            if (this.elementContent != undefined && (typeof this.elementContent.resizeHandler == 'function'))
                this.elementContent.resizeHandler(width, height - this.elementTitle.clientHeight);
        } catch (err) {
            console.log("error calling resizeHandler:", err, " elt:", this.elementContent);
        }
    }

    _setPanelDimensions(width, height) {
        this.elementTitle.style.width = width + 'px';
        this.elementContentHost.style.width = width + 'px';
        this.elementContent.style.width = width + 'px';
        this.elementPanel.style.width = width + 'px';

        var titleBarHeight = this.elementTitle.clientHeight;
        var contentHeight = height - titleBarHeight;
        this.elementContentHost.style.height = contentHeight + 'px';
        this.elementContent.style.height = contentHeight + 'px';
        this.elementPanel.style.height = height + 'px';
    }

    setTitle(title) {
        this.title = title;
        this._updateTitle();
        if (this.onTitleChanged)
            this.onTitleChanged(this, title);
    }

    setTitleIcon(iconName) {
        this.iconName = iconName;
        this._updateTitle();
        if (this.onTitleChanged)
            this.onTitleChanged(this, this.title);
    }

    setTitleIconTemplate(iconTemplate) {
        this.iconTemplate = iconTemplate;
        this._updateTitle();
        if (this.onTitleChanged)
            this.onTitleChanged(this, this.title);
    }

    setCloseIconTemplate(closeIconTemplate) {
        this.elementButtonClose.innerHTML = closeIconTemplate();
    }

    _updateTitle() {
        if (this.iconTemplate !== null) {
            this.elementTitleText.innerHTML = this.iconTemplate(this.iconName) + this.title;
            return;
        }
        this.elementTitleText.innerHTML = '<i class="' + this.iconName + '"></i> ' + this.title;
    }

    getRawTitle() {
        return this.elementTitleText.innerHTML;
    }

    performLayout(children) {
    }

    onCloseButtonClicked() {
        this.close();
    }

    close() {
        if (this.isDialog) {
            this.floatingDialog.hide();
            this.floatingDialog.remove();
        }
        else {
            this.performClose();
        }
        this.dockManager.notifyOnClosePanel(this);
    }
}