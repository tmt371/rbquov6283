// 04-core-code/app-context.js

/**
 * @description
 * AppContext 是一個簡易的依賴注入（DI）容器，用於管理應用程式中各模組的實例化與依賴關係。
 * 它的主要職責為：
 * 1. 集中創建與配置服務（Services）、管理器（Managers）、工廠（Factories）與視圖（Views）。
 * 2. 解析模組之間的依賴，確保每個模組都能獲得其所需要的其他模組的實例。
 * 3. 簡化 `main.js`，使其只專注於應用的啟動流程，而非組件的創建細節。
 *
 * 這個模式的好處是：
 * - **集中管理**: 所有物件的創建邏輯都集中在此，方便維護與修改。
 * - **降低耦合**: 模組之間不直接創建依賴，而是透過 AppContext 來獲取，降低了耦合度。
 * - **便於測試**: 在測試時，可以輕易地將真實依賴換成注入模擬（mock）的組件。
 */
export class AppContext {
    constructor() {
        this.instances = {};
    }

    /**
     * 註冊一個實例。
     * @param {string} name - 實例的名稱。
     * @param {object} instance - 要註冊的實例。
     */
    register(name, instance) {
        this.instances[name] = instance;
    }

    /**
     * 獲取一個實例。
     * @param {string} name - 欲獲取的實例的名稱。
     * @returns {object} - 返回對應的實例。
     */
    get(name) {
        const instance = this.instances[name];
        if (!instance) {
            throw new Error(`Instance '${name}' not found.`);
        }
        return instance;
    }

    initialize(startingQuoteData = null) {
        // [MODIFIED] This method now only initializes non-UI services and controllers.
        const eventAggregator = new EventAggregator();
        this.register('eventAggregator', eventAggregator);

        const configManager = new ConfigManager(eventAggregator);
        this.register('configManager', configManager);

        const productFactory = new ProductFactory({ configManager });
        this.register('productFactory', productFactory);

        let initialStateWithData = JSON.parse(JSON.stringify(initialState));
        if (startingQuoteData) {
            initialStateWithData.quoteData = startingQuoteData;
        }

        const stateService = new StateService({
            initialState: initialStateWithData,
            eventAggregator,
            productFactory,
            configManager
        });
        this.register('stateService', stateService);

        const calculationService = new CalculationService({
            stateService,
            productFactory,
            configManager
        });
        this.register('calculationService', calculationService);

        const fileService = new FileService({ productFactory });
        this.register('fileService', fileService);

        const focusService = new FocusService({
            stateService
        });
        this.register('focusService', focusService);
    }

    initializeUIComponents() {
        // [NEW] This method initializes all UI-dependent components.
        // It must be called AFTER the HTML partials are loaded.
        const eventAggregator = this.get('eventAggregator');
        const calculationService = this.get('calculationService');
        const stateService = this.get('stateService');
        const configManager = this.get('configManager');
        const productFactory = this.get('productFactory');
        const focusService = this.get('focusService');
        const fileService = this.get('fileService');

        // --- [NEW] Instantiate the new QuoteGeneratorService ---
        const quoteGeneratorService = new QuoteGeneratorService({ calculationService });
        this.register('quoteGeneratorService', quoteGeneratorService);

        // --- Instantiate Right Panel Sub-Views ---
        const rightPanelElement = document.getElementById('function-panel');
        const f1View = new F1CostView({ panelElement: rightPanelElement, eventAggregator, calculationService, stateService });
        const f2View = new F2SummaryView({ panelElement: rightPanelElement, eventAggregator, stateService, calculationService });
        const f3View = new F3QuotePrepView({ panelElement: rightPanelElement, eventAggregator });
        const f4View = new F4ActionsView({ panelElement: rightPanelElement, eventAggregator });

        // --- Instantiate Main RightPanelComponent Manager ---
        const rightPanelComponent = new RightPanelComponent({
            panelElement: rightPanelElement,
            eventAggregator,
            f1View,
            f2View,
            f3View,
            f4View
        });
        this.register('rightPanelComponent', rightPanelComponent);

        // --- [REMOVED] Quote Preview Component instantiation ---

        // --- Instantiate Main Left Panel Views ---
        const k1LocationView = new K1LocationView({ stateService });
        const k2FabricView = new K2FabricView({ stateService, eventAggregator });
        const k3OptionsView = new K3OptionsView({ stateService });
        const dualChainView = new DualChainView({ stateService, calculationService, eventAggregator });
        const driveAccessoriesView = new DriveAccessoriesView({ stateService, calculationService, eventAggregator });

        // --- [MODIFIED] Removed obsolete publishStateChangeCallback from DetailConfigView dependencies ---
        const detailConfigView = new DetailConfigView({
            stateService,
            eventAggregator,
            k1LocationView,
            k2FabricView,
            k3OptionsView,
            dualChainView,
            driveAccessoriesView
        });
        this.register('detailConfigView', detailConfigView);

        const workflowService = new WorkflowService({
            eventAggregator,
            stateService,
            fileService,
            calculationService,
            productFactory,
            detailConfigView,
            quoteGeneratorService // [NEW] Inject the new service
        });
        // [REMOVED]
        this.register('workflowService', workflowService);

        const quickQuoteView = new QuickQuoteView({
            stateService,
            calculationService,
            focusService,
            fileService,
            eventAggregator,
            productFactory,
            configManager
        });
        this.register('quickQuoteView', quickQuoteView);

        const appController = new AppController({
            eventAggregator,
            stateService,
            workflowService,
            quickQuoteView,
            detailConfigView
        });
        this.register('appController', appController);
    }
}

// Import all necessary classes
import { EventAggregator } from './event-aggregator.js';
import { ConfigManager } from './config-manager.js';
import { AppController } from './app-controller.js';
import { ProductFactory } from './strategies/product-factory.js';
import { StateService } from './services/state-service.js';
import { CalculationService } from './services/calculation-service.js';
import { FocusService } from './services/focus-service.js';
import { FileService } from './services/file-service.js';
import { WorkflowService } from './services/workflow-service.js';
import { QuoteGeneratorService } from './services/quote-generator-service.js'; // [NEW]
import { RightPanelComponent } from './ui/right-panel-component.js';
import { QuickQuoteView } from './ui/views/quick-quote-view.js';
import { DetailConfigView } from './ui/views/detail-config-view.js';
import { K1LocationView } from './ui/views/k1-location-view.js';
import { K2FabricView } from './ui/views/k2-fabric-view.js';
import { K3OptionsView } from './ui/views/k3-options-view.js';
import { DualChainView } from './ui/views/dual-chain-view.js';
import { DriveAccessoriesView } from './ui/views/drive-accessories-view.js';
import { initialState } from './config/initial-state.js';
import { F1CostView } from './ui/views/f1-cost-view.js';
import { F2SummaryView } from './ui/views/f2-summary-view.js';
import { F3QuotePrepView } from './ui/views/f3-quote-prep-view.js';
import { F4ActionsView } from './ui/views/f4-actions-view.js';
// [REMOVED]
import { DOM_IDS } from './config/constants.js'; // [NEW]