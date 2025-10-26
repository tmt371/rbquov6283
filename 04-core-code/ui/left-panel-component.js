// File: 04-core-code/ui/left-panel-component.js

import { DOM_IDS } from '../config/constants.js';

/**
 * @fileoverview A dedicated component for managing and rendering the Left Panel UI.
 */
export class LeftPanelComponent {
    constructor(panelElement) {
        if (!panelElement) {
            throw new Error("Panel element is required for LeftPanelComponent.");
        }
        this.panelElement = panelElement;
        this.panelToggle = document.getElementById(DOM_IDS.LEFT_PANEL_TOGGLE);

        // Cache all DOM elements in the constructor.
        this.locationButton = document.getElementById('btn-focus-location');
        this.locationInput = document.getElementById(DOM_IDS.LOCATION_INPUT_BOX);
        this.fabricColorButton = document.getElementById('btn-focus-fabric');
        this.lfButton = document.getElementById('btn-light-filter');
        this.lfDelButton = document.getElementById('btn-lf-del');
        this.k3EditButton = document.getElementById('btn-k3-edit');
        this.k3OverButton = document.getElementById('btn-batch-cycle-over');
        this.k3OiButton = document.getElementById('btn-batch-cycle-oi');
        this.k3LrButton = document.getElementById('btn-batch-cycle-lr');
        this.k4WinderButton = document.getElementById('btn-k5-winder');
        this.k4MotorButton = document.getElementById('btn-k5-motor');
        this.k4RemoteButton = document.getElementById('btn-k5-remote');
        this.k4ChargerButton = document.getElementById('btn-k5-charger');
        this.k4CordButton = document.getElementById('btn-k5-3m-cord');
        this.k4WinderDisplay = document.getElementById('k5-display-winder');
        this.k4MotorDisplay = document.getElementById('k5-display-motor');
        this.k4RemoteDisplay = document.getElementById('k5-display-remote');
        this.k4ChargerDisplay = document.getElementById('k5-display-charger');
        this.k4CordDisplay = document.getElementById('k5-display-cord');
        this.k4RemoteAddBtn = document.getElementById('btn-k5-remote-add');
        this.k4RemoteSubtractBtn = document.getElementById('btn-k5-remote-subtract');
        this.k4RemoteCountDisplay = document.getElementById('k5-display-remote-count');
        this.k4ChargerAddBtn = document.getElementById('btn-k5-charger-add');
        this.k4ChargerSubtractBtn = document.getElementById('btn-k5-charger-subtract');
        this.k4ChargerCountDisplay = document.getElementById('k5-display-charger-count');
        this.k4CordAddBtn = document.getElementById('btn-k5-cord-add');
        this.k4CordSubtractBtn = document.getElementById('btn-k5-cord-subtract');
        this.k4CordCountDisplay = document.getElementById('k5-display-cord-count');
        this.k4TotalDisplay = document.getElementById('k5-display-total');
        this.k5DualButton = document.getElementById('btn-k4-dual');
        this.k5ChainButton = document.getElementById('btn-k4-chain');
        this.k5InputDisplay = document.getElementById('k4-input-display');
        this.k5DualPriceValue = document.querySelector('#k4-dual-price-display .price-value');
        this.k5WinderSummaryDisplay = document.getElementById('k5-display-winder-summary');
        this.k5MotorSummaryDisplay = document.getElementById('k5-display-motor-summary');
        this.k5RemoteSummaryDisplay = document.getElementById('k5-display-remote-summary');
        this.k5ChargerSummaryDisplay = document.getElementById('k5-display-charger-summary');
        this.k5CordSummaryDisplay = document.getElementById('k5-display-cord-summary');
        this.k5AccessoriesTotalDisplay = document.getElementById('k5-display-accessories-total');
        this.tabButtons = this.panelElement.querySelectorAll('.tab-button');
        this.tabContents = this.panelElement.querySelectorAll('.tab-content');
        
        console.log("LeftPanelComponent Initialized.");
    }

    render(uiState, quoteData) {
        this._updateTabStates(uiState);
        this._updatePanelButtonStates(uiState, quoteData);
    }

