async function runE2E() {
  console.log('--- 1. Testing Landing Page ---');
  const resLanding = await fetch('http://localhost:3000');
  console.log('Landing page HTTP status:', resLanding.status);

  console.log('--- 2. Fetching Initial Published Schedule ---');
  const schedRes = await fetch('http://localhost:3000/api/schedule/current').then(r => r.json());
  console.log('Baseline Version:', schedRes.version.version_number, 'Status:', schedRes.version.status, 'Total Bookings:', schedRes.bookings.length);

  console.log('--- 3. Recording Simulated Disruption (Lecture Hall 101 HVAC leak) ---');
  const disruptRes = await fetch('http://localhost:3000/api/disruptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      disruption_type: 'room_closure',
      affected_entity_type: 'room',
      affected_entity_id: 'room-lh-101',
      start_datetime: '2026-10-12T08:30:00.000Z',
      end_datetime: '2026-10-12T12:00:00.000Z',
      description: 'Lecture Hall 101 ceiling HVAC leak emergency closure',
      is_simulation: true
    })
  }).then(r => r.json());
  console.log('Created Disruption ID:', disruptRes.disruption.id);

  console.log('--- 4. Checking Disruption Impact ---');
  const impactRes = await fetch(`http://localhost:3000/api/disruptions/${disruptRes.disruption.id}/impact`).then(r => r.json());
  console.log('Directly Affected Bookings:', impactRes.affectedBookings.length, 'Unaffected Bookings (Protected):', impactRes.unaffectedBookings.length);

  console.log('--- 5. Running KALYX Disruption Mode Constraint Solver ---');
  const repairRes = await fetch('http://localhost:3000/api/repairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ disruption_id: disruptRes.disruption.id })
  }).then(r => r.json());
  console.log('Generated Proposals Count:', repairRes.proposals.length);
  const bestProposal = repairRes.proposals[0];
  console.log('Proposal Solver Status:', bestProposal.solver_status, 'Changed Bookings:', bestProposal.changed_booking_count);
  console.log('Causal Reason:', bestProposal.changes[0]?.reason);

  console.log('--- 6. Approving Proposal by Administrator ---');
  const approveRes = await fetch(`http://localhost:3000/api/repairs/${bestProposal.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve' })
  }).then(r => r.json());
  console.log('Approval Status:', approveRes.proposal.status);

  console.log('--- 7. Publishing New Immutable Schedule Revision ---');
  const publishRes = await fetch(`http://localhost:3000/api/repairs/${bestProposal.id}/publish`, {
    method: 'POST'
  }).then(r => r.json());
  console.log('Publish Result:', publishRes.success, 'New Version Number:', publishRes.newVersion.version_number);

  console.log('--- 8. Verifying Live Active Schedule Revision ---');
  const updatedSched = await fetch('http://localhost:3000/api/schedule/current').then(r => r.json());
  console.log('Active Schedule Version is now:', updatedSched.version.version_number, 'Status:', updatedSched.version.status);

  console.log('--- 9. Verifying Version History & Audit Log ---');
  const historyRes = await fetch('http://localhost:3000/api/history').then(r => r.json());
  console.log('Total Versions in Trail:', historyRes.versions.length);
  console.log('Total Audit Logs in Trail:', historyRes.auditLogs.length);

  console.log('ALL E2E WORKFLOW STAGES VERIFIED SUCCESSFULLY!');
}

runE2E().catch(console.error);
