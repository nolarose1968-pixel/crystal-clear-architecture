#!/usr/bin/env bun

/**
 * 🔥 Fire22 Demo Data Population Script
 * Populate the Fire22 system with realistic demo data for testing
 */

interface DemoAgent {
  agentID: string;
  agentName: string;
  agentType: 'M' | 'A' | 'P';
  status: 'Active' | 'Inactive' | 'Suspended';
  balance: number;
  creditLimit: number;
  commission: number;
  parentAgent?: string;
}

interface DemoWager {
  betId: string;
  customerId: string;
  agentId: string;
  selection: string;
  stake: number;
  odds: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'void';
  placedAt: string;
  sport: string;
}

async function populateDemoData(): Promise<void> {
  console.log('🔥 Fire22 Demo Data Population');
  console.log('='.repeat(50));

  const baseUrl = 'https://dashboard-worker.nolarose1968-806.workers.dev';

  try {
    // Test if the system is accessible
    console.log('🔍 Testing system connectivity...');
    const healthResponse = await fetch(`${baseUrl}/health`);

    if (!healthResponse.ok) {
      console.log('❌ Fire22 system not accessible. Please check deployment.');
      return;
    }

    console.log('✅ Fire22 system is accessible');

    // Demo Agents Data
    const demoAgents: DemoAgent[] = [
      {
        agentID: 'BLAKEPPH',
        agentName: 'Blake Phillips - Master Agent',
        agentType: 'M',
        status: 'Active',
        balance: 75000,
        creditLimit: 150000,
        commission: 3.5,
      },
      {
        agentID: 'BLAKEPPH-SUB1',
        agentName: 'Blake Sub Agent 1',
        agentType: 'A',
        status: 'Active',
        balance: 25000,
        creditLimit: 50000,
        commission: 2.5,
        parentAgent: 'BLAKEPPH',
      },
      {
        agentID: 'BLAKEPPH-SUB2',
        agentName: 'Blake Sub Agent 2',
        agentType: 'A',
        status: 'Active',
        balance: 18000,
        creditLimit: 40000,
        commission: 2.0,
        parentAgent: 'BLAKEPPH',
      },
      {
        agentID: 'NOLAROSE',
        agentName: 'Nola Rose - Agent',
        agentType: 'A',
        status: 'Active',
        balance: 32000,
        creditLimit: 60000,
        commission: 2.8,
        parentAgent: 'BLAKEPPH',
      },
    ];

    // Demo Wagers Data
    const demoWagers: DemoWager[] = [
      {
        betId: 'BET001',
        customerId: 'CUST001',
        agentId: 'BLAKEPPH',
        selection: 'Lakers vs Warriors - Lakers ML',
        stake: 500,
        odds: 1.85,
        potentialWin: 925,
        status: 'pending',
        placedAt: new Date().toISOString(),
        sport: 'Basketball',
      },
      {
        betId: 'BET002',
        customerId: 'CUST002',
        agentId: 'BLAKEPPH-SUB1',
        selection: 'Chiefs vs Bills - Over 47.5',
        stake: 250,
        odds: 1.91,
        potentialWin: 477.5,
        status: 'pending',
        placedAt: new Date(Date.now() - 300000).toISOString(),
        sport: 'Football',
      },
      {
        betId: 'BET003',
        customerId: 'CUST003',
        agentId: 'NOLAROSE',
        selection: 'Dodgers vs Yankees - Dodgers -1.5',
        stake: 750,
        odds: 2.1,
        potentialWin: 1575,
        status: 'pending',
        placedAt: new Date(Date.now() - 600000).toISOString(),
        sport: 'Baseball',
      },
      {
        betId: 'BET004',
        customerId: 'CUST004',
        agentId: 'BLAKEPPH-SUB2',
        selection: 'Real Madrid vs Barcelona - Draw',
        stake: 300,
        odds: 3.2,
        potentialWin: 960,
        status: 'pending',
        placedAt: new Date(Date.now() - 900000).toISOString(),
        sport: 'Soccer',
      },
      {
        betId: 'BET005',
        customerId: 'CUST005',
        agentId: 'BLAKEPPH',
        selection: 'Celtics vs Heat - Celtics -3.5',
        stake: 1000,
        odds: 1.95,
        potentialWin: 1950,
        status: 'pending',
        placedAt: new Date(Date.now() - 1200000).toISOString(),
        sport: 'Basketball',
      },
    ];

    // Populate Agents
    console.log('\n👥 Populating Demo Agents...');
    for (const agent of demoAgents) {
      try {
        const response = await fetch(`${baseUrl}/api/demo/agents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer demo-token',
          },
          body: JSON.stringify(agent),
        });

        if (response.ok) {
          console.log(`   ✅ Created agent: ${agent.agentID} (${agent.agentName})`);
        } else {
          console.log(`   ⚠️ Agent ${agent.agentID}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to create agent ${agent.agentID}: ${error.message}`);
      }
    }

    // Populate Wagers
    console.log('\n🎯 Populating Demo Wagers...');
    for (const wager of demoWagers) {
      try {
        const response = await fetch(`${baseUrl}/api/demo/wagers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer demo-token',
          },
          body: JSON.stringify(wager),
        });

        if (response.ok) {
          console.log(
            `   ✅ Created wager: ${wager.betId} ($${wager.stake} on ${wager.selection.substring(0, 30)}...)`
          );
        } else {
          console.log(`   ⚠️ Wager ${wager.betId}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to create wager ${wager.betId}: ${error.message}`);
      }
    }

    // Test Fire22 API with demo data
    console.log('\n🔥 Testing Fire22 API with Demo Data...');

    const apiTests = [
      {
        name: 'Get Agent List',
        endpoint: '/cloud/api/Manager/getListAgenstByAgent',
        data: 'agentID=BLAKEPPH&agentType=M&operation=getListAgenstByAgent&agentOwner=BLAKEPPH&agentSite=1',
      },
      {
        name: 'Get Account Info',
        endpoint: '/cloud/api/Manager/getAccountInfo',
        data: 'agentID=BLAKEPPH&operation=getAccountInfo&agentOwner=BLAKEPPH&agentSite=1',
      },
      {
        name: 'Get Agent Performance',
        endpoint: '/cloud/api/Manager/getAgentPerformance',
        data: 'agentID=BLAKEPPH&operation=getAgentPerformance&agentOwner=BLAKEPPH&agentSite=1',
      },
    ];

    for (const test of apiTests) {
      try {
        const response = await fetch(`${baseUrl}${test.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Authorization: 'Bearer demo-token',
          },
          body: test.data,
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${test.name}: Success`);
          if (data.data) {
            console.log(`      📊 Data: ${JSON.stringify(data.data).substring(0, 100)}...`);
          }
        } else {
          console.log(`   ⚠️ ${test.name}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }

    // Summary
    console.log('\n🎯 Demo Data Population Summary');
    console.log('='.repeat(50));
    console.log(`✅ Agents Created: ${demoAgents.length}`);
    console.log(`✅ Wagers Created: ${demoWagers.length}`);
    console.log(
      `💰 Total Pending Amount: $${demoWagers.reduce((sum, w) => sum + w.stake, 0).toLocaleString()}`
    );
    console.log(
      `🎲 Total Potential Wins: $${demoWagers.reduce((sum, w) => sum + w.potentialWin, 0).toLocaleString()}`
    );

    console.log('\n🔗 Access Your Fire22 Dashboard:');
    console.log(`   🔥 Fire22 Dashboard: ${baseUrl}/fire22`);
    console.log(`   🖥️ Manager Interface: ${baseUrl}/manager`);
    console.log(`   📊 Legacy Dashboard: ${baseUrl}/dashboard`);

    console.log('\n🚀 Demo data population completed!');
    console.log('   Refresh your dashboard to see the new data.');
  } catch (error) {
    console.error('\n❌ Demo data population failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure the Fire22 system is deployed and running');
    console.log('   2. Check if the URL is accessible');
    console.log('   3. Verify network connectivity');
  }
}

// Run if called directly
if (import.meta.main) {
  populateDemoData();
}

export { populateDemoData };