    _updateTabStates(uiState) {
        const { activeEditMode, activeTabId, dualChainMode, driveAccessoryMode } = uiState;
        const isInEditMode = activeEditMode !== null || dualChainMode !== null || driveAccessoryMode !== null;

        const activeTabButton = document.getElementById(activeTabId);
        const activeContentTarget = activeTabButton ? activeTabButton.dataset.tabTarget : null;

        this.tabButtons.forEach(button => {
            const isThisButtonActive = button.id === activeTabId;
            button.classList.toggle('active', isThisButtonActive);
            button.disabled = isInEditMode && !isThisButtonActive;
        });

        if (this.panelToggle) {
            this.panelToggle.style.pointerEvents = isInEditMode ? 'none' : 'auto';
            this.panelToggle.style.opacity = isInEditMode ? '0.5' : '1';
        }

        this.tabContents.forEach(content => {
            const isThisContentActive = activeContentTarget && `#${content.id}` === activeContentTarget;
            content.classList.toggle('active', isThisContentActive);
        });
        
        const panelBgColors = {
            'k1-tab': 'var(--k1-bg-color)',
            'k2-tab': 'var(--k2-bg-color)',
            'k3-tab': 'var(--k3-bg-color)',
            'k4-tab': 'var(--k4-bg-color)',
            'k5-tab': 'var(--k5-bg-color)',
        };
        this.panelElement.style.backgroundColor = panelBgColors[activeTabId] || 'var(--k1-bg-color)';
    }

