// /04-core-code/ui/notification-component.js

import { EVENTS } from '../config/constants.js';

/**
 * @fileoverview A dedicated component for managing and displaying toast notifications.
 */
export class NotificationComponent {
    /**
     * @param {HTMLElement} containerElement The element to which notifications will be appended.
     * @param {EventAggregator} eventAggregator The application's event bus.
     */
    constructor({ containerElement, eventAggregator }) {
        if (!containerElement || !eventAggregator) {
            throw new Error("Container element and event aggregator are required for NotificationComponent.");
        }
        this.container = containerElement;
        this.eventAggregator = eventAggregator;
        
        this.initialize();
        console.log("NotificationComponent Initialized.");
    }

    initialize() {
        this.eventAggregator.subscribe(EVENTS.SHOW_NOTIFICATION, (data) => this.show(data));
    }

    /**
     * Creates and displays a toast notification.
     * @param {object} data The notification data { message, type }.
     */
    show({ message, type = 'info' }) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;

        if (type === 'error') {
            toast.classList.add('error');
        }

        this.container.appendChild(toast);

        // The animation defined in CSS will handle the fade out.
        // We just need to remove the element from the DOM after the animation is complete.
        setTimeout(() => {
            toast.remove();
        }, 4000); // Should match the animation duration in style.css
    }
}