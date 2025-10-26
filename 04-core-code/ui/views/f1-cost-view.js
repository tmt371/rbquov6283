// File: 04-core-code/ui/views/f1-cost-view.js

import { EVENTS, DOM_IDS } from '../../config/constants.js';
import * as uiActions from '../../actions/ui-actions.js';

/**
 * @fileoverview A dedicated sub-view for handling all logic related to the F1 (Cost) tab.
 */
export class F1CostView {
    constructor({ panelElement, eventAggregator, calculationService, stateService }) {
        this.panelElement = panelElement;
        this.eventAggregator = eventAggregator;
        this.calculationService = calculationService;
        this.stateService = stateService; // [NEW] Injected dependency

        this._cacheF1Elements();
        this._initializeF1Listeners();
        console.log("F1CostView Initialized.");
    }

    _cacheF1Elements() {
        const query = (id) => this.panelElement.querySelector(id);
        this.f1 = {
            inputs: {
                'discount': query(`#${DOM_IDS.F1_RB_DISCOUNT_INPUT}`),
            },
            displays: {
                qty: {
                    'winder': query(`#${DOM_IDS.F1_QTY_WINDER}`),
                    'motor': query(`#${DOM_IDS.F1_QTY_MOTOR}`),
                    'remote-1ch': query(`#${DOM_IDS.F1_QTY_REMOTE_1CH}`),
                    'remote-16ch': query(`#${DOM_IDS.F1_QTY_REMOTE_16CH}`),
                    'charger': query(`#${DOM_IDS.F1_QTY_CHARGER}`),
                    '3m-cord': query(`#${DOM_IDS.F1_QTY_3M_CORD}`),
                    'dual-combo': query(`#${DOM_IDS.F1_QTY_DUAL_COMBO}`),
                    'slim': query(`#${DOM_IDS.F1_QTY_SLIM}`),
                },
                price: {
                    'winder': query(`#${DOM_IDS.F1_PRICE_WINDER}`),
                    'motor': query(`#${DOM_IDS.F1_PRICE_MOTOR}`),
                    'remote-1ch': query(`#${DOM_IDS.F1_PRICE_REMOTE_1CH}`),
                    'remote-16ch': query(`#${DOM_IDS.F1_PRICE_REMOTE_16CH}`),
                    'charger': query(`#${DOM_IDS.F1_PRICE_CHARGER}`),
                    '3m-cord': query(`#${DOM_IDS.F1_PRICE_3M_CORD}`),
                    'dual-combo': query(`#${DOM_IDS.F1_PRICE_DUAL_COMBO}`),
                    'slim': query(`#${DOM_IDS.F1_PRICE_SLIM}`),
                    'total': query(`#${DOM_IDS.F1_PRICE_TOTAL}`),
                    'rb-retail': query(`#${DOM_IDS.F1_RB_RETAIL}`),
                    'rb-price': query(`#${DOM_IDS.F1_RB_PRICE}`),
                    'sub-total': query(`#${DOM_IDS.F1_SUB_TOTAL}`),
                    'gst': query(`#${DOM_IDS.F1_GST}`),
                    'final-total': query(`#${DOM_IDS.F1_FINAL_TOTAL}`),
                }
            }
        };
    }

