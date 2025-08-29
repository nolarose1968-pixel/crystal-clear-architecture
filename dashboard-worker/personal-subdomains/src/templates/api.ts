/**
 * API Template Entry Point (New Modular Structure)
 * 
 * This file now imports from the new modular structure in ui/templates/
 * The original 17,058-line file has been archived in archive/old-templates/
 */

// Re-export from the new modular structure
export { generateApiPage } from '../../../ui/templates/api-main';

// Import all template functions for direct access if needed
export {
  generateApiDashboardPage,
  generateApiEndpointsPage, 
  generateApiMonitoringPage,
  generateApiLogsPage,
  generateApiSecurityPage
} from '../../../ui/templates';

// Import shared utilities
export * from '../../../ui/templates/api-shared';
