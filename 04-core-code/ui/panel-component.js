// /04-core-code/ui/panel-component.js

/**
 * @fileoverview A dedicated and configurable component for managing a slide-out panel's behavior.
 */
export class PanelComponent {
    /**
     * @param {object} config - The configuration object for the panel.
     * @param {HTMLElement} config.panelElement - The main panel element.
     * @param {HTMLElement} config.toggleElement - The button that toggles the panel.
     * @param {EventAggregator} config.eventAggregator - The application's event bus.
     * @param {string} config.expandedClass - The CSS class to apply when the panel is expanded (e.g., 'is-expanded').
     * @param {string} [config.retractEventName] - Optional: The event to listen for to retract the panel.
     * @param {Function} [config.onToggle] - Optional: A callback function to execute when the panel is toggled.
     */
    constructor(config) {
        this.config = config;

        // --- Configuration Validation ---
        if (!this.config.panelElement || !this.config.toggleElement || !this.config.eventAggregator || !this.config.expandedClass) {
            throw new Error("PanelComponent config requires: panelElement, toggleElement, eventAggregator, and expandedClass.");
        }

        this.initialize();
        console.log("Configurable PanelComponent Initialized for:", this.config.panelElement.id);
    }

    initialize() {
        this.config.toggleElement.addEventListener('click', () => this.toggle());

        if (this.config.retractEventName) {
            this.config.eventAggregator.subscribe(this.config.retractEventName, () => this.retract());
        }
    }

    /**
     * Toggles the panel's visibility based on the configured CSS class.
     */
    toggle() {
        const isExpanded = this.config.panelElement.classList.toggle(this.config.expandedClass);

        // [NEW] Execute the onToggle callback if it exists.
        if (typeof this.config.onToggle === 'function') {
            this.config.onToggle(isExpanded);
        }
    }

    /**
     * Retracts the panel by removing the configured CSS class.
     */
    retract() {
        this.config.panelElement.classList.remove(this.config.expandedClass);
    }

    /**
     * Expands the panel by adding the configured CSS class.
     */
    expand() {
        this.config.panelElement.classList.add(this.config.expandedClass);
    }
}