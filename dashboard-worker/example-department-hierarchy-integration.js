/**
 * Example: How Department Pages Integrate with Natural Hierarchy Aggregation System
 *
 * This demonstrates how existing department pages (like Marketing, Operations)
 * can seamlessly integrate with the new hierarchy system without modification.
 */

// Marketing Department Integration Example
async function loadMarketingDepartmentHierarchy() {
  console.log('🏢 Loading Marketing Department Hierarchy');

  // 1. Search for all Marketing people across all systems
  const allMarketingPeople = await fetch('/api/hierarchy/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      department: 'Marketing',
      // No sourceSystem filter - gets ALL systems naturally
    }),
  });

  const marketingData = await allMarketingPeople.json();
  console.log('📊 Marketing Results:', marketingData);

  /*
     Expected results show same people across different systems:
     - Sarah Johnson (Chief Marketing Officer) - from organizational system
     - Sarah Johnson (Marketing Director) - from department system  
     - Potential cross-references with 95% confidence
    */

  // 2. Get system-specific views when needed
  const orgChartView = await fetch('/api/hierarchy/view/organizational').then(r => r.json());
  const deptSpecificView = await fetch('/api/hierarchy/view/departments').then(r => r.json());

  // 3. Find leadership naturally
  const marketingLeadership = await fetch('/api/hierarchy/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      department: 'Marketing',
      isLeadership: true,
    }),
  });

  const leadership = await marketingLeadership.json();
  console.log('👑 Marketing Leadership:', leadership.results);

  return {
    allPeople: marketingData.results,
    leadership: leadership.results,
    orgChart: orgChartView,
    departmentSpecific: deptSpecificView.view.departments.Marketing || [],
  };
}

// Operations Department Integration Example
async function loadOperationsDepartmentHierarchy() {
  console.log('⚙️ Loading Operations Department Hierarchy');

  // Natural query for Operations department
  const operationsQuery = await fetch('/api/hierarchy/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      department: 'Operations',
    }),
  });

  const operationsData = await operationsQuery.json();

  /*
     Results show Jennifer Wilson across systems:
     - VP of Operations (department system)
     - Potential org chart entry
     - Any Fire22 agent connections
    */

  // Get cross-references to see connections
  const crossRefs = await fetch('/api/hierarchy/cross-references').then(r => r.json());
  const operationsCrossRefs = crossRefs.crossReferences.filter(ref =>
    ref.connections.some(
      conn => conn.title.toLowerCase().includes('operations') || conn.system === 'department'
    )
  );

  console.log('🔗 Operations Cross-References:', operationsCrossRefs);

  return {
    allPeople: operationsData.results,
    crossReferences: operationsCrossRefs,
    teamLead: operationsData.results.find(p => p.context?.isLeadership),
    managers: operationsData.results.filter(p => p.context?.isManager),
  };
}

// Fire22 Agents Integration Example
async function loadFire22AgentsView() {
  console.log('🎯 Loading Fire22 Agents (Preserved 8-Level Structure)');

  // Get Fire22 agents in their original structure
  const fire22View = await fetch('/api/hierarchy/view/fire22').then(r => r.json());

  /*
     Fire22 system completely preserved:
     - Level 1: Master Agent
     - Level 2: Senior Master Agent  
     - Level 3: Agent
     - Level 4: Senior Agent
     - Level 5: Sub-Agent
     - Level 6: Senior Sub-Agent
     - Level 7: Basic Agent
     - Level 8: Clerk
    */

  console.log('🏆 Fire22 Agent Hierarchy:', fire22View.view);

  // Can also query Fire22 agents specifically
  const fire22Query = await fetch('/api/hierarchy/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceSystem: 'fire22',
    }),
  });

  const fire22Data = await fire22Query.json();
  console.log('🎲 Fire22 Query Results:', fire22Data);

  return {
    originalStructure: fire22View.view,
    queryResults: fire22Data.results,
    masterAgents: fire22Data.results.filter(agent => agent.sourceData?.level === 1),
    clerks: fire22Data.results.filter(agent => agent.sourceData?.level === 8),
  };
}

