const { authenticateUser } = require('../lib/auth');
(async ()=>{
  try{
    const u = await authenticateUser('alice@example.com','admin123');
    console.log('authenticateUser result:', u);
  }catch(e){console.error('ERR',e.message||e)}
})();
