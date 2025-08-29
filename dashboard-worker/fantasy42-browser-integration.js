/**
 * Fire22 Fantasy42 Browser Integration
 * Browser extension/userscript for Fantasy42 website integration
 * Copy this script and run it in your browser console or create a userscript
 */

(function() {
    'use strict';

    // Fire22 Fantasy42 Integration
    window.Fire22 = window.Fire22 || {};

    // DOM Analysis Module
    window.Fire22.DOMAnalyzer = {
        pageStructure: null,
        elementCache: new Map(),
        automationScripts: new Map(),

        /**
         * Initialize the DOM analyzer
         */
        async initialize() {
            console.log('🔍 Fire22 DOM Analyzer initializing...');

            // Inject CSS for UI elements
            this.injectStyles();

            // Add floating control panel
            this.createControlPanel();

            // Analyze current page
            await this.analyzeCurrentPage();

            // Setup page monitoring
            this.setupPageMonitoring();

            // Load automation scripts
            this.loadDefaultScripts();

            console.log('✅ Fire22 DOM Analyzer ready!');
            console.log('💡 Try: Fire22.analyzePage() or Fire22.findElement({text: "customer"})');
        },

        /**
         * Inject custom styles
         */
        injectStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .fire22-control-panel {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 12px;
                    min-width: 200px;
                }

                .fire22-control-panel h4 {
                    margin: 0 0 10px 0;
                    font-size: 14px;
                    font-weight: bold;
                }

                .fire22-control-panel button {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 5px 10px;
                    margin: 2px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.3s ease;
                }

                .fire22-control-panel button:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-1px);
                }

                .fire22-highlight {
                    outline: 3px solid #ff6b6b !important;
                    outline-offset: 2px !important;
                    background: rgba(255,107,107,0.1) !important;
                    animation: fire22-pulse 1s infinite;
                }

                @keyframes fire22-pulse {
                    0% { outline-color: #ff6b6b; }
                    50% { outline-color: #4ecdc4; }
                    100% { outline-color: #ff6b6b; }
                }

                .fire22-tooltip {
                    position: absolute;
                    background: rgba(0,0,0,0.9);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    z-index: 10001;
                    pointer-events: none;
                    max-width: 300px;
                    word-wrap: break-word;
                }

                .fire22-results-panel {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    background: rgba(255,255,255,0.95);
                    border-radius: 10px;
                    padding: 15px;
                    max-width: 400px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 9999;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                }

                .fire22-results-panel h5 {
                    margin: 0 0 10px 0;
                    color: #333;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .fire22-results-panel pre {
                    margin: 0;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Create floating control panel
         */
        createControlPanel() {
            const panel = document.createElement('div');
            panel.className = 'fire22-control-panel';
            panel.innerHTML = `
                <h4>🔥 Fire22 Analyzer</h4>
                <button onclick="Fire22.analyzePage()">📊 Analyze Page</button>
                <button onclick="Fire22.findCustomers()">👥 Find Customers</button>
                <button onclick="Fire22.findAgents()">🏢 Find Agents</button>
                <button onclick="Fire22.findTransactions()">💰 Find Transactions</button>
                <button onclick="Fire22.showPageInfo()">ℹ️ Page Info</button>
                <button onclick="Fire22.exportAnalysis()">📤 Export Data</button>
                <button onclick="Fire22.togglePanel()" style="background: rgba(255,0,0,0.3)">❌ Close</button>
            `;
            document.body.appendChild(panel);

            // Make panel draggable
            this.makeDraggable(panel);
        },

        /**
         * Make element draggable
         */
        makeDraggable(element) {
            let isDragging = false;
            let startX, startY, startLeft, startTop;

            element.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(element.style.left || element.offsetLeft);
                startTop = parseInt(element.style.top || element.offsetTop);
                element.style.position = 'fixed';
                element.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                element.style.left = (startLeft + deltaX) + 'px';
                element.style.top = (startTop + deltaY) + 'px';
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                element.style.cursor = 'grab';
            });
        },

        /**
         * Analyze current page
         */
        async analyzeCurrentPage() {
            console.log('📊 Analyzing Fantasy42 page...');

            const structure = {
                url: window.location.href,
                title: document.title,
                timestamp: new Date().toISOString(),
                elements: {
                    total: document.querySelectorAll('*').length,
                    forms: document.forms.length,
                    links: document.links.length,
                    images: document.images.length,
                    scripts: document.scripts.length
                },
                mainContent: [],
                navigation: [],
                forms: [],
                tables: [],
                buttons: [],
                customerElements: [],
                agentElements: [],
                transactionElements: []
            };

            // Find main content
            structure.mainContent = this.findElements([
                '[class*="content"]', '[class*="main"]', '[class*="container"]',
                '[id*="content"]', '[id*="main"]', 'div.row', 'div.col'
            ]);

            // Find navigation
            structure.navigation = this.findElements([
                'nav', '[class*="nav"]', '[class*="menu"]', '.navbar', '.sidebar'
            ]);

            // Find forms
            structure.forms = Array.from(document.forms).map(form => this.analyzeForm(form));

            // Find tables
            structure.tables = this.findElements('table');

            // Find buttons
            structure.buttons = this.findElements([
                'button', '[type="button"]', '[type="submit"]', '.btn', 'input[type="button"]', 'input[type="submit"]'
            ]);

            // Find domain-specific elements
            structure.customerElements = this.findElements([
                '[class*="customer"]', '[class*="player"]', '[class*="user"]',
                '[id*="customer"]', '[id*="player"]', 'tr[class*="customer"]',
                'tr[class*="player"]', '[data-field*="customer"]'
            ]);

            structure.agentElements = this.findElements([
                '[class*="agent"]', '[id*="agent"]', '.agent-tree',
                '[data-action*="agent"]', 'tr[class*="agent"]'
            ]);

            structure.transactionElements = this.findElements([
                '[class*="transaction"]', '[class*="payment"]', '[class*="cash"]',
                '[id*="transaction"]', '[data-action*="transaction"]',
                'tr[class*="transaction"]', 'tr[class*="payment"]'
            ]);

            this.pageStructure = structure;

            console.log(`✅ Analysis complete:`, structure);
            return structure;
        },

        /**
         * Find elements by selectors
         */
        findElements(selectors) {
            const elements = [];
            const selectorList = Array.isArray(selectors) ? selectors : [selectors];

            selectorList.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    found.forEach(el => {
                        if (el instanceof HTMLElement) {
                            elements.push(this.createElementInfo(el));
                        }
                    });
                } catch (error) {
                    console.warn(`Invalid selector: ${selector}`);
                }
            });

            return elements;
        },

        /**
         * Create element info object
         */
        createElementInfo(element) {
            const info = {
                tagName: element.tagName.toLowerCase(),
                id: element.id || null,
                className: element.className || null,
                xpath: this.getElementXPath(element),
                attributes: {},
                textContent: element.textContent?.trim() || null,
                isVisible: this.isElementVisible(element),
                boundingRect: element.getBoundingClientRect()
            };

            // Extract key attributes
            ['data-action', 'data-field', 'name', 'type', 'placeholder', 'href', 'onclick'].forEach(attr => {
                if (element.hasAttribute(attr)) {
                    info.attributes[attr] = element.getAttribute(attr);
                }
            });

            return info;
        },

        /**
         * Analyze form
         */
        analyzeForm(form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            const formInfo = {
                action: form.action,
                method: form.method,
                id: form.id,
                className: form.className,
                inputs: Array.from(inputs).map(input => ({
                    name: input.name,
                    type: input.type,
                    id: input.id,
                    value: (input as HTMLInputElement).value,
                    placeholder: input.getAttribute('placeholder')
                }))
            };

            return formInfo;
        },

        /**
         * Get XPath for element
         */
        getElementXPath(element) {
            if (element.id) {
                return `//*[@id="${element.id}"]`;
            }

            if (element.name) {
                return `//${element.tagName.toLowerCase()}[@name="${element.name}"]`;
            }

            const parts = [];
            let current = element;

            while (current && current.nodeType === Node.ELEMENT_NODE) {
                let index = 0;
                let sibling = current.previousElementSibling;

                while (sibling) {
                    if (sibling.tagName === current.tagName) {
                        index++;
                    }
                    sibling = sibling.previousElementSibling;
                }

                const tagName = current.tagName.toLowerCase();
                const pathSegment = index > 0 ? `${tagName}[${index + 1}]` : tagName;
                parts.unshift(pathSegment);

                current = current.parentElement;
            }

            return `/${parts.join('/')}`;
        },

        /**
         * Check if element is visible
         */
        isElementVisible(element) {
            const style = window.getComputedStyle(element);
            return style.display !== 'none' &&
                   style.visibility !== 'hidden' &&
                   element.offsetWidth > 0 &&
                   element.offsetHeight > 0;
        },

        /**
         * Setup page monitoring
         */
        setupPageMonitoring() {
            // Monitor DOM changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        console.log('🔄 DOM changed, new elements detected');
                        this.analyzeNewElements(mutation.addedNodes);
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Monitor URL changes
            let currentUrl = window.location.href;
            setInterval(() => {
                if (window.location.href !== currentUrl) {
                    console.log(`🔄 URL changed to: ${window.location.href}`);
                    currentUrl = window.location.href;
                    this.analyzeCurrentPage();
                }
            }, 2000);

            console.log('👀 Page monitoring active');
        },

        /**
         * Analyze new elements
         */
        analyzeNewElements(nodes) {
            nodes.forEach(node => {
                if (node instanceof HTMLElement) {
                    const elementInfo = this.createElementInfo(node);

                    // Check for interesting elements
                    if (elementInfo.attributes['data-action'] === 'get-transactions') {
                        console.log('💰 Transaction link found:', elementInfo);
                        this.highlightElement(node, 'Transaction Link');
                    }

                    if (elementInfo.className && elementInfo.className.includes('customer')) {
                        console.log('👤 Customer element found:', elementInfo);
                        this.highlightElement(node, 'Customer Element');
                    }

                    if (elementInfo.className && elementInfo.className.includes('agent')) {
                        console.log('🏢 Agent element found:', elementInfo);
                        this.highlightElement(node, 'Agent Element');
                    }
                }
            });
        },

        /**
         * Highlight element
         */
        highlightElement(element, label) {
            element.classList.add('fire22-highlight');

            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'fire22-tooltip';
            tooltip.textContent = label;
            tooltip.style.left = (element.offsetLeft + element.offsetWidth + 10) + 'px';
            tooltip.style.top = element.offsetTop + 'px';
            document.body.appendChild(tooltip);

            // Remove highlight after 3 seconds
            setTimeout(() => {
                element.classList.remove('fire22-highlight');
                tooltip.remove();
            }, 3000);
        },

        /**
         * Load default automation scripts
         */
        loadDefaultScripts() {
            // Customer search script
            this.automationScripts.set('customer-search', {
                name: 'Customer Search',
                steps: [
                    { action: 'find', selector: 'input[placeholder*="search"]', value: '{searchTerm}' },
                    { action: 'click', selector: 'button[data-action="search"]', delay: 500 }
                ]
            });

            // Transaction processing
            this.automationScripts.set('transaction-processing', {
                name: 'Transaction Processing',
                steps: [
                    { action: 'click', selector: 'a[data-action="get-transactions"]', delay: 1000 },
                    { action: 'input', selector: 'input[name="amount"]', value: '{amount}' }
                ]
            });

            console.log(`✅ Loaded ${this.automationScripts.size} automation scripts`);
        },

        /**
         * Find customers on page
         */
        findCustomers() {
            const customers = this.findElements([
                '[class*="customer"]', '[class*="player"]', '[class*="user"]',
                'tr[class*="customer"]', 'tr[class*="player"]',
                '[data-field*="customer"]', '[data-field*="player"]'
            ]);

            console.log(`👥 Found ${customers.length} customer-related elements:`, customers);
            this.showResults('Customer Elements', customers);
            return customers;
        },

        /**
         * Find agents on page
         */
        findAgents() {
            const agents = this.findElements([
                '[class*="agent"]', '[id*="agent"]', '.agent-tree',
                '[data-action*="agent"]', 'tr[class*="agent"]'
            ]);

            console.log(`🏢 Found ${agents.length} agent-related elements:`, agents);
            this.showResults('Agent Elements', agents);
            return agents;
        },

        /**
         * Find transactions on page
         */
        findTransactions() {
            const transactions = this.findElements([
                '[class*="transaction"]', '[class*="payment"]', '[class*="cash"]',
                '[id*="transaction"]', '[data-action*="transaction"]',
                'tr[class*="transaction"]', 'tr[class*="payment"]'
            ]);

            console.log(`💰 Found ${transactions.length} transaction-related elements:`, transactions);
            this.showResults('Transaction Elements', transactions);
            return transactions;
        },

        /**
         * Show page information
         */
        showPageInfo() {
            const info = {
                url: window.location.href,
                title: document.title,
                userAgent: navigator.userAgent,
                cookie: document.cookie,
                timestamp: new Date().toISOString(),
                elementCounts: {
                    total: document.querySelectorAll('*').length,
                    forms: document.forms.length,
                    links: document.links.length,
                    images: document.images.length,
                    scripts: document.scripts.length,
                    styles: document.styleSheets.length
                },
                pageStructure: this.pageStructure
            };

            console.log('ℹ️ Page Information:', info);
            this.showResults('Page Information', info);
            return info;
        },

        /**
         * Export analysis data
         */
        exportAnalysis() {
            const data = {
                pageAnalysis: this.pageStructure,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `fantasy42-analysis-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('📤 Analysis data exported');
        },

        /**
         * Show results panel
         */
        showResults(title, data) {
            // Remove existing panel
            const existing = document.querySelector('.fire22-results-panel');
            if (existing) existing.remove();

            const panel = document.createElement('div');
            panel.className = 'fire22-results-panel';
            panel.innerHTML = `
                <h5>${title}</h5>
                <pre>${JSON.stringify(data, null, 2)}</pre>
                <button onclick="this.parentElement.remove()" style="margin-top: 10px;">Close</button>
            `;

            document.body.appendChild(panel);
        },

        /**
         * Toggle control panel
         */
        togglePanel() {
            const panel = document.querySelector('.fire22-control-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        }
    };

    // Global API functions
    window.Fire22.analyzePage = async () => {
        return await window.Fire22.DOMAnalyzer.analyzeCurrentPage();
    };

    window.Fire22.findCustomers = () => {
        return window.Fire22.DOMAnalyzer.findCustomers();
    };

    window.Fire22.findAgents = () => {
        return window.Fire22.DOMAnalyzer.findAgents();
    };

    window.Fire22.findTransactions = () => {
        return window.Fire22.DOMAnalyzer.findTransactions();
    };

    window.Fire22.showPageInfo = () => {
        return window.Fire22.DOMAnalyzer.showPageInfo();
    };

    window.Fire22.exportAnalysis = () => {
        window.Fire22.DOMAnalyzer.exportAnalysis();
    };

    window.Fire22.togglePanel = () => {
        window.Fire22.DOMAnalyzer.togglePanel();
    };

    window.Fire22.findElement = (criteria) => {
        return window.Fire22.DOMAnalyzer.findElements(criteria);
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.Fire22.DOMAnalyzer.initialize();
        });
    } else {
        window.Fire22.DOMAnalyzer.initialize();
    }

    console.log('🔥 Fire22 Fantasy42 Integration loaded!');
    console.log('💡 Available commands:');
    console.log('   Fire22.analyzePage() - Analyze current page');
    console.log('   Fire22.findCustomers() - Find customer elements');
    console.log('   Fire22.findAgents() - Find agent elements');
    console.log('   Fire22.findTransactions() - Find transaction elements');
    console.log('   Fire22.showPageInfo() - Show page information');
    console.log('   Fire22.exportAnalysis() - Export analysis data');

})();
