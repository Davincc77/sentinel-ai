import React, {useState} from 'react';

// Lightweight placeholder for Buy $CLAW button with OnchainKit integration scaffold
export default function BuyClawButton(){
  const [loading,setLoading] = useState(false);
  const [status,setStatus] = useState('');
  const [email,setEmail] = useState('');

  const handleBuy = async()=>{
    setLoading(true);
    setStatus('Initializing wallet...');
    try{
      // Placeholder: In real app, initialize OnchainKit wallet & perform swap
      await new Promise(r=>setTimeout(r,800));
      setStatus('Swap simulated: purchased 1 CLAW');
      // Opt-in option can be email signup or Botchan tx mock
    }catch(e){
      setStatus('Error: '+String(e));
    }finally{
      setLoading(false);
    }
  };

  const handleEmailSignup = async(e)=>{
    e.preventDefault();
    if(!email.includes('@')){ setStatus('Enter a valid email'); return; }
    setStatus('Opt-in saved for email: '+email);
  };

  return (
    <div style={{border:'1px solid #e5e7eb', padding:16, borderRadius:8, minWidth:260}}>
      <h3 style={{marginTop:0}}>Buy $CLAW & Get Signals</h3>
      <button onClick={handleBuy} disabled={loading} style={{padding:'8px 12px', borderRadius:6, background:'#4f46e5', color:'#fff', border:'none'}}>Buy $CLAW</button>
      <p style={{marginTop:8, fontSize:12, color:'#6b7280'}}>{status}</p>
      <form onSubmit={handleEmailSignup} style={{marginTop:12}}>
        <label htmlFor="email" style={{display:'block', fontSize:12, color:'#374151'}}>Get signals by email</label>
        <input id="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #d1d5db'}}/>
        <button type="submit" style={{marginTop:6, padding:'6px 10px', borderRadius:6, background:'#10b981', color:'#fff', border:'none'}}>Join Signals</button>
      </form>
    </div>
  );
}
