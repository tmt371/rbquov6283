// /04-core-code/ui/summary-component.js

/**
 * @fileoverview A dedicated component for rendering the total sum display.
 */
export class SummaryComponent {
    constructor(valueElement) {
        if (!valueElement) {
            throw new Error("Value element is required for SummaryComponent.");
        }
        this.totalSumValueElement = valueElement;
        console.log("SummaryComponent Initialized.");
    }

    /**
     * Renders the total sum and its state color.
     * @param {object} summary - The summary object from quoteData.
     * @param {boolean} isSumOutdated - Flag indicating if the sum is outdated.
     */
    render(summary, isSumOutdated) {
        const totalSum = summary ? summary.totalSum : null;
        let textContent = '';
        if (typeof totalSum === 'number') {
            // [MODIFIED] Changed number format to integer.
            textContent = totalSum.toFixed(0);
        }

        if (this.totalSumValueElement.textContent !== textContent) {
            this.totalSumValueElement.textContent = textContent;
        }

        // Use toggle with the 'force' parameter for cleaner logic
        this.totalSumValueElement.classList.toggle('is-outdated', isSumOutdated);
        this.totalSumValueElement.classList.toggle('is-current', !isSumOutdated);
    }
}