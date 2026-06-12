(async ()=>{
  const fetch = global.fetch || (await import('node-fetch')).default;
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@example.com', password: 'admin123' }),
  });
  console.log('status', res.status);
  const j = await res.text();
  console.log('body', j);
})();
