// File: 04-core-code/services/migration-service.js

import { initialState } from '../config/initial-state.js';
import { STORAGE_KEYS } from '../config/constants.js';

export class MigrationService {
    constructor() {}

    /**
     * 從 localStorage 載入並遷移自動儲存的資料。
     * @returns {object|null} - 返回遷移後的 quoteData，如果沒有資料或遷移失敗則返回 null。
     */
    loadAndMigrateData() {
        try {
            const autoSavedDataJSON = localStorage.getItem(STORAGE_KEYS.AUTOSAVE);
            if (!autoSavedDataJSON) {
                return null;
            }

            const message = "It looks like you have unsaved work from a previous session.\n\n- 'OK' to restore the unsaved work.\n- 'Cancel' to start a new, blank quote.";
            if (window.confirm(message)) {
                let autoSavedData = JSON.parse(autoSavedDataJSON);
                const migratedData = this._migrate(autoSavedData);

                if (migratedData) {
                    console.log("Restored data from auto-save.");
                    return migratedData;
                } else {
                    console.error("Could not restore auto-saved data: format is unrecognized.");
                    localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
                }
            } else {
                localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
                console.log("Auto-saved data discarded by user.");
            }
        } catch (error) {
            console.error("Failed to process auto-saved data:", error);
            localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
        }
        return null;
    }

    /**
     * 執行資料格式的遷移。
     * @param {object} oldData - 舊格式的資料。
     * @returns {object|null} - 返回新格式的資料，如果無法識別則返回 null。
     */
    _migrate(oldData) {
        // 檢查是否為新格式且包含 uiMetadata，若無則修補
        if (oldData && oldData.products && oldData.currentProduct) {
            if (!oldData.uiMetadata) {
                console.warn("Patching modern auto-saved data with missing uiMetadata.");
                oldData.uiMetadata = { lfModifiedRowIndexes: [] };
            }
            return oldData;
        }

        // 處理舊版資料格式的遷移
        if (oldData && oldData.rollerBlindItems) {
            console.warn("Migrating legacy auto-saved data to the new format...");
            const newData = {
                currentProduct: 'rollerBlind',
                products: {
                    rollerBlind: {
                        items: oldData.rollerBlindItems,
                        summary: oldData.summary || initialState.quoteData.products.rollerBlind.summary
                    }
                },
                uiMetadata: {
                    lfModifiedRowIndexes: []
                },
                quoteId: oldData.quoteId || null,
                issueDate: oldData.issueDate || null,
                dueDate: oldData.dueDate || null,
                status: oldData.status || "Configuring",
                costDiscountPercentage: oldData.costDiscountPercentage || 0,
                customer: oldData.customer || { name: "", address: "", phone: "", email: "" }
            };
            return newData;
        }

        return null;
    }
}