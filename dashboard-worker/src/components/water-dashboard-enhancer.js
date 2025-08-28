/**
 * 🌊 Water Dashboard KPI Enhancer
 * Simple script to enhance existing KPI cards with water-themed styling
 * Add this script to your water-dashboard.html file
 */

(function() {
    'use strict';

    console.log('🌊 Water Dashboard KPI Enhancer loaded...');

    // Wait for the page to be fully loaded
    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    // Enhanced KPI styles
    const enhancedKPIStyles = `
        .enhanced-kpi-card {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 1.5rem;
            border-radius: 1rem;
            text-align: center;
            border: 2px solid transparent;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            transition: all 0.4s ease;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }

        .enhanced-kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(135, 206, 235, 0.1), transparent);
            transition: left 0.6s ease;
        }

        .enhanced-kpi-card:hover::before {
            left: 100%;
        }

        .enhanced-kpi-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
        }

        .enhanced-kpi-card.surface {
            border-color: #87ceeb;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
        }

        .enhanced-kpi-card.mid-water {
            border-color: #4682b4;
            background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
        }

        .enhanced-kpi-card.deep-water {
            border-color: #191970;
            background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
        }

        .enhanced-kpi-value {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #87ceeb, #4682b4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.75rem;
            text-shadow: 0 0 20px rgba(135, 206, 235, 0.3);
        }

        .enhanced-kpi-label {
            font-size: 1rem;
            color: #e2e8f0;
            font-weight: 600;
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .enhanced-kpi-icon {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
            opacity: 0.9;
            filter: drop-shadow(0 0 10px rgba(135, 206, 235, 0.5));
        }

        .enhanced-kpi-trend {
            font-size: 0.9rem;
            font-weight: 600;
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
            display: inline-block;
            margin-top: 0.5rem;
        }

        .enhanced-trend-up {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .enhanced-trend-down {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .enhanced-trend-neutral {
            background: rgba(156, 163, 175, 0.2);
            color: #9ca3af;
            border: 1px solid rgba(156, 163, 175, 0.3);
        }

        @keyframes pulse-glow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
        }

        .pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
        }

        @media (max-width: 768px) {
            .enhanced-kpi-card {
                padding: 1rem;
            }
            
            .enhanced-kpi-value {
                font-size: 2rem;
            }
            
            .enhanced-kpi-icon {
                font-size: 2rem;
            }
        }
    `;

    // Inject enhanced styles
    function injectEnhancedStyles() {
        if (!document.querySelector('#enhanced-kpi-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'enhanced-kpi-styles';
            styleSheet.textContent = enhancedKPIStyles;
            document.head.appendChild(styleSheet);
        }
    }

    // Enhance existing KPI cards
    function enhanceExistingKPIs() {
        const kpiCards = document.querySelectorAll('.kpi-card');
        
        if (kpiCards.length === 0) {
            console.log('🌊 No existing KPI cards found to enhance');
            return;
        }

        console.log(`🌊 Found ${kpiCards.length} KPI cards to enhance`);

        kpiCards.forEach((card, index) => {
            enhanceKPICard(card, index);
        });
    }

    // Enhance individual KPI card
    function enhanceKPICard(card, index) {
        // Add enhanced class
        card.classList.add('enhanced-kpi-card');
        
        // Determine water theme based on existing classes
        if (card.classList.contains('surface')) {
            card.classList.add('surface');
        } else if (card.classList.contains('mid-water')) {
            card.classList.add('mid-water');
        } else if (card.classList.contains('deep-water')) {
            card.classList.add('deep-water');
        } else {
            // Default to mid-water theme
            card.classList.add('mid-water');
        }

        // Add icon if not present
        const existingIcon = card.querySelector('.kpi-icon');
        if (!existingIcon) {
            const icon = document.createElement('div');
            icon.className = 'enhanced-kpi-icon';
            
            // Set appropriate icon based on label
            const label = card.querySelector('.kpi-label');
            if (label) {
                const labelText = label.textContent || '';
                if (labelText.includes('Temperature')) {
                    icon.textContent = '🌡️';
                } else if (labelText.includes('Pressure')) {
                    icon.textContent = '💧';
                } else if (labelText.includes('Flow')) {
                    icon.textContent = '🌊';
                } else if (labelText.includes('Agents')) {
                    icon.textContent = '👥';
                } else if (labelText.includes('Wagers')) {
                    icon.textContent = '📊';
                } else if (labelText.includes('Amount')) {
                    icon.textContent = '💰';
                } else {
                    icon.textContent = '🌊';
                }
            }
            
            card.insertBefore(icon, card.firstChild);
        }

        // Add trend indicator if not present
        const existingTrend = card.querySelector('.kpi-trend');
        if (!existingTrend) {
            const trend = document.createElement('div');
            trend.className = 'enhanced-kpi-trend enhanced-trend-neutral';
            
            // Set trend based on value
            const valueElement = card.querySelector('.kpi-value');
            if (valueElement) {
                const valueText = valueElement.textContent || '';
                if (valueText.includes('°C')) {
                    const temp = parseFloat(valueText);
                    if (temp > 21) {
                        trend.textContent = '🌊 Rising';
                        trend.className = 'enhanced-kpi-trend enhanced-trend-up';
                    } else if (temp < 19) {
                        trend.textContent = '💧 Falling';
                        trend.className = 'enhanced-kpi-trend enhanced-trend-down';
                    } else {
                        trend.textContent = '🌊 Stable';
                    }
                } else if (valueText.includes('PSI')) {
                    const pressure = parseFloat(valueText);
                    if (pressure > 120) {
                        trend.textContent = '⚠️ High';
                        trend.className = 'enhanced-kpi-trend enhanced-trend-up';
                    } else if (pressure < 80) {
                        trend.textContent = '💧 Low';
                        trend.className = 'enhanced-kpi-trend enhanced-trend-down';
                    } else {
                        trend.textContent = '🌊 Normal';
                    }
                } else if (valueText.includes('L/min')) {
                    const flow = parseFloat(valueText);
                    if (flow > 80) {
                        trend.textContent = '🌊 High Flow';
                        trend.className = 'enhanced-kpi-trend enhanced-trend-up';
                    } else if (flow < 30) {
                        trend.textContent = '💧 Low Flow';
                        trend.className = 'enhanced-kpi-trend enhanced-trend-down';
                    } else {
                        trend.textContent = '🌊 Normal';
                    }
                } else {
                    trend.textContent = '🌊 Active';
                }
            }
            
            card.appendChild(trend);
        }

        // Add pulse effect to important KPIs
        if (card.querySelector('.kpi-label')?.textContent?.includes('Temperature')) {
            card.classList.add('pulse-glow');
        }

        console.log(`🌊 Enhanced KPI card ${index + 1}: ${card.querySelector('.kpi-label')?.textContent || 'Unknown'}`);
    }

    // Add monitoring controls
    function addMonitoringControls() {
        const systemInfoSection = document.querySelector('[x-show*="system-info"]');
        if (!systemInfoSection) {
            console.log('🌊 System info section not found, skipping monitoring controls');
            return;
        }

        // Check if controls already exist
        if (systemInfoSection.querySelector('.enhanced-monitoring-controls')) {
            return;
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'enhanced-monitoring-controls';
        controlsContainer.style.cssText = `
            margin-top: 2rem;
            padding: 1.5rem;
            background: rgba(135, 206, 235, 0.1);
            border-radius: 1rem;
            border: 1px solid rgba(135, 206, 235, 0.3);
        `;

        controlsContainer.innerHTML = `
            <h3 class="text-xl font-bold mb-4 glow-text" style="color: #87ceeb;">🌊 Enhanced Water Monitoring</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button id="refresh-enhanced-kpis" class="enhanced-control-btn">
                    🔄 Refresh KPIs
                </button>
                <button id="toggle-enhancements" class="enhanced-control-btn">
                    🎨 Toggle Enhancements
                </button>
            </div>
            <div class="mt-4 text-sm text-gray-400">
                <span id="enhancement-status">Status: Enhanced</span> | 
                <span id="last-enhancement">Last Update: ${new Date().toLocaleTimeString()}</span>
            </div>
        `;

        systemInfoSection.appendChild(controlsContainer);

        // Add control button styles
        const controlStyles = `
            .enhanced-control-btn {
                padding: 0.75rem 1.5rem;
                border-radius: 0.75rem;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
            }

            .enhanced-control-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            }

            .enhanced-control-btn:active {
                transform: translateY(0);
            }
        `;

        if (!document.querySelector('#enhanced-control-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'enhanced-control-styles';
            styleSheet.textContent = controlStyles;
            document.head.appendChild(styleSheet);
        }

        // Add event listeners
        const refreshBtn = document.getElementById('refresh-enhanced-kpis');
        const toggleBtn = document.getElementById('toggle-enhancements');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshEnhancedKPIs();
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                toggleEnhancements();
            });
        }
    }

    // Refresh enhanced KPIs
    function refreshEnhancedKPIs() {
        console.log('🌊 Refreshing enhanced KPIs...');
        
        // Update last enhancement time
        const lastUpdateElement = document.getElementById('last-enhancement');
        if (lastUpdateElement) {
            lastUpdateElement.textContent = `Last Update: ${new Date().toLocaleTimeString()}`;
        }

        // Re-enhance KPIs
        enhanceExistingKPIs();
        
        console.log('🌊 Enhanced KPIs refreshed!');
    }

    // Toggle enhancements
    function toggleEnhancements() {
        const kpiCards = document.querySelectorAll('.enhanced-kpi-card');
        const toggleBtn = document.getElementById('toggle-enhancements');
        const statusElement = document.getElementById('enhancement-status');
        
        if (kpiCards.length > 0) {
            // Remove enhancements
            kpiCards.forEach(card => {
                card.classList.remove('enhanced-kpi-card', 'surface', 'mid-water', 'deep-water', 'pulse-glow');
                const icon = card.querySelector('.enhanced-kpi-icon');
                const trend = card.querySelector('.enhanced-kpi-trend');
                if (icon) icon.remove();
                if (trend) trend.remove();
            });
            
            if (toggleBtn) toggleBtn.textContent = '🎨 Enable Enhancements';
            if (statusElement) statusElement.textContent = 'Status: Disabled';
            console.log('🌊 Enhancements disabled');
        } else {
            // Re-enable enhancements
            enhanceExistingKPIs();
            if (toggleBtn) toggleBtn.textContent = '🎨 Disable Enhancements';
            if (statusElement) statusElement.textContent = 'Status: Enhanced';
            console.log('🌊 Enhancements re-enabled');
        }
    }

    // Main enhancement function
    function enhanceWaterDashboard() {
        console.log('🌊 Starting water dashboard enhancement...');
        
        // Inject styles
        injectEnhancedStyles();
        
        // Wait for KPI cards to be available
        waitForElement('.kpi-card')
            .then(() => {
                // Enhance existing KPIs
                enhanceExistingKPIs();
                
                // Add monitoring controls
                addMonitoringControls();
                
                console.log('🌊 Water dashboard enhancement completed!');
            })
            .catch(error => {
                console.log('🌊 Enhancement delayed, retrying...');
                // Retry after a delay
                setTimeout(() => {
                    enhanceExistingKPIs();
                    addMonitoringControls();
                }, 2000);
            });
    }

    // Auto-enhance on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(enhanceWaterDashboard, 1000);
        });
    } else {
        setTimeout(enhanceWaterDashboard, 1000);
    }

    // Export functions for manual use
    window.WaterDashboardEnhancer = {
        enhance: enhanceWaterDashboard,
        refresh: refreshEnhancedKPIs,
        toggle: toggleEnhancements
    };

    console.log('🌊 Water Dashboard KPI Enhancer ready! Use window.WaterDashboardEnhancer to control manually.');

})();
