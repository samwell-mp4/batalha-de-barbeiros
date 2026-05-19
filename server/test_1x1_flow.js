const http = require('http');

const request = (method, path, body, customHeaders = {}) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function test() {
  console.log('--- STARTING 1x1 WORKFLOW VERIFICATION ---');
  try {
    const barbers = await request('GET', '/api/barbers');
    console.log(`Fetched ${barbers.length} barbers.`);
    if (barbers.length < 2) {
      throw new Error('Need at least 2 barbers in database. Seed first.');
    }
    const b1 = barbers[0];
    const b2 = barbers[1];
    console.log(`Barber 1 (Creator): ${b1.user.name} (${b1.id})`);
    console.log(`Barber 2 (Opponent): ${b2.user.name} (${b2.id})`);

    // ----------------------------------------------------
    // TEST 1: Creation and Acceptance Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Create and Accept Desafio ---');
    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = futureDate.toTimeString().split(' ')[0].substring(0, 5);

    const payload = {
      name: 'Desafio Premium 1x1',
      ligaId: 1,
      modality: 'x1',
      theme: 'Degradê Navalhado',
      prize: 'R$ 500 + Pomada Modeladora',
      votingTime: 2, // 2 hours
      maxParticipants: 2,
      creatorId: b1.id,
      opponentId: b2.id,
      startDate: dateStr,
      startTime: timeStr,
      photo1: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500'
    };

    const champCreated = await request('POST', '/api/championships', payload);
    console.log(`Created Championship: ${champCreated.id}, status: ${champCreated.status}`);
    if (champCreated.status !== 'WAITING') {
      throw new Error(`Expected status WAITING, got: ${champCreated.status}`);
    }

    const champ = await request('GET', `/api/championships/${champCreated.id}`);
    let match = champ.matches?.[0];
    if (!match || match.status !== 'PENDING') {
      throw new Error(`Expected match status PENDING, got: ${match?.status}`);
    }
    console.log(`Generated match status: ${match.status}, photo1: ${match.photo1}, photo2: ${match.photo2}`);

    // Opponent accepts the challenge
    console.log('Opponent accepting challenge with photo2...');
    const acceptRes = await request('POST', `/api/championships/${champ.id}/accept`, {
      photo2: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500'
    });
    console.log('Accept result:', acceptRes);
    if (acceptRes.error) {
      throw new Error(`Failed to accept challenge: ${acceptRes.error}`);
    }

    // Creator starts battle instantly
    console.log('Creator starting battle instantly...');
    const startRes = await request('POST', `/api/championships/${champ.id}/start-now`);
    console.log('Start battle now result:', startRes);
    if (startRes.error) {
      throw new Error(`Failed to start battle: ${startRes.error}`);
    }

    // Verify it is now ONGOING/LIVE
    const details = await request('GET', `/api/championships/${champ.id}`);
    console.log(`Championship status after instant start: ${details.status}`);
    console.log(`Match status after instant start: ${details.matches[0].status}`);
    if (details.status !== 'ONGOING' || details.matches[0].status !== 'LIVE') {
      throw new Error('Championship or Match failed to go LIVE.');
    }

    // ----------------------------------------------------
    // TEST 2: Self-healing: Expiration (Opponent doesn't accept, time passes)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Self-healing Expiration ---');
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 10);
    const pastDateStr = pastDate.toISOString().split('T')[0];
    const pastTimeStr = pastDate.toTimeString().split(' ')[0].substring(0, 5);

    const payloadExpired = {
      name: 'Desafio Expirado Teste',
      ligaId: 1,
      modality: 'x1',
      theme: 'Degradê Navalhado',
      prize: 'Nenhum',
      votingTime: 1,
      maxParticipants: 2,
      creatorId: b1.id,
      opponentId: b2.id,
      startDate: pastDateStr,
      startTime: pastTimeStr,
      photo1: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500'
    };

    const champExp = await request('POST', '/api/championships', payloadExpired);
    console.log(`Created Expired Arena: ${champExp.id}, status on creation: ${champExp.status}`);

    // Call GET details to trigger state synchronization / self-healing
    console.log('Requesting details to trigger self-healing sync...');
    const detailsExp = await request('GET', `/api/championships/${champExp.id}`);
    console.log(`Status after sync check: ${detailsExp.status}`);
    console.log(`Match status after sync check: ${detailsExp.matches[0].status}`);
    
    if (detailsExp.status !== 'FINISHED' || detailsExp.matches[0].status !== 'FINISHED') {
      throw new Error('Championship should have expired and transitioned to FINISHED.');
    }
    console.log('Self-healing expiration check passed.');

    // ----------------------------------------------------
    // TEST 3: Self-healing: Auto-Start (Opponent accepted, start date/time passed)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Self-healing Auto-Start ---');
    const payloadAutoStart = {
      name: 'Desafio Auto-Start Teste',
      ligaId: 1,
      modality: 'x1',
      theme: 'Degradê Navalhado',
      prize: 'Nenhum',
      votingTime: 1,
      maxParticipants: 2,
      creatorId: b1.id,
      opponentId: b2.id,
      startDate: pastDateStr,
      startTime: pastTimeStr,
      photo1: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500'
    };

    const champAuto = await request('POST', '/api/championships', payloadAutoStart);
    console.log(`Created Auto-start Arena: ${champAuto.id}, status: ${champAuto.status}`);

    // Opponent accepts
    console.log('Opponent accepting auto-start challenge...');
    const acceptAutoTime = new Date(pastDate.getTime() - 5 * 60 * 1000).toISOString();
    const acceptAutoRes = await request('POST', `/api/championships/${champAuto.id}/accept`, {
      photo2: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500'
    }, {
      'x-test-current-time': acceptAutoTime
    });
    console.log('Accept result:', acceptAutoRes);

    // Call GET details to trigger auto-start self-healing sync
    console.log('Requesting details to trigger self-healing sync for auto-start...');
    const syncTime = new Date().toISOString();
    const detailsAuto = await request('GET', `/api/championships/${champAuto.id}`, null, {
      'x-test-current-time': syncTime
    });
    console.log(`Status after sync check: ${detailsAuto.status}`);
    console.log(`Match status after sync check: ${detailsAuto.matches[0].status}`);

    if (detailsAuto.status !== 'ONGOING' || detailsAuto.matches[0].status !== 'LIVE') {
      throw new Error('Championship should have auto-started and transitioned to ONGOING/LIVE.');
    }
    console.log('Self-healing auto-start check passed.');

    console.log('\n--- ALL 1x1 WORKFLOW VERIFICATIONS PASSED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('\n--- VERIFICATION FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

test();
