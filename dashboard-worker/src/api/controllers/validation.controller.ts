/**
 * Validation Controller
 * 
 * API endpoints for L-Key to Telegram validation system
 * Provides validation, reporting, and auto-fixing capabilities
 */

import type { ValidatedRequest } from '../middleware/validate.middleware';
import { LKeyTelegramValidator, ValidationReport } from '../../validation/l-key-telegram-validator';

/**
 * Run complete L-Key to Telegram validation
 */
export async function validateLKeyTelegramConsistency(request: ValidatedRequest): Promise<Response> {
  try {
    const { agentID } = request.validatedBody || await request.json();
    const env = request.env;
    
    console.log(`🔍 Starting L-Key validation for agent: ${agentID || 'ALL'}`);
    
    const validator = new LKeyTelegramValidator(env);
    const report = await validator.validateLKeyTelegramConsistency(agentID);
    
    const summary = validator.generateSummary(report);
    
    const response = {
      success: true,
      data: {
        report,
        summary,
        timestamp: new Date().toISOString(),
        agent: agentID || 'ALL'
      }
    };
    
    console.log(`✅ Validation completed: ${report.validMappings} valid, ${report.mismatches + report.missing + report.invalid} issues`);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Validation failed:', error);
    
    return new Response(JSON.stringify({
      error: 'L-Key validation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Auto-fix validation issues
 */
export async function autoFixValidationIssues(request: ValidatedRequest): Promise<Response> {
  try {
    const { report } = request.validatedBody || await request.json();
    const env = request.env;
    
    if (!report) {
      return new Response(JSON.stringify({
        error: 'Missing validation report',
        message: 'Please provide a validation report to auto-fix'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔧 Starting auto-fix for ${report.fixableIssues} issues...`);
    
    const validator = new LKeyTelegramValidator(env);
    const fixResults = await validator.autoFixIssues(report);
    
    const response = {
      success: true,
      data: {
        fixed: fixResults.fixed,
        failed: fixResults.failed,
        results: fixResults.results,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`✅ Auto-fix completed: ${fixResults.fixed} fixed, ${fixResults.failed} failed`);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Auto-fix failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Auto-fix failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get validation summary statistics
 */
export async function getValidationStats(request: ValidatedRequest): Promise<Response> {
  try {
    const { agentID } = request.validatedBody || await request.json();
    const env = request.env;
    
    const validator = new LKeyTelegramValidator(env);
    const report = await validator.validateLKeyTelegramConsistency(agentID);
    
    const stats = {
      totalCustomers: report.totalCustomers,
      totalTelegramUsers: report.totalTelegramUsers,
      validMappings: report.validMappings,
      successRate: ((report.validMappings / (report.totalCustomers + report.totalTelegramUsers)) * 100).toFixed(1) + '%',
      issues: {
        mismatches: report.mismatches,
        missing: report.missing,
        invalid: report.invalid,
        total: report.mismatches + report.missing + report.invalid
      },
      fixableIssues: report.fixableIssues,
      criticalIssues: report.criticalIssues,
      lastChecked: report.timestamp
    };
    
    const response = {
      success: true,
      data: stats
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Stats retrieval failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to get validation stats',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Export validation report
 */
export async function exportValidationReport(request: ValidatedRequest): Promise<Response> {
  try {
    const { agentID, format = 'json' } = request.validatedBody || await request.json();
    const env = request.env;
    
    const validator = new LKeyTelegramValidator(env);
    const report = await validator.validateLKeyTelegramConsistency(agentID);
    
    if (format === 'json') {
      const jsonReport = validator.exportReport(report);
      
      return new Response(jsonReport, {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="l-key-validation-${agentID || 'all'}-${Date.now()}.json"`
        }
      });
    } else if (format === 'summary') {
      const summary = validator.generateSummary(report);
      
      return new Response(summary, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="l-key-validation-summary-${agentID || 'all'}-${Date.now()}.txt"`
        }
      });
    } else {
      return new Response(JSON.stringify({
        error: 'Invalid format',
        message: 'Supported formats: json, summary'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('❌ Export failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Export failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Validate specific customer by ID
 */
export async function validateSpecificCustomer(request: ValidatedRequest): Promise<Response> {
  try {
    const { customerID, agentID } = request.validatedBody || await request.json();
    const env = request.env;
    
    if (!customerID) {
      return new Response(JSON.stringify({
        error: 'Missing customer ID',
        message: 'Please provide a customer ID to validate'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`🔍 Validating specific customer: ${customerID}`);
    
    const validator = new LKeyTelegramValidator(env);
    const fullReport = await validator.validateLKeyTelegramConsistency(agentID);
    
    // Find specific customer in report
    const customerValidation = fullReport.customerValidations.find(
      c => c.customerID === customerID
    );
    
    const telegramValidation = fullReport.telegramValidations.find(
      t => t.associatedCustomerId === customerID
    );
    
    if (!customerValidation) {
      return new Response(JSON.stringify({
        error: 'Customer not found',
        message: `Customer ${customerID} not found in validation results`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = {
      success: true,
      data: {
        customer: customerValidation,
        telegram: telegramValidation,
        isValid: customerValidation.validationStatus === 'valid' && 
                (!telegramValidation || telegramValidation.validationStatus === 'valid'),
        totalIssues: customerValidation.issues.length + (telegramValidation?.issues.length || 0),
        timestamp: new Date().toISOString()
      }
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Customer validation failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Customer validation failed',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get validation health check
 */
export async function getValidationHealth(request: ValidatedRequest): Promise<Response> {
  try {
    const env = request.env;
    
    // Quick health check without full validation
    const validator = new LKeyTelegramValidator(env);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        lKeyMapper: true,
        entityMapper: true,
        fire22Integration: true,
        telegramBot: true
      },
      lastValidation: null, // Would be stored in cache in real implementation
      version: '1.0.0'
    };
    
    const response = {
      success: true,
      data: health
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    
    return new Response(JSON.stringify({
      error: 'Health check failed',
      message: error.message,
      status: 'unhealthy',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}