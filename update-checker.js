/**
 * Auto-Update Checker
 * Checks for new versions and downloads updates
 */

class UpdateChecker {
    constructor() {
        this.updateURL = 'https://yourdomain.com/updates/version.json';
        this.currentVersion = '1.2.0';
    }

    /**
     * Check if updates are available
     */
    async checkForUpdates() {
        try {
            const response = await fetch(this.updateURL);
            const data = await response.json();
            
            if (this.isNewerVersion(data.version, this.currentVersion)) {
                return {
                    available: true,
                    version: data.version,
                    downloadURL: data.downloadURL,
                    changelog: data.changelog
                };
            }
            
            return { available: false };
        } catch (error) {
            console.error('Error checking for updates:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Compare version numbers
     */
    isNewerVersion(newVer, currentVer) {
        const newParts = newVer.split('.').map(Number);
        const currentParts = currentVer.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            if (newParts[i] > currentParts[i]) return true;
            if (newParts[i] < currentParts[i]) return false;
        }
        return false;
    }

    /**
     * Download and apply update
     */
    async downloadUpdate(updateInfo) {
        try {
            // Show progress
            this.showUpdateProgress('Downloading update...');
            
            // Download the ZIP file
            const response = await fetch(updateInfo.downloadURL);
            const blob = await response.blob();
            
            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DRF-Report-Generator-v${updateInfo.version}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showUpdateProgress(`Update v${updateInfo.version} downloaded! Please extract and replace files.`);
            
            return true;
        } catch (error) {
            console.error('Error downloading update:', error);
            this.showUpdateProgress('Error downloading update: ' + error.message);
            return false;
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification(updateInfo) {
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">🎉 Update Available!</h3>
            <p style="margin: 0 0 10px 0;">Version ${updateInfo.version} is now available</p>
            <div style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px;">
                ${updateInfo.changelog || 'New features and improvements'}
            </div>
            <button id="download-update-btn" style="
                background: white;
                color: #4CAF50;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                margin-right: 10px;
            ">Download Update</button>
            <button id="dismiss-update-btn" style="
                background: transparent;
                color: white;
                border: 1px solid white;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
            ">Later</button>
        `;
        
        document.body.appendChild(notification);
        
        document.getElementById('download-update-btn').addEventListener('click', () => {
            this.downloadUpdate(updateInfo);
            notification.remove();
        });
        
        document.getElementById('dismiss-update-btn').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Show update progress
     */
    showUpdateProgress(message) {
        let progress = document.getElementById('update-progress');
        if (!progress) {
            progress = document.createElement('div');
            progress.id = 'update-progress';
            progress.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #2196F3;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                z-index: 10000;
            `;
            document.body.appendChild(progress);
        }
        progress.textContent = message;
        
        // Auto-remove after 5 seconds
        setTimeout(() => progress.remove(), 5000);
    }

    /**
     * Initialize auto-check on page load
     */
    async init() {
        // Check for updates on page load
        const updateInfo = await this.checkForUpdates();
        
        if (updateInfo.available) {
            this.showUpdateNotification(updateInfo);
        }
    }
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    const updateChecker = new UpdateChecker();
    updateChecker.init();
});
