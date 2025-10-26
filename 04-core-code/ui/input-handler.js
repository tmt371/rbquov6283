// File: 04-core-code/ui/input-handler.js

import { LeftPanelInputHandler } from './left-panel-input-handler.js';
import { EVENTS, DOM_IDS } from '../config/constants.js';

export class InputHandler {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
        this.leftPanelHandler = new LeftPanelInputHandler(eventAggregator);
        this.longPressTimer = null;
        this.pressThreshold = 500; // 500ms for a long press
        this.isLongPress = false;
    }

    initialize() {
        this._setupNumericKeyboard();
        this._setupTableInteraction();
        this._setupFunctionKeys();
        this._setupPanelToggles();
        this._setupFileLoader();
        this._setupPhysicalKeyboard();
        
        this.leftPanelHandler.initialize();
    }

    _setupPhysicalKeyboard() {
        window.addEventListener('keydown', (event) => {
            // [MODIFIED] Added 'textarea' to the selector to prevent the handler
            // from intercepting its keyboard events, thus fixing the backspace bug.
            if (event.target.matches('input:not([readonly]), textarea')) {
                return;
            }
            
            let keyToPublish = null;
            let eventToPublish = EVENTS.NUMERIC_KEY_PRESSED;
            const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if (arrowKeys.includes(event.key)) {
                event.preventDefault();
                const direction = event.key.replace('Arrow', '').toLowerCase();
                this.eventAggregator.publish(EVENTS.USER_MOVED_ACTIVE_CELL, { direction });
                return;
            }
            if (event.key >= '0' && event.key <= '9') {
                keyToPublish = event.key;
            } 
            // [FIX] Add a check to ensure event.key is not null or undefined before calling .toLowerCase()
            else if (event.key) {
                switch (event.key.toLowerCase()) {
                    case 'w': keyToPublish = 'W'; break;
                    case 'h': keyToPublish = 'H'; break;
                    case 't': this.eventAggregator.publish(EVENTS.USER_REQUESTED_CYCLE_TYPE); return;
                    case '$': this.eventAggregator.publish(EVENTS.USER_REQUESTED_CALCULATE_AND_SUM); return;
                    case 'enter': keyToPublish = 'ENT'; event.preventDefault(); break;
                    case 'backspace': keyToPublish = 'DEL'; event.preventDefault(); break;
                    case 'delete': eventToPublish = EVENTS.USER_REQUESTED_CLEAR_ROW; break;
                }
            }
            if (keyToPublish !== null) {
                this.eventAggregator.publish(eventToPublish, { key: keyToPublish });
            } else if (eventToPublish === EVENTS.USER_REQUESTED_CLEAR_ROW) {
                this.eventAggregator.publish(eventToPublish);
            }
        });
    }

    _setupFileLoader() {
        const fileLoader = document.getElementById(DOM_IDS.FILE_LOADER);
        if (fileLoader) {
            fileLoader.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) { return; }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    this.eventAggregator.publish(EVENTS.FILE_LOADED, { fileName: file.name, content: content });
                };
                reader.onerror = () => {
                    this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: `Error reading file: ${reader.error}`, type: 'error' });
                };
                reader.readAsText(file);
                event.target.value = '';
            });
        }
        this.eventAggregator.subscribe(EVENTS.TRIGGER_FILE_LOAD, () => {
            if (fileLoader) {
                fileLoader.click();
            }
        });
    }
    
    _setupPanelToggles() {
        const numericToggle = document.getElementById(DOM_IDS.PANEL_TOGGLE);
        if (numericToggle) {
            numericToggle.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_TOGGLED_NUMERIC_KEYBOARD);
            });
        }
    }

    _setupFunctionKeys() {
        const setupButton = (id, eventName) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => {
                    this.eventAggregator.publish(eventName);
                });
            }
        };

        // These are buttons located outside the main grid (e.g., in the top control bar)
        setupButton('key-reset', EVENTS.USER_REQUESTED_RESET);
        setupButton(DOM_IDS.KEY_M_SET, EVENTS.USER_REQUESTED_MULTI_TYPE_SET);
    }
    
    _setupNumericKeyboard() {
        const keyboard = document.getElementById(DOM_IDS.NUMERIC_KEYBOARD);
        if (!keyboard) return;

        const addLongPressSupport = (button, longPressEventName, clickEventName, data = {}) => {
            const startPress = (e) => {
                e.preventDefault();
                this.isLongPress = false;
                this.longPressTimer = setTimeout(() => {
                    this.isLongPress = true;
                    this.eventAggregator.publish(longPressEventName, data);
                }, this.pressThreshold);
            };

            const endPress = (e) => {
                clearTimeout(this.longPressTimer);
                if (!this.isLongPress && clickEventName) {
                    this.eventAggregator.publish(clickEventName, data);
                }
            };

            button.addEventListener('mousedown', startPress);
            button.addEventListener('touchstart', startPress, { passive: false });
            button.addEventListener('mouseup', endPress);
            button.addEventListener('mouseleave', () => clearTimeout(this.longPressTimer));
            button.addEventListener('touchend', endPress);
        };
        
        const addButtonListener = (id, eventName, data = {}) => {
            const button = document.getElementById(id);
            if(button) {
                if (id === 'key-type') {
                    addLongPressSupport(button, EVENTS.TYPE_BUTTON_LONG_PRESSED, EVENTS.USER_REQUESTED_CYCLE_TYPE, data);
                } else {
                    button.addEventListener('click', () => {
                        this.eventAggregator.publish(eventName, data);
                    });
                }
            }
        };

        // Main grid keys
        addButtonListener('key-7', EVENTS.NUMERIC_KEY_PRESSED, { key: '7' });
        addButtonListener('key-8', EVENTS.NUMERIC_KEY_PRESSED, { key: '8' });
        addButtonListener('key-9', EVENTS.NUMERIC_KEY_PRESSED, { key: '9' });
        addButtonListener('key-4', EVENTS.NUMERIC_KEY_PRESSED, { key: '4' });
        addButtonListener('key-5', EVENTS.NUMERIC_KEY_PRESSED, { key: '5' });
        addButtonListener('key-6', EVENTS.NUMERIC_KEY_PRESSED, { key: '6' });
        addButtonListener('key-1', EVENTS.NUMERIC_KEY_PRESSED, { key: '1' });
        addButtonListener('key-2', EVENTS.NUMERIC_KEY_PRESSED, { key: '2' });
        addButtonListener('key-3', EVENTS.NUMERIC_KEY_PRESSED, { key: '3' });
        addButtonListener('key-0', EVENTS.NUMERIC_KEY_PRESSED, { key: '0' });
        
        // Function keys within the grid
        addButtonListener('key-w', EVENTS.NUMERIC_KEY_PRESSED, { key: 'W' });
        addButtonListener('key-h', EVENTS.NUMERIC_KEY_PRESSED, { key: 'H' });
        addButtonListener('key-price', EVENTS.USER_REQUESTED_CALCULATE_AND_SUM);
        addButtonListener('key-type', EVENTS.USER_REQUESTED_CYCLE_TYPE);
        addButtonListener('key-del', EVENTS.NUMERIC_KEY_PRESSED, { key: 'DEL' });
        addButtonListener('key-enter', EVENTS.NUMERIC_KEY_PRESSED, { key: 'ENT' });
        addButtonListener('key-clear', EVENTS.USER_REQUESTED_CLEAR_ROW);

        addButtonListener(DOM_IDS.KEY_INS_GRID, EVENTS.USER_REQUESTED_INSERT_ROW);
    }

    _setupTableInteraction() {
        const table = document.getElementById(DOM_IDS.RESULTS_TABLE);
        if (table) {
            const startPress = (e) => {
                const target = e.target;
                if (target.tagName === 'TD' && target.dataset.column === 'TYPE') {
                    this.isLongPress = false;
                    this.longPressTimer = setTimeout(() => {
                        this.isLongPress = true;
                        const rowIndex = target.parentElement.dataset.rowIndex;
                        this.eventAggregator.publish(EVENTS.TYPE_CELL_LONG_PRESSED, { rowIndex: parseInt(rowIndex, 10) });
                    }, this.pressThreshold);
                }
            };
            
            const endPress = (e) => {
                clearTimeout(this.longPressTimer);

                if (!this.isLongPress) {
                    const target = e.target;
                    if (target.tagName === 'TD') {
                        const column = target.dataset.column;
                        const rowIndex = target.parentElement.dataset.rowIndex;
                        if (column && rowIndex) {
                            const eventData = { rowIndex: parseInt(rowIndex, 10), column };
                            if (column === 'sequence') {
                                this.eventAggregator.publish(EVENTS.SEQUENCE_CELL_CLICKED, eventData);
                            } else {
                                this.eventAggregator.publish(EVENTS.TABLE_CELL_CLICKED, eventData);
                            }
                        }
                    }
                }
                this.isLongPress = false;
            };

            table.addEventListener('mousedown', startPress);
            table.addEventListener('touchstart', startPress, { passive: false });
            
            table.addEventListener('mouseup', endPress);
            
            table.addEventListener('touchend', (e) => {
                e.preventDefault();
                endPress(e);
            });

            table.addEventListener('mouseleave', () => {
                clearTimeout(this.longPressTimer);
            }, true);
        }
    }
}