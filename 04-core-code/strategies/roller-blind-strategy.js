// File: 04-core-code/strategies/roller-blind-strategy.js

/**
 * @fileoverview Contains all business logic specific to the Roller Blind product.
 * This includes price calculation, validation rules, etc.
 */

// [MODIFIED] Changed the import from a bare module specifier to a browser-compatible CDN URL.
import { v4 as uuidv4 } from 'https://cdn.jsdelivr.net/npm/uuid@9.0.1/dist/esm-browser/index.js';

export class RollerBlindStrategy {
    constructor({ configManager }) {
        this.configManager = configManager;
        console.log("RollerBlindStrategy Initialized.");
    }

    /**
     * Calculates the price for a single roller blind item based on a price matrix.
     */
    calculatePrice(item, priceMatrix) {
        if (!item || !item.width || !item.height || !item.fabricType) {
            return { price: null, error: 'Incomplete item data.' };
        }
        if (!priceMatrix) {
            return { price: null, error: `Price matrix not found for fabric type: ${item.fabricType}` };
        }

        const widthIndex = priceMatrix.widths.findIndex(w => item.width <= w);
        const dropIndex = priceMatrix.drops.findIndex(d => item.height <= d);

        if (widthIndex === -1) {
            const errorMsg = `Width ${item.width} exceeds the maximum width in the price matrix.`;
            return { price: null, error: errorMsg };
        }
        if (dropIndex === -1) {
            const errorMsg = `Height ${item.height} exceeds the maximum height in the price matrix.`;
            return { price: null, error: errorMsg };
        }

        const price = priceMatrix.prices[dropIndex][widthIndex];
        
        return price !== undefined ? { price: price } : { price: null, error: 'Price not found for the given dimensions.' };
    }

    /**
     * [REFACTORED] Returns the validation rules specific to roller blinds by fetching them from ConfigManager.
     * @returns {object}
     */
    getValidationRules() {
        const rules = this.configManager.getValidationRules('rollerBlind');
        if (!rules) {
            // Provide a safe fallback if rules are not found, preventing crashes.
            return {
                width: { name: 'Width' },
                height: { name: 'Height' }
            };
        }
        // Adapt the data from the config to the nested structure expected by the consumers.
        return {
            width: { min: rules.minWidth, max: rules.maxWidth, name: 'Width' },
            height: { min: rules.minHeight, max: rules.maxHeight, name: 'Height' }
        };
    }

    /**
     * Returns a new, empty item object for a roller blind.
     * @returns {object}
     */
    getInitialItemData() {
        return {
            itemId: uuidv4(),
            // --- Phase 1 Fields ---
            width: null,
            height: null,
            fabricType: null,
            linePrice: null,
            // --- Phase 2 Fields ---
            location: '',
            fabric: '',
            color: '',
            over: '',
            oi: '',
            lr: '',
            dual: '',
            chain: null,
            winder: '',
            motor: ''
        };
    }

    // --- Accessory Pricing Logic ---

    calculateDualPrice(items, pricePerPair) {
        const dualCount = items.filter(item => item.dual === 'D').length;
        const totalPrice = Math.floor(dualCount / 2) * pricePerPair;
        return totalPrice;
    }

    calculateWinderPrice(count, pricePerUnit) {
        return count * pricePerUnit;
    }

    calculateMotorPrice(count, pricePerUnit) {
        return count * pricePerUnit;
    }

    calculateRemotePrice(count, pricePerUnit) {
        return count * pricePerUnit;
    }

    calculateChargerPrice(count, pricePerUnit) {
        return count * pricePerUnit;
    }

    calculateCordPrice(count, pricePerUnit) {
        return count * pricePerUnit;
    }
}