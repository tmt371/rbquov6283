// File: 04-core-code/ui/left-panel-input-handler.js

import { EVENTS, DOM_IDS } from '../config/constants.js';

/**
 * @fileoverview A dedicated input handler for all user interactions within the Left Panel.
 */
export class LeftPanelInputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
        console.log("LeftPanelInputHandler Initialized.");
    }

    initialize() {
        this._setupNavigationToggle();
        this._setupTabButtons();
        this._setupK1Inputs();
        this._setupK2Inputs();
        this._setupK3Inputs();
        this._setupK4Inputs();
        this._setupK5Inputs();
    }

    _setupNavigationToggle() {
        const leftPanelToggle = document.getElementById(DOM_IDS.LEFT_PANEL_TOGGLE);
        if (leftPanelToggle) {
            leftPanelToggle.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_NAVIGATED_TO_DETAIL_VIEW);
            });
        }
    }

    _setupTabButtons() {
        const tabContainer = document.querySelector('#left-panel .tab-container');
        if (tabContainer) {
            tabContainer.addEventListener('click', (event) => {
                const target = event.target.closest('.tab-button');
                if (target && !target.disabled) {
                    this.eventAggregator.publish(EVENTS.USER_SWITCHED_TAB, { tabId: target.id });
                }
            });
        }
    }

    _setupK1Inputs() {
        const locationButton = document.getElementById('btn-focus-location');
        if (locationButton) {
            locationButton.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_REQUESTED_FOCUS_MODE, { column: 'location' });
            });
        }

        const locationInput = document.getElementById(DOM_IDS.LOCATION_INPUT_BOX);
        if (locationInput) {
            locationInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.eventAggregator.publish(EVENTS.LOCATION_INPUT_ENTER_PRESSED, {
                        value: event.target.value
                    });
                }
            });
        }
    }

    _setupK2Inputs() {
        const fabricButton = document.getElementById('btn-focus-fabric');
        if (fabricButton) {
            fabricButton.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_REQUESTED_FOCUS_MODE, { column: 'fabric' });
            });
        }
        const lfButton = document.getElementById('btn-light-filter');
        if (lfButton) {
            lfButton.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_REQUESTED_LF_EDIT_MODE);
            });
        }
        const lfDelButton = document.getElementById('btn-lf-del');
        if (lfDelButton) {
            lfDelButton.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_REQUESTED_LF_DELETE_MODE);
            });
        }

        const batchTable = document.getElementById(DOM_IDS.FABRIC_BATCH_TABLE);
        if (batchTable) {
            batchTable.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && event.target.matches('.panel-input')) {
                    event.preventDefault();
                    const input = event.target;
                    this.eventAggregator.publish(EVENTS.PANEL_INPUT_ENTER_PRESSED, {
                        type: input.dataset.type,
                        field: input.dataset.field,
                        value: input.value
                    });
                }
            });
            batchTable.addEventListener('blur', (event) => {
                if (event.target.matches('.panel-input')) {
                    this.eventAggregator.publish(EVENTS.PANEL_INPUT_BLURRED, {
                        type: event.target.dataset.type,
                        field: event.target.dataset.field,
                        value: event.target.value
                    });
                }
            }, true);
        }
    }

    _setupK3Inputs() {
        const editButton = document.getElementById('btn-k3-edit');
        if (editButton) {
            editButton.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_TOGGLED_K3_EDIT_MODE);
            });
        }

        const setupBatchCycleButton = (buttonId, column) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.eventAggregator.publish(EVENTS.USER_REQUESTED_BATCH_CYCLE, { column });
                });
            }
        };
        setupBatchCycleButton('btn-batch-cycle-over', 'over');
        setupBatchCycleButton('btn-batch-cycle-oi', 'oi');
        setupBatchCycleButton('btn-batch-cycle-lr', 'lr');
    }

    _setupK4Inputs() {
        const setupK4Button = (buttonId, mode) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.eventAggregator.publish(EVENTS.DUAL_CHAIN_MODE_CHANGED, { mode });
                });
            }
        };
        setupK4Button('btn-k4-dual', 'dual');
        setupK4Button('btn-k4-chain', 'chain');

        const k4Input = document.getElementById('k4-input-display');
        if (k4Input) {
            k4Input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.eventAggregator.publish(EVENTS.CHAIN_ENTER_PRESSED, {
                        value: event.target.value
                    });
                }
            });
        }
    }

    _setupK5Inputs() {
        const setupK5ModeButton = (buttonId, mode) => {
            const button = document.getElementById(buttonId);
            if (button) {
                // [REFACTOR] Removed special handling for the remote button.
                // It now fires a standard 'driveModeChanged' event, same as other accessory buttons.
                button.addEventListener('click', () => {
                    this.eventAggregator.publish(EVENTS.DRIVE_MODE_CHANGED, { mode });
                });
            }
        };
        setupK5ModeButton('btn-k5-winder', 'winder');
        setupK5ModeButton('btn-k5-motor', 'motor');
        setupK5ModeButton('btn-k5-remote', 'remote');
        setupK5ModeButton('btn-k5-charger', 'charger');
        setupK5ModeButton('btn-k5-3m-cord', 'cord');

        const setupK5CounterButton = (buttonId, accessory, direction) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.eventAggregator.publish(EVENTS.ACCESSORY_COUNTER_CHANGED, { accessory, direction });
                });
            }
        };
        setupK5CounterButton('btn-k5-remote-add', 'remote', 'add');
        setupK5CounterButton('btn-k5-remote-subtract', 'remote', 'subtract');
        setupK5CounterButton('btn-k5-charger-add', 'charger', 'add');
        setupK5CounterButton('btn-k5-charger-subtract', 'charger', 'subtract');
        setupK5CounterButton('btn-k5-cord-add', 'cord', 'add');
        setupK5CounterButton('btn-k5-cord-subtract', 'cord', 'subtract');
    }
}