    _updatePanelButtonStates(uiState, quoteData) {
        const { 
            activeEditMode, locationInputValue,
            dualChainMode, targetCell, dualChainInputValue,
            driveAccessoryMode, driveRemoteCount, driveChargerCount, driveCordCount,
            driveWinderTotalPrice, driveMotorTotalPrice, driveRemoteTotalPrice, driveChargerTotalPrice, driveCordTotalPrice,
            driveGrandTotal,
            summaryWinderPrice, summaryMotorPrice,
            summaryRemotePrice, summaryChargerPrice, summaryCordPrice, summaryAccessoriesTotal
        } = uiState;

        // [CORRECTED] Read lfModifiedRowIndexes from its new location in quoteData.uiMetadata.
        const lfModifiedRowIndexes = quoteData.uiMetadata?.lfModifiedRowIndexes || [];
        
        const currentProductKey = quoteData.currentProduct;
        const productData = quoteData.products[currentProductKey];
        const items = productData.items;
        const accessoriesSummary = productData.summary.accessories || {};

        // --- K1 Location Input State ---
        if (this.locationInput) {
            const isLocationActive = activeEditMode === 'K1';
            this.locationInput.disabled = !isLocationActive;
            this.locationInput.classList.toggle('active', isLocationActive);
            if (this.locationInput.value !== locationInputValue) {
                this.locationInput.value = locationInputValue;
            }
        }
        
        // --- K2 Button Active/Disabled States ---
        const isFCMode = activeEditMode === 'K2';
        const isLFSelectMode = activeEditMode === 'K2_LF_SELECT';
        const isLFDeleteMode = activeEditMode === 'K2_LF_DELETE_SELECT';
        const isAnyK2ModeActive = isFCMode || isLFSelectMode || isLFDeleteMode;

        if (this.locationButton) this.locationButton.classList.toggle('active', activeEditMode === 'K1');
        if (this.fabricColorButton) this.fabricColorButton.classList.toggle('active', isFCMode);
        if (this.lfButton) this.lfButton.classList.toggle('active', isLFSelectMode);
        if (this.lfDelButton) this.lfDelButton.classList.toggle('active', isLFDeleteMode);
        
        // [CORRECTED] Changed check from .size > 0 to .length > 0 for arrays.
        const hasLFModified = lfModifiedRowIndexes.length > 0;

        if (this.locationButton) this.locationButton.disabled = isAnyK2ModeActive;
        if (this.fabricColorButton) this.fabricColorButton.disabled = activeEditMode !== null && !isFCMode;
        if (this.lfButton) this.lfButton.disabled = activeEditMode !== null && !isLFSelectMode;
        if (this.lfDelButton) this.lfDelButton.disabled = (activeEditMode !== null && !isLFDeleteMode) || !hasLFModified;

        // --- K3 Button Active/Disabled States ---
        const isK3EditMode = activeEditMode === 'K3';
        if (this.k3EditButton) {
            this.k3EditButton.classList.toggle('active', isK3EditMode);
            this.k3EditButton.disabled = activeEditMode !== null && !isK3EditMode;
        }
        const k3SubButtonsDisabled = !isK3EditMode;
        if (this.k3OverButton) this.k3OverButton.disabled = k3SubButtonsDisabled;
        if (this.k3OiButton) this.k3OiButton.disabled = k3SubButtonsDisabled;
        if (this.k3LrButton) this.k3LrButton.disabled = k3SubButtonsDisabled;

        const formatPrice = (price) => (typeof price === 'number') ? `$${price.toFixed(0)}` : '';

        // --- K4 (Drive/Accessories) States ---
        const k4Buttons = [
            { el: this.k4WinderButton, mode: 'winder' },
            { el: this.k4MotorButton, mode: 'motor' },
            { el: this.k4RemoteButton, mode: 'remote' },
            { el: this.k4ChargerButton, mode: 'charger' },
            { el: this.k4CordButton, mode: 'cord' }
        ];
        
        const isAnyK4ModeActive = driveAccessoryMode !== null;
        k4Buttons.forEach(({ el, mode }) => {
            if (el) {
                const isActive = driveAccessoryMode === mode;
                el.classList.toggle('active', isActive);
                el.disabled = isAnyK4ModeActive && !isActive;
            }
        });
        
        if (this.k4WinderDisplay) this.k4WinderDisplay.value = formatPrice(driveWinderTotalPrice);
        if (this.k4MotorDisplay) this.k4MotorDisplay.value = formatPrice(driveMotorTotalPrice);
        if (this.k4RemoteDisplay) this.k4RemoteDisplay.value = formatPrice(driveRemoteTotalPrice);
        if (this.k4ChargerDisplay) this.k4ChargerDisplay.value = formatPrice(driveChargerTotalPrice);
        if (this.k4CordDisplay) this.k4CordDisplay.value = formatPrice(driveCordTotalPrice);
        if (this.k4RemoteCountDisplay) this.k4RemoteCountDisplay.value = driveRemoteCount;
        if (this.k4ChargerCountDisplay) this.k4ChargerCountDisplay.value = driveChargerCount;
        if (this.k4CordCountDisplay) this.k4CordCountDisplay.value = driveCordCount;
        if (this.k4TotalDisplay) this.k4TotalDisplay.value = formatPrice(driveGrandTotal);
        
        const remoteBtnsDisabled = driveAccessoryMode !== 'remote';
        if (this.k4RemoteAddBtn) this.k4RemoteAddBtn.disabled = remoteBtnsDisabled;
        if (this.k4RemoteSubtractBtn) this.k4RemoteSubtractBtn.disabled = remoteBtnsDisabled;
        const chargerBtnsDisabled = driveAccessoryMode !== 'charger';
        if (this.k4ChargerAddBtn) this.k4ChargerAddBtn.disabled = chargerBtnsDisabled;
        if (this.k4ChargerSubtractBtn) this.k4ChargerSubtractBtn.disabled = chargerBtnsDisabled;
        const cordBtnsDisabled = driveAccessoryMode !== 'cord';
        if (this.k4CordAddBtn) this.k4CordAddBtn.disabled = cordBtnsDisabled;
        if (this.k4CordSubtractBtn) this.k4CordSubtractBtn.disabled = cordBtnsDisabled;

        // --- K5 (Dual/Chain & Summary) States ---
        if (this.k5DualButton) {
            const isDisabled = dualChainMode !== null && dualChainMode !== 'dual';
            this.k5DualButton.classList.toggle('active', dualChainMode === 'dual');
            this.k5DualButton.disabled = isDisabled;
        }
        if (this.k5ChainButton) {
            const isDisabled = dualChainMode !== null && dualChainMode !== 'chain';
            this.k5ChainButton.classList.toggle('active', dualChainMode === 'chain');
            this.k5ChainButton.disabled = isDisabled;
        }
        
        if (this.k5InputDisplay) {
            const isChainInputActive = dualChainMode === 'chain' && targetCell && targetCell.column === 'chain';
            this.k5InputDisplay.disabled = !isChainInputActive;
            this.k5InputDisplay.classList.toggle('active', isChainInputActive);
            if (this.k5InputDisplay.value !== dualChainInputValue) this.k5InputDisplay.value = dualChainInputValue;
        }
        if (this.k5DualPriceValue) {
            const dualPrice = accessoriesSummary.dualCostSum;
            const newText = (typeof dualPrice === 'number') ? `$${dualPrice.toFixed(0)}` : '';
            if (this.k5DualPriceValue.textContent !== newText) this.k5DualPriceValue.textContent = newText;
        }
        if (this.k5WinderSummaryDisplay) this.k5WinderSummaryDisplay.value = formatPrice(summaryWinderPrice);
        if (this.k5MotorSummaryDisplay) this.k5MotorSummaryDisplay.value = formatPrice(summaryMotorPrice);
        if (this.k5RemoteSummaryDisplay) this.k5RemoteSummaryDisplay.value = formatPrice(summaryRemotePrice);
        if (this.k5ChargerSummaryDisplay) this.k5ChargerSummaryDisplay.value = formatPrice(summaryChargerPrice);
        if (this.k5CordSummaryDisplay) this.k5CordSummaryDisplay.value = formatPrice(summaryCordPrice);
        if (this.k5AccessoriesTotalDisplay) this.k5AccessoriesTotalDisplay.value = formatPrice(summaryAccessoriesTotal);
    }
}