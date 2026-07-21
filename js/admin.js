
(function(){
  "use strict";
  const SUPABASE_URL="https://qububoefefjicecefqzr.supabase.co";
  const SUPABASE_KEY="sb_publishable_4PRkvLz6DAKYv0GODqoNNQ_vKCpLtg-";
  const root=document.getElementById("admin-app");

  if(!window.supabase?.createClient){
    root.innerHTML='<div class="login-wrap"><div class="card error"><h2>Connection Error</h2><p>The Supabase library could not load. Refresh the page or check the internet connection.</p></div></div>';
    return;
  }

  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const state={session:null,profile:null,orders:[],customers:[],tab:"orders",loading:true,message:"",error:"",subscription:null};

  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
  const money=value=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(value||0));
  const dateTime=value=>value?new Date(value).toLocaleString():"—";

  async function getProfile(userId){
    const {data,error}=await client.from("profiles")
      .select("id,username,full_name,email,phone,points,role,is_active")
      .eq("id",userId).single();
    if(error) throw new Error("Profile error: "+error.message);
    return data;
  }

  function ownerAllowed(){
    return ["owner","manager"].includes(state.profile?.role)&&state.profile?.is_active!==false;
  }

  async function refreshData(){
    if(!ownerAllowed()) return;
    state.loading=true;render();
    const [ordersResult,customersResult]=await Promise.all([
      client.from("orders")
        .select("*,order_items(*)")
        .order("created_at",{ascending:false})
        .limit(200),
      client.from("profiles")
        .select("id,username,full_name,email,phone,points,role,is_active,created_at")
        .order("created_at",{ascending:false})
        .limit(500)
    ]);
    if(ordersResult.error) throw new Error("Orders: "+ordersResult.error.message);
    if(customersResult.error) throw new Error("Customers: "+customersResult.error.message);
    state.orders=ordersResult.data||[];
    state.customers=customersResult.data||[];
    state.loading=false;
    render();
  }

  function startRealtime(){
    if(state.subscription) client.removeChannel(state.subscription);
    state.subscription=client.channel("chef-maurice-owner-live")
      .on("postgres_changes",{event:"*",schema:"public",table:"orders"},()=>refreshData().catch(showError))
      .on("postgres_changes",{event:"*",schema:"public",table:"order_items"},()=>refreshData().catch(showError))
      .on("postgres_changes",{event:"*",schema:"public",table:"profiles"},()=>refreshData().catch(showError))
      .subscribe();
  }

  function showError(error){
    state.loading=false;
    state.error=error?.message||String(error);
    render();
  }

  async function initialize(){
    try{
      const {data,error}=await client.auth.getSession();
      if(error) throw error;
      state.session=data.session||null;
      if(state.session){
        state.profile=await getProfile(state.session.user.id);
        if(ownerAllowed()){
          await refreshData();
          startRealtime();
        }
      }
    }catch(error){state.error=error.message}
    state.loading=false;
    render();

    client.auth.onAuthStateChange(async(_event,session)=>{
      state.session=session||null;state.profile=null;state.orders=[];state.customers=[];
      if(state.session){
        try{
          state.profile=await getProfile(state.session.user.id);
          if(ownerAllowed()){await refreshData();startRealtime()}
        }catch(error){state.error=error.message}
      }
      render();
    });
  }

  window.ownerSignIn=async()=>{
    state.error="";state.message="";render();
    const email=document.getElementById("owner-email")?.value.trim();
    const password=document.getElementById("owner-password")?.value||"";
    if(!email||!password){state.error="Enter both your owner email and password.";render();return}
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error){state.error=error.message;render();return}
    try{
      const profile=await getProfile(data.user.id);
      if(!["owner","manager"].includes(profile.role)||profile.is_active===false){
        await client.auth.signOut();
        state.error="This account is valid but does not have owner or manager permission.";
        render();return;
      }
      state.message="Owner account verified.";
    }catch(error){showError(error)}
  };

  window.ownerResetPassword=async()=>{
    const email=document.getElementById("owner-email")?.value.trim();
    if(!email){state.error="Enter your owner email address first.";render();return}
    const {error}=await client.auth.resetPasswordForEmail(email, {
  redirectTo: "https://chef-maurice.vercel.app/reset-password.html"
});
    if(error){state.error=error.message}else{state.message="A password-reset email was requested. Check your inbox."}
    render();
  };

  window.ownerSignOut=async()=>{await client.auth.signOut();location.reload()};
  window.setAdminTab=tab=>{state.tab=tab;render()};
  window.refreshOwnerData=()=>refreshData().catch(showError);

  window.updateCloudOrder=async(id,status)=>{
    const changes={status};
    if(status==="Paid & Completed") changes.payment_status="paid";
    const {error}=await client.from("orders").update(changes).eq("id",id);
    if(error){showError(error);return}
    await refreshData();
  };

  window.viewCloudOrder=id=>{
    const order=state.orders.find(o=>String(o.id)===String(id));
    if(!order)return;
    document.body.insertAdjacentHTML("beforeend",`<div class="modal" onclick="if(event.target===this)this.remove()"><div class="modal-box">
      <div class="row between"><h2>Order #${esc(order.order_number)}</h2><button class="btn light" onclick="this.closest('.modal').remove()">Close</button></div>
      <p><b>Customer:</b> ${esc(order.customer_name)}</p>
      <p><b>Email:</b> ${esc(order.customer_email||"—")}</p>
      <p><b>Phone:</b> ${esc(order.customer_phone||"—")}</p>
      <p><b>Pickup:</b> ${esc(order.pickup_type)} ${order.pickup_time?dateTime(order.pickup_time):""}</p>
      <p><b>Status:</b> ${esc(order.status)}</p>
      <p><b>Payment:</b> ${esc(order.payment_status)}</p>
      <h3>Items</h3>
      ${(order.order_items||[]).map(i=>`<div class="card"><b>${esc(i.quantity)} × ${esc(i.item_name)}</b> — ${money(i.line_total||Number(i.unit_price||0)*Number(i.quantity||1))}
        ${(Array.isArray(i.details)&&i.details.length)?`<ul>${i.details.map(d=>`<li>${esc(d)}</li>`).join("")}</ul>`:""}
        ${i.special_instructions?`<p><b>Instructions:</b> ${esc(i.special_instructions)}</p>`:""}
      </div>`).join("")||"<p>No item details were recorded.</p>"}
      <h3>Total: ${money(order.total)}</h3>
    </div></div>`);
  };

  function loginView(){
    return `<div class="login-wrap"><div class="card">
      <div class="brand"><img src="assets/chef-maurice.png" alt=""><div>Chef Maurice Owner Portal<br><span class="badge">v13</span></div></div>
      <h1>Owner Sign In</h1>
      <p class="muted">Use the email and password for the Supabase account that has the owner or manager role.</p>
      ${state.error?`<div class="notice error">${esc(state.error)}</div>`:""}
      ${state.message?`<div class="notice success">${esc(state.message)}</div>`:""}
      <label>Email Address<input id="owner-email" type="email" autocomplete="username" value="frleflore@gmail.com"></label>
      <label>Password<input id="owner-password" type="password" autocomplete="current-password" onkeydown="if(event.key==='Enter')ownerSignIn()"></label>
     <div class="row">
  <button type="button" class="btn dark" onclick="ownerSignIn()">Sign In</button>
  <button type="button" class="btn light" onclick="ownerResetPassword()">Forgot Password?</button>
</div>
      <p class="muted">Customer ordering site: <a href="index.html">Return to Chef Maurice's Kitchen</a></p>
    </div></div>`;
  }

  function metrics(){
    const today=new Date().toDateString();
    const todayOrders=state.orders.filter(o=>new Date(o.created_at).toDateString()===today);
    const paid=state.orders.filter(o=>o.payment_status==="paid");
    return `<div class="grid">
      <div class="card metric"><p class="muted">New / Active Orders</p><h2>${state.orders.filter(o=>!["Paid & Completed","Cancelled"].includes(o.status)).length}</h2></div>
      <div class="card metric"><p class="muted">Orders Today</p><h2>${todayOrders.length}</h2></div>
      <div class="card metric"><p class="muted">Paid Sales</p><h2>${money(paid.reduce((s,o)=>s+Number(o.total||0),0))}</h2></div>
      <div class="card metric"><p class="muted">Customer Accounts</p><h2>${state.customers.filter(c=>c.role==="customer").length}</h2></div>
    </div>`;
  }

  function ordersView(){
    return `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Time</th><th>Customer</th><th>Pickup</th><th>Total</th><th>Status</th><th>Details</th></tr></thead><tbody>
      ${state.orders.map(o=>`<tr>
        <td>#${esc(o.order_number)}</td><td>${dateTime(o.created_at)}</td>
        <td><b>${esc(o.customer_name)}</b><br><span class="muted">${esc(o.customer_email||"")}</span><br><span class="muted">${esc(o.customer_phone||"")}</span></td>
        <td>${esc(o.pickup_type)}<br><span class="muted">${o.pickup_time?dateTime(o.pickup_time):""}</span></td>
        <td>${money(o.total)}</td>
        <td><select onchange="updateCloudOrder('${esc(o.id)}',this.value)">
          ${["Received","Preparing","Ready","Paid & Completed","Cancelled"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
        </select><br><span class="muted">${esc(o.payment_status)}</span></td>
        <td><button class="btn orange" onclick="viewCloudOrder('${esc(o.id)}')">View Order</button></td>
      </tr>`).join("")||'<tr><td colspan="7" class="empty">No cloud orders have been received yet.</td></tr>'}
    </tbody></table></div>`;
  }

  function customersView(){
    return `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Points</th><th>Role</th><th>Active</th></tr></thead><tbody>
      ${state.customers.map(c=>`<tr><td>${esc(c.full_name||"—")}</td><td>${esc(c.username||"—")}</td><td>${esc(c.email||"—")}</td><td>${esc(c.phone||"—")}</td><td>${esc(c.points||0)}</td><td>${esc(c.role)}</td><td>${c.is_active===false?"No":"Yes"}</td></tr>`).join("")||'<tr><td colspan="7" class="empty">No customer profiles found.</td></tr>'}
    </tbody></table></div>`;
  }

  function dashboardView(){
    return `<div class="admin-shell">
      <header class="topbar"><div class="brand"><img src="assets/chef-maurice.png" alt=""><div>Chef Maurice Owner Portal <span class="badge">v13</span></div></div>
        <div class="top-actions"><span>${esc(state.profile?.full_name||state.profile?.email||"Owner")}</span><button class="btn light" onclick="refreshOwnerData()">Refresh</button><button class="btn danger" onclick="ownerSignOut()">Sign Out</button></div>
      </header>
      <main>${state.error?`<div class="notice error">${esc(state.error)}</div>`:""}${state.message?`<div class="notice success">${esc(state.message)}</div>`:""}
        ${metrics()}
        <div class="tabs"><button class="btn ${state.tab==="orders"?"active":""}" onclick="setAdminTab('orders')">Orders</button><button class="btn ${state.tab==="customers"?"active":""}" onclick="setAdminTab('customers')">Customers & Rewards</button></div>
        ${state.loading?'<div class="loading">Loading live restaurant data…</div>':state.tab==="orders"?ordersView():customersView()}
      </main>
    </div>`;
  }

  function render(){
    root.innerHTML=!state.session||!ownerAllowed()?loginView():dashboardView();
  }

  initialize();
})();
