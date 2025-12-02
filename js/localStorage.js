/**
 * LocalStorage Manager
 * Handles standardized localStorage operations and cleans up duplicates
 */
class LocalStorageManager {
    constructor() {
        this.cleanupDuplicates();
    }

    // Standard keys for consistent usage
    static KEYS = {
        AUTH_TOKEN: 'beeboard_jwt_token',
        USER_DATA: 'beeboard_user_data',
        CURRENT_PROJECT_ID: 'current_project_id',
        CURRENT_PROJECT_NAME: 'current_project_name',
        ACTIVE_SUB_CATEGORY_ID: 'active_sub_category_id',
        CURRENT_MAIN_BAR_ID: 'current_main_bar_id'
    };

    // Clean up duplicate localStorage entries
    cleanupDuplicates() {
        console.log('ðŸ§¹ Cleaning up localStorage duplicates...');
        
        // Remove old duplicate keys
        const duplicatesToRemove = [
            'selected_project_id',
            'lastSelectedProject',
            'user_name'
        ];

        duplicatesToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`ðŸ—‘ï¸ Removing duplicate key: ${key}`);
                localStorage.removeItem(key);
            }
        });

        // Don't set default project_id - let user choose or auto-select first project
        console.log('âœ… LocalStorage cleanup completed');
    }

    // Get auth token
    getAuthToken() {
        return localStorage.getItem(LocalStorageManager.KEYS.AUTH_TOKEN);
    }

    // Set auth token
    setAuthToken(token) {
        localStorage.setItem(LocalStorageManager.KEYS.AUTH_TOKEN, token);
    }

    // Get user data
    getUserData() {
        const userData = localStorage.getItem(LocalStorageManager.KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    }

    // Set user data
    setUserData(userData) {
        localStorage.setItem(LocalStorageManager.KEYS.USER_DATA, JSON.stringify(userData));
    }

    // Get current project ID
    getCurrentProjectId() {
        return localStorage.getItem(LocalStorageManager.KEYS.CURRENT_PROJECT_ID);
    }

    // Set current project ID
    setCurrentProjectId(projectId) {
        localStorage.setItem(LocalStorageManager.KEYS.CURRENT_PROJECT_ID, projectId);
    }

    // Get current project name
    getCurrentProjectName() {
        return localStorage.getItem(LocalStorageManager.KEYS.CURRENT_PROJECT_NAME);
    }

    // Set current project name
    setCurrentProjectName(projectName) {
        localStorage.setItem(LocalStorageManager.KEYS.CURRENT_PROJECT_NAME, projectName);
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getAuthToken();
        const userData = this.getUserData();
        return !!(token && userData);
    }

    // Clear all auth data
    clearAuthData() {
        localStorage.removeItem(LocalStorageManager.KEYS.AUTH_TOKEN);
        localStorage.removeItem(LocalStorageManager.KEYS.USER_DATA);
        console.log('ðŸ” Auth data cleared');
    }

    // Get all localStorage data for debugging
    debugData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }
        console.log('ðŸ’¾ Current localStorage:', data);
        return data;
    }
}

// Initialize global instance
window.localStorageManager = new LocalStorageManager();

// Expose class for manual instantiation if needed
window.LocalStorageManager = LocalStorageManager;