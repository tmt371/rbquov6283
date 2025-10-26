// File: 04-core-code/main.js

import { AppContext } from './app-context.js';
import { MigrationService } from './services/migration-service.js';
import { UIManager } from './ui/ui-manager.js';
import { InputHandler } from './ui/input-handler.js';
import { paths } from './config/paths.js';
import { EVENTS, DOM_IDS } from './config/constants.js';
// [REMOVED]

class App {
    constructor() {
        this.appContext = new AppContext();
        const migrationService = new MigrationService();

        const restoredData = migrationService.loadAndMigrateData();

        // [MODIFIED] Initialize only non-UI services first.
        this.appContext.initialize(restoredData);
    }

    async _loadPartials() {
        const eventAggregator = this.appContext.get('eventAggregator');
        const loadPartial = async (url, targetElement, injectionMethod = 'append') => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                }
                const html = await response.text();
                if (injectionMethod === 'innerHTML') {
                    targetElement.innerHTML = html;
                } else {
                    targetElement.insertAdjacentHTML('beforeend', html);
                }
            } catch (error) {
                console.error(`Failed to load HTML partial from ${url}:`, error);
                eventAggregator.publish(EVENTS.SHOW_NOTIFICATION, { message: `Error: Could not load UI component from ${url}!`, type: 'error' });
            }
        };

        await loadPartial(paths.partials.leftPanel, document.body);

        const functionPanel = document.getElementById(DOM_IDS.FUNCTION_PANEL);
        if (functionPanel) {
            await loadPartial(paths.partials.rightPanel, functionPanel, 'innerHTML');
        }
    }

    async run() {
        console.log("Application starting...");

        // Step 1: Load all HTML templates into the DOM.
        await this._loadPartials();

        // Step 2: [NEW] Initialize all UI components now that their DOM elements exist.
        this.appContext.initializeUIComponents();

        // Step 3: Get all fully initialized instances from the context.
        const eventAggregator = this.appContext.get('eventAggregator');
        const calculationService = this.appContext.get('calculationService');
        const configManager = this.appContext.get('configManager');
        const appController = this.appContext.get('appController');
        const rightPanelComponent = this.appContext.get('rightPanelComponent');

        // [REMOVED]

        // Step 4: Initialize the main UI manager.
        this.uiManager = new UIManager({
            appElement: document.getElementById(DOM_IDS.APP),
            eventAggregator,
            calculationService,
            rightPanelComponent,
            // [REMOVED]
        });

        // Step 5: Continue with the rest of the application startup.
        await configManager.initialize();

        eventAggregator.subscribe(EVENTS.STATE_CHANGED, (state) => {
            this.uiManager.render(state);
        });

        appController.publishInitialState();

        this.inputHandler = new InputHandler(eventAggregator);
        this.inputHandler.initialize();

        eventAggregator.subscribe(EVENTS.APP_READY, () => {
            setTimeout(() => {
                eventAggregator.publish(EVENTS.FOCUS_CELL, { rowIndex: 0, column: 'width' });
            }, 100);
        });

        eventAggregator.publish(EVENTS.APP_READY);

        console.log("Application running and interactive.");

        document.body.classList.add('app-is-ready');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.run();
});