    _initializeF1Listeners() {
        const remote1chQtyDiv = this.f1.displays.qty['remote-1ch'];
        if (remote1chQtyDiv) {
            // [REFACTORED] Directly call the handler instead of publishing an event
            remote1chQtyDiv.addEventListener('click', () => this.handleRemoteDistribution());
        }

        const slimQtyDiv = this.f1.displays.qty['slim'];
        if (slimQtyDiv) {
            // [REFACTORED] Directly call the handler instead of publishing an event
            slimQtyDiv.addEventListener('click', () => this.handleDualDistribution());
        }

        const discountInput = this.f1.inputs['discount'];
        if (discountInput) {
            discountInput.addEventListener('input', (event) => {
                const percentage = parseFloat(event.target.value) || 0;
                this.eventAggregator.publish(EVENTS.F1_DISCOUNT_CHANGED, { percentage });
            });

            // [NEW] Add blur on Enter key press
            discountInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.target.blur();
                }
            });
        }
    }

    render(state) {
        if (!this.f1 || !state || !state.quoteData || !state.ui) return;

        const { quoteData, ui } = state;
        const items = quoteData.products.rollerBlind.items;
        const formatPrice = (price) => (typeof price === 'number' && price > 0 ? `$${price.toFixed(2)}` : '');
        const formatDisplay = (value) => (value !== null && value !== undefined) ? value : '';

        // --- Component Cost Calculation ---
        const componentPrices = {};
        const winderQty = items.filter(item => item.winder === 'HD').length;
        componentPrices.winder = this.calculationService.calculateF1ComponentPrice('winder', winderQty);
        this.f1.displays.qty.winder.textContent = winderQty;

        const motorQty = items.filter(item => !!item.motor).length;
        componentPrices.motor = this.calculationService.calculateF1ComponentPrice('motor', motorQty);
        this.f1.displays.qty.motor.textContent = motorQty;

        const totalRemoteQty = ui.driveRemoteCount || 0;
        const remote1chQty = ui.f1.remote_1ch_qty;
        const remote16chQty = (ui.f1.remote_1ch_qty === null) ? totalRemoteQty : (totalRemoteQty - remote1chQty);
        componentPrices['remote-1ch'] = this.calculationService.calculateF1ComponentPrice('remote-1ch', remote1chQty);
        componentPrices['remote-16ch'] = this.calculationService.calculateF1ComponentPrice('remote-16ch', remote16chQty);
        this.f1.displays.qty['remote-1ch'].textContent = remote1chQty;
        this.f1.displays.qty['remote-16ch'].textContent = remote16chQty;

        const chargerQty = ui.driveChargerCount || 0;
        componentPrices.charger = this.calculationService.calculateF1ComponentPrice('charger', chargerQty);
        this.f1.displays.qty.charger.textContent = chargerQty;

        const cordQty = ui.driveCordCount || 0;
        componentPrices['3m-cord'] = this.calculationService.calculateF1ComponentPrice('3m-cord', cordQty);
        this.f1.displays.qty['3m-cord'].textContent = cordQty;

        const totalDualPairs = Math.floor(items.filter(item => item.dual === 'D').length / 2);
        const comboQty = (ui.f1.dual_combo_qty === null) ? totalDualPairs : ui.f1.dual_combo_qty;
        const slimQty = (ui.f1.dual_slim_qty === null) ?
            0 : ui.f1.dual_slim_qty;
        componentPrices['dual-combo'] = this.calculationService.calculateF1ComponentPrice('dual-combo', comboQty);
        componentPrices.slim = this.calculationService.calculateF1ComponentPrice('slim', slimQty);
        this.f1.displays.qty['dual-combo'].textContent = comboQty;
        this.f1.displays.qty.slim.textContent = slimQty;

        for (const [key, price] of Object.entries(componentPrices)) {
            if (this.f1.displays.price[key]) {
                this.f1.displays.price[key].textContent = formatPrice(price);
            }
        }
        const componentTotal = Object.values(componentPrices).reduce((sum, price) => sum + price, 0);
        this.f1.displays.price.total.textContent = formatPrice(componentTotal);

        // --- RB Pricing Calculation ---
        const retailTotal = quoteData.products.rollerBlind.summary.totalSum || 0;
        const discountPercentage = ui.f1.discountPercentage || 0;
        const rbPrice = retailTotal * (1 - (discountPercentage / 100));

        this.f1.displays.price['rb-retail'].textContent = formatPrice(retailTotal);
        if (document.activeElement !== this.f1.inputs.discount) {
            this.f1.inputs.discount.value = formatDisplay(discountPercentage) || '';
        }
        this.f1.displays.price['rb-price'].textContent = formatPrice(rbPrice);

        // --- Final Summary Calculation ---
        const subTotal = componentTotal + rbPrice;
        const gst = subTotal * 0.10;
        const finalTotal = subTotal + gst;

        this.f1.displays.price['sub-total'].textContent = formatPrice(subTotal);
        this.f1.displays.price.gst.textContent = formatPrice(gst);
        this.f1.displays.price['final-total'].textContent = formatPrice(finalTotal);
    }

    activate() {
        this.eventAggregator.publish(EVENTS.F1_TAB_ACTIVATED);

        // [NEW] Focus on the discount input when the tab is activated.
        setTimeout(() => {
            const discountInput = this.f1.inputs.discount;
            if (discountInput) {
                discountInput.focus();
                discountInput.select();
            }
        }, 50); // A small delay ensures the element is visible and focusable.
    }

    // --- [NEW] Methods migrated from WorkflowService ---

    handleRemoteDistribution() {
        const { ui } = this.stateService.getState();
        const totalRemoteCount = ui.driveRemoteCount || 0;

        const initial1ch = ui.f1.remote_1ch_qty;
        const initial16ch = (ui.f1.remote_16ch_qty === null) ? totalRemoteCount - initial1ch : ui.f1.remote_16ch_qty;

        this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
            message: `Total remotes: ${totalRemoteCount}. Please distribute them.`,
            layout: [
                [
                    { type: 'text', text: '1-Ch Qty:', className: 'dialog-label' },
                    { type: 'input', id: DOM_IDS.DIALOG_INPUT_1CH, value: initial1ch },
                    { type: 'text', text: '16-Ch Qty:', className: 'dialog-label' },
                    { type: 'input', id: DOM_IDS.DIALOG_INPUT_16CH, value: initial16ch }
                ],
                [
                    {
                        type: 'button',
                        text: 'Confirm',
                        className: 'primary-confirm-button',
                        colspan: 2,
                        callback: () => {
                            const qty1ch = parseInt(document.getElementById(DOM_IDS.DIALOG_INPUT_1CH).value, 10);
                            const qty16ch = parseInt(document.getElementById(DOM_IDS.DIALOG_INPUT_16CH).value, 10);

                            if (isNaN(qty1ch) || isNaN(qty16ch) || qty1ch < 0 || qty16ch < 0) {
                                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Quantities must be positive numbers.', type: 'error' });
                                return false;
                            }

                            if (qty1ch + qty16ch !== totalRemoteCount) {
                                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, {
                                    message: `Total must equal ${totalRemoteCount}. Current total: ${qty1ch + qty16ch}.`,
                                    type: 'error'
                                });
                                return false;
                            }

                            this.stateService.dispatch(uiActions.setF1RemoteDistribution(qty1ch, qty16ch));
                            return true;
                        }
                    },
                    { type: 'button', text: 'Cancel', className: 'secondary', colspan: 2, callback: () => { } }
                ]
            ],
            onOpen: () => {
                const input1ch = document.getElementById(DOM_IDS.DIALOG_INPUT_1CH);
                const input16ch = document.getElementById(DOM_IDS.DIALOG_INPUT_16CH);

                input1ch.addEventListener('input', () => {
                    const qty1ch = parseInt(input1ch.value, 10);
                    if (!isNaN(qty1ch) && qty1ch >= 0 && qty1ch <= totalRemoteCount) {
                        input16ch.value = totalRemoteCount - qty1ch;
                    }
                });

                input16ch.addEventListener('input', () => {
                    const qty16ch = parseInt(input16ch.value, 10);
                    if (!isNaN(qty16ch) && qty16ch >= 0 && qty16ch <= totalRemoteCount) {
                        input1ch.value = totalRemoteCount - qty16ch;
                    }
                });

                setTimeout(() => {
                    input1ch.focus();
                    input1ch.select();
                }, 0);
            },
            closeOnOverlayClick: false
        });
    }

    handleDualDistribution() {
        const { quoteData, ui } = this.stateService.getState();
        const items = quoteData.products[quoteData.currentProduct].items;
        const totalDualPairs = Math.floor(items.filter(item => item.dual === 'D').length / 2);

        const initialCombo = (ui.f1.dual_combo_qty === null) ? totalDualPairs : ui.f1.dual_combo_qty;
        const initialSlim = (ui.f1.dual_slim_qty === null) ? 0 : ui.f1.dual_slim_qty;

        this.eventAggregator.publish(EVENTS.SHOW_CONFIRMATION_DIALOG, {
            message: `Total Dual pairs: ${totalDualPairs}. Please distribute them.`,
            layout: [
                [
                    { type: 'text', text: 'Combo Qty:', className: 'dialog-label' },
                    { type: 'input', id: DOM_IDS.DIALOG_INPUT_COMBO, value: initialCombo },
                    { type: 'text', text: 'Slim Qty:', className: 'dialog-label' },
                    { type: 'input', id: DOM_IDS.DIALOG_INPUT_SLIM, value: initialSlim }
                ],
                [
                    {
                        type: 'button',
                        text: 'Confirm',
                        className: 'primary-confirm-button',
                        colspan: 2,
                        callback: () => {
                            const qtyCombo = parseInt(document.getElementById(DOM_IDS.DIALOG_INPUT_COMBO).value, 10);
                            const qtySlim = parseInt(document.getElementById(DOM_IDS.DIALOG_INPUT_SLIM).value, 10);

                            if (isNaN(qtyCombo) || isNaN(qtySlim) || qtyCombo < 0 || qtySlim < 0) {
                                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: 'Quantities must be positive numbers.', type: 'error' });
                                return false;
                            }

                            if (qtyCombo + qtySlim !== totalDualPairs) {
                                this.eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, {
                                    message: `Total must equal ${totalDualPairs}. Current total: ${qtyCombo + qtySlim}.`,
                                    type: 'error'
                                });
                                return false;
                            }

                            this.stateService.dispatch(uiActions.setF1DualDistribution(qtyCombo, qtySlim));
                            return true;
                        }
                    },
                    { type: 'button', text: 'Cancel', className: 'secondary', colspan: 2, callback: () => { } }
                ]
            ],
            onOpen: () => {
                const inputCombo = document.getElementById(DOM_IDS.DIALOG_INPUT_COMBO);
                const inputSlim = document.getElementById(DOM_IDS.DIALOG_INPUT_SLIM);

                inputSlim.addEventListener('input', () => {
                    const qtySlim = parseInt(inputSlim.value, 10);
                    if (!isNaN(qtySlim) && qtySlim >= 0 && qtySlim <= totalDualPairs) {
                        inputCombo.value = totalDualPairs - qtySlim;
                    }
                });
                inputCombo.addEventListener('input', () => {
                    const qtyCombo = parseInt(inputCombo.value, 10);
                    if (!isNaN(qtyCombo) && qtyCombo >= 0 && qtyCombo <= totalDualPairs) {
                        inputSlim.value = totalDualPairs - qtyCombo;
                    }
                });

                setTimeout(() => {
                    inputSlim.focus();
                    inputSlim.select();
                }, 0);
            },
            closeOnOverlayClick: false
        });
    }
}