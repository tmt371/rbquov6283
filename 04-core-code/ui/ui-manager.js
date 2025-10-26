// File: 04-core-code/ui/ui-manager.js

import { TableComponent } from './table-component.js';
import { SummaryComponent } from './summary-component.js';
import { PanelComponent } from './panel-component.js';
import { NotificationComponent } from './notification-component.js';
import { DialogComponent } from './dialog-component.js';
import { LeftPanelComponent } from './left-panel-component.js';
import { EVENTS, DOM_IDS } from '../config/constants.js';

export class UIManager {
    constructor({ appElement, eventAggregator, calculationService, rightPanelComponent }) {
        this.appElement = appElement;
        this.eventAggregator = eventAggregator;
        this.calculationService = calculationService;
        this.rightPanelComponent = rightPanelComponent; // [MODIFIED] Receive instance

        this.numericKeyboardPanel = document.getElementById(DOM_IDS.NUMERIC_KEYBOARD_PANEL);

        this.insertButton = document.getElementById('key-ins-grid');
        this.clearButton = document.getElementById('key-clear');

        this.leftPanelElement = document.getElementById(DOM_IDS.LEFT_PANEL);

        const tableElement = document.getElementById(DOM_IDS.RESULTS_TABLE);
        this.tableComponent = new TableComponent(tableElement);

        const summaryElement = document.getElementById(DOM_IDS.TOTAL_SUM_VALUE);
        this.summaryComponent = new SummaryComponent(summaryElement);

        this.leftPanelComponent = new LeftPanelComponent(this.leftPanelElement);

        this.functionPanel = new PanelComponent({
            panelElement: document.getElementById(DOM_IDS.FUNCTION_PANEL),
            toggleElement: document.getElementById(DOM_IDS.FUNCTION_PANEL_TOGGLE),
            eventAggregator: this.eventAggregator,
            expandedClass: 'is-expanded',
            retractEventName: EVENTS.OPERATION_SUCCESSFUL_AUTO_HIDE_PANEL,
            // [NEW] Add onToggle callback to default to F1 tab when opened.
            onToggle: (isExpanded) => {
                if (isExpanded) {
                    this.rightPanelComponent.setActiveTab('f1-tab');
                }
            }
        });

        // [REMOVED] Self-instantiation of RightPanelComponent is removed.

        this.notificationComponent = new NotificationComponent({
            containerElement: document.getElementById(DOM_IDS.TOAST_CONTAINER),
            eventAggregator: this.eventAggregator
        });

        this.dialogComponent = new DialogComponent({
            overlayElement: document.getElementById(DOM_IDS.CONFIRMATION_DIALOG_OVERLAY),
            eventAggregator: this.eventAggregator
        });

        this.initialize();
    }

    initialize() {
        this.eventAggregator.subscribe(EVENTS.USER_TOGGLED_NUMERIC_KEYBOARD, () => this._toggleNumericKeyboard());

        // [NEW] Add a global listener for focus events.
        this.eventAggregator.subscribe(EVENTS.FOCUS_ELEMENT, ({ elementId }) => {
            const element = document.getElementById(elementId);
            if (element) {
                setTimeout(() => {
                    element.focus();
                    if (typeof element.select === 'function') {
                        element.select();
                    }
                }, 50); // A small delay to ensure the element is rendered and focusable.
            }
        });

        this._initializeResizeObserver();
    }

    _initializeResizeObserver() {
        const resizeObserver = new ResizeObserver(() => {
            if (this.leftPanelElement.classList.contains('is-expanded')) {
                this._updateExpandedPanelPosition();
            }
        });
        resizeObserver.observe(this.appElement);
    }

    _updateExpandedPanelPosition() {
        if (!this.leftPanelElement || !this.numericKeyboardPanel) return;

        const key7 = this.numericKeyboardPanel.querySelector('#key-7');
        const key0 = this.numericKeyboardPanel.querySelector('#key-0');
        const typeKey = this.numericKeyboardPanel.querySelector('#key-type');

        if (!key7 || !key0 || !typeKey) {
            console.error("One or more reference elements for panel positioning are missing.");
            return;
        }

        const key7Rect = key7.getBoundingClientRect();
        const key0Rect = key0.getBoundingClientRect();
        const typeKeyRect = typeKey.getBoundingClientRect();

        const newTop = key7Rect.top;
        const newWidth = typeKeyRect.left + (typeKeyRect.width / 2);
        const newHeight = key0Rect.bottom - key7Rect.top;

        this.leftPanelElement.style.top = `${newTop}px`;
        this.leftPanelElement.style.width = `${newWidth}px`;
        this.leftPanelElement.style.height = `${newHeight}px`;

        this.leftPanelElement.style.setProperty('--left-panel-width', `${newWidth}px`);
    }

    render(state) {
        const isDetailView = state.ui.currentView === 'DETAIL_CONFIG';
        this.appElement.classList.toggle('detail-view-active', isDetailView);

        const currentProductKey = state.quoteData.currentProduct;
        const currentProductData = state.quoteData.products[currentProductKey];

        this.tableComponent.render(state);
        this.summaryComponent.render(currentProductData.summary, state.ui.isSumOutdated);
        this.leftPanelComponent.render(state.ui, state.quoteData);
        this.rightPanelComponent.render(state);

        this._updateButtonStates(state);
        this._updateLeftPanelState(state.ui.currentView);
        this._scrollToActiveCell(state);
    }

    _updateLeftPanelState(currentView) {
        if (this.leftPanelElement) {
            const isExpanded = (currentView === 'DETAIL_CONFIG');
            this.leftPanelElement.classList.toggle('is-expanded', isExpanded);

            if (isExpanded) {
                setTimeout(() => this._updateExpandedPanelPosition(), 0);
            }
        }
    }

    _updateButtonStates(state) {
        const { multiSelectSelectedIndexes } = state.ui;
        const currentProductKey = state.quoteData.currentProduct;
        const items = state.quoteData.products[currentProductKey].items;

        const selectionCount = multiSelectSelectedIndexes.length;
        const isSingleSelection = selectionCount === 1;

        // --- Insert Button Logic ---
        let insertDisabled = true;
        if (isSingleSelection) {
            const selectedIndex = multiSelectSelectedIndexes[0];
            const isLastRow = selectedIndex === items.length - 1;
            if (!isLastRow) {
                const nextItem = items[selectedIndex + 1];
                const isNextRowEmpty = !nextItem.width && !nextItem.height && !nextItem.fabricType;
                if (!isNextRowEmpty) {
                    insertDisabled = false;
                }
            }
        }
        if (this.insertButton) this.insertButton.disabled = insertDisabled;

        // --- Clear Button Logic ---
        let clearDisabled = !isSingleSelection; // Disable if not a single selection
        if (isSingleSelection) {
            const selectedIndex = multiSelectSelectedIndexes[0];
            const itemsLength = items.length;
            // Also disable if it's the last data row or the final empty row
            if (selectedIndex >= itemsLength - 2) {
                clearDisabled = true;
            }
        }
        if (this.clearButton) this.clearButton.disabled = clearDisabled;
    }

    _scrollToActiveCell(state) {
        if (!state.ui.activeCell) return;
        const { rowIndex, column } = state.ui.activeCell;
        const activeCellElement = document.querySelector(`tr[data-row-index="${rowIndex}"] td[data-column="${column}"]`);
        if (activeCellElement) {
            activeCellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    _toggleNumericKeyboard() {
        if (this.numericKeyboardPanel) {
            this.numericKeyboardPanel.classList.toggle('is-collapsed');
        }
    }
}