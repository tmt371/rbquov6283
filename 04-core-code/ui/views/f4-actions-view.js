// File: 04-core-code/ui/views/f4-actions-view.js

import { EVENTS } from '../../config/constants.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the F4 (Actions) tab.
 */
export class F4ActionsView {
    constructor({ panelElement, eventAggregator }) {
        this.panelElement = panelElement;
        this.eventAggregator = eventAggregator;

        this._cacheF4Elements();
        this._initializeF4Listeners();
        console.log("F4ActionsView Initialized.");
    }

    _cacheF4Elements() {
        const query = (id) => this.panelElement.querySelector(id);
        this.f4 = {
            buttons: {
                'f1-key-save': query('#f1-key-save'),
                'f1-key-export': query('#f1-key-export'),
                'f1-key-load': query('#f1-key-load'),
                'f1-key-reset': query('#f1-key-reset'),
            }
        };
    }

    _initializeF4Listeners() {
        const buttonEventMap = {
            'f1-key-save': EVENTS.USER_REQUESTED_SAVE,
            'f1-key-export': EVENTS.USER_REQUESTED_EXPORT_CSV,
            'f1-key-load': EVENTS.USER_REQUESTED_LOAD,
            'f1-key-reset': EVENTS.USER_REQUESTED_RESET
        };

        for (const [id, eventName] of Object.entries(buttonEventMap)) {
            const button = this.f4.buttons[id];
            if (button) {
                button.addEventListener('click', () => this.eventAggregator.publish(eventName));
            }
        }
    }

    // This view is static and doesn't require render or activate methods.
}