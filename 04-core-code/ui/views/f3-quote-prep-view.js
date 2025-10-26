// File: 04-core-code/ui/views/f3-quote-prep-view.js

import { EVENTS, DOM_IDS } from '../../config/constants.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the F3 (Quote Prep) tab.
 */
export class F3QuotePrepView {
    constructor({ panelElement, eventAggregator }) {
        this.panelElement = panelElement;
        this.eventAggregator = eventAggregator;

        this._cacheF3Elements();
        this._initializeF3Listeners();
        console.log("F3QuotePrepView Initialized.");
    }

    _cacheF3Elements() {
        const query = (id) => this.panelElement.querySelector(id);
        this.f3 = {
            inputs: {
                quoteId: query('#f3-quote-id'),
                issueDate: query('#f3-issue-date'),
                dueDate: query('#f3-due-date'),
                customerName: query('#f3-customer-name'),
                customerAddress: query('#f3-customer-address'),
                customerPhone: query('#f3-customer-phone'),
                customerEmail: query('#f3-customer-email'),
                finalOfferPrice: query('#f3-final-offer-price'),
                generalNotes: query('#f3-general-notes'),
                termsConditions: query('#f3-terms-conditions'),
            },
            buttons: {
                addQuote: query(`#${DOM_IDS.BTN_ADD_QUOTE}`),
            }
        };
    }

    _initializeF3Listeners() {
        if (!this.f3.inputs.issueDate) return;

        // --- Date Chaining Logic ---
        this.f3.inputs.issueDate.addEventListener('input', (event) => {
            const issueDateValue = event.target.value;
            if (issueDateValue) {
                const issueDate = new Date(issueDateValue);
                // Adjust for timezone offset to prevent day-before issues
                issueDate.setMinutes(issueDate.getMinutes() + issueDate.getTimezoneOffset());

                const dueDate = new Date(issueDate);
                dueDate.setDate(dueDate.getDate() + 14);

                const year = dueDate.getFullYear();
                const month = String(dueDate.getMonth() + 1).padStart(2, '0');
                const day = String(dueDate.getDate()).padStart(2, '0');

                this.f3.inputs.dueDate.value = `${year}-${month}-${day}`;
            }
        });

        // --- Add Quote Button Listener ---
        if (this.f3.buttons.addQuote) {
            this.f3.buttons.addQuote.addEventListener('click', () => {
                this.eventAggregator.publish(EVENTS.USER_REQUESTED_PRINTABLE_QUOTE);
            });
        }

        // --- Focus Jumping Logic ---
        const focusOrder = [
            'quoteId', 'issueDate', 'dueDate', 'customerName', 'customerAddress',
            'customerPhone', 'customerEmail', 'finalOfferPrice', 'generalNotes', 'termsConditions'
        ];

        focusOrder.forEach((key, index) => {
            const currentElement = this.f3.inputs[key];
            if (currentElement) {
                currentElement.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
                        event.preventDefault();
                        event.stopPropagation(); // Stop the event from bubbling up
                        const nextIndex = index + 1;
                        if (nextIndex < focusOrder.length) {
                            const nextKey = focusOrder[nextIndex];
                            this.f3.inputs[nextKey]?.focus();
                        } else {
                            this.f3.buttons.addQuote?.focus();
                        }
                    }
                });
            }
        });
    }

    render() {
        if (!this.f3.inputs.quoteId) return;

        // Only fill if the fields are empty, to preserve manual changes.
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');

        if (!this.f3.inputs.quoteId.value) this.f3.inputs.quoteId.value = `RB${year}${month}${day}${hours}`;
        if (!this.f3.inputs.issueDate.value) this.f3.inputs.issueDate.value = formatDate(now);
        if (!this.f3.inputs.dueDate.value) {
            const dueDate = new Date();
            dueDate.setDate(now.getDate() + 14);
            this.f3.inputs.dueDate.value = formatDate(dueDate);
        }
    }

    activate() {
        // This method is called when the tab becomes active.
        // The render logic will automatically handle pre-filling empty fields.
        this.render();
    }
}