// Cross-System Analysis Example
async function analyzeOrganizationalConnections() {
  console.log('🔍 Analyzing Cross-System Connections');

  // Get complete aggregated view
  const aggregated = await fetch('/api/hierarchy/aggregated').then(r => r.json());

  // Analyze cross-references for insights
  const crossRefs = await fetch('/api/hierarchy/cross-references').then(r => r.json());

  const analysis = {
    totalPeople: {
      fire22: aggregated.data.fire22View.length,
      organizational: aggregated.data.organizationalView.length,
      departments: Object.values(aggregated.data.departmentViews).flat().length,
    },

    highConfidenceMatches: crossRefs.crossReferences.filter(
      ref => ref.confidence > 0.9 && ref.likely_same_person
    ),

    potentialDuplicates: crossRefs.crossReferences.filter(
      ref => ref.connections.length > 1 && ref.likely_same_person
    ),

    leadership: aggregated.data.leadership,
    managers: aggregated.data.managers,
  };

  console.log('📈 Organizational Analysis:', analysis);

  // Example insights
  const insights = {
    duplicateCount: analysis.potentialDuplicates.length,
    systemOverlap: `${analysis.highConfidenceMatches.length} high-confidence cross-system matches`,
    leadershipSpan: `${analysis.leadership.length} leaders across all systems`,
    managerialLayers: `${analysis.managers.length} managers identified naturally`,
  };

  console.log('💡 Key Insights:', insights);

  return analysis;
}

// Department Page Enhancement Example
function enhanceDepartmentPageWithHierarchy(departmentName) {
  /*
     This shows how existing department pages can be enhanced
     WITHOUT modification to display hierarchy data
    */

  const script = document.createElement('script');
  script.textContent = `
        // Add to existing department page
        async function loadDepartmentHierarchy() {
            try {
                // Load department hierarchy data
                const response = await fetch('/api/hierarchy/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ department: '${departmentName}' })
                });
                
                const data = await response.json();
                
                // Enhance existing team display
                const teamGrid = document.querySelector('.team-grid');
                if (teamGrid && data.results) {
                    data.results.forEach(person => {
                        const existingMember = Array.from(teamGrid.children)
                            .find(member => 
                                member.textContent.includes(person.name)
                            );
                            
                        if (existingMember) {
                            // Add system badge
                            const badge = document.createElement('span');
                            badge.textContent = person.sourceSystem.toUpperCase();
                            badge.style.cssText = \`
                                position: absolute;
                                top: 5px;
                                right: 5px;
                                background: var(--dept-primary);
                                color: white;
                                padding: 2px 6px;
                                border-radius: 4px;
                                font-size: 10px;
                            \`;
                            existingMember.style.position = 'relative';
                            existingMember.appendChild(badge);
                        }
                    });
                }
            } catch (error) {
                console.log('Hierarchy enhancement failed gracefully:', error);
                // Page continues to work normally
            }
        }
        
        // Load when page is ready
        document.addEventListener('DOMContentLoaded', loadDepartmentHierarchy);
    `;

  document.head.appendChild(script);

  console.log(`✨ Enhanced ${departmentName} department page with hierarchy data`);
}

// Usage Examples
async function demonstrateHierarchyIntegration() {
  console.log('🚀 Demonstrating Natural Hierarchy System Integration');
  console.log('!==!==!==!==!==!==!==!==!==');

  // Load different department views
  const marketing = await loadMarketingDepartmentHierarchy();
  const operations = await loadOperationsDepartmentHierarchy();
  const fire22 = await loadFire22AgentsView();

  // Analyze connections
  const analysis = await analyzeOrganizationalConnections();

  // Show how existing pages can be enhanced
  enhanceDepartmentPageWithHierarchy('Marketing');
  enhanceDepartmentPageWithHierarchy('Operations');

  console.log('✅ Integration demonstration complete');
  console.log('💡 Key Benefits:');
  console.log('   - No existing system modifications required');
  console.log('   - Natural discovery of cross-system connections');
  console.log('   - Preserved original system structures');
  console.log('   - Single API for all organizational data');
  console.log('   - Confidence-based relationship scoring');
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = {
    loadMarketingDepartmentHierarchy,
    loadOperationsDepartmentHierarchy,
    loadFire22AgentsView,
    analyzeOrganizationalConnections,
    enhanceDepartmentPageWithHierarchy,
    demonstrateHierarchyIntegration,
  };
}
