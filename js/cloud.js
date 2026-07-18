
window.CMRewards = {
  pointsForSubtotal(subtotal){
    return Math.floor(Number(subtotal || 0) / 10) * 100;
  },
  signup(state, payload){
    if(!/^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(payload.password)){
      throw new Error("Password must be at least 6 characters and include at least 1 number and 1 special character.");
    }
    if(!payload.secretQuestion || !payload.secretAnswer){
      throw new Error("Please choose a secret question and provide an answer.");
    }
    if(state.customers.some(c=>c.phone===payload.phone)) throw new Error("An account already exists for that phone number.");
    if(state.customers.some(c=>String(c.username||"").toLowerCase()===String(payload.username||"").toLowerCase())) throw new Error("That username is already in use.");
    const customer={id:Date.now(),username:payload.username,name:payload.name,email:payload.email,phone:payload.phone,password:payload.password,secretQuestion:payload.secretQuestion,secretAnswer:payload.secretAnswer,points:0};
    state.customers.push(customer);
    state.currentCustomer={...customer};
  },
  login(state, username, password){
    const customer=state.customers.find(c=>String(c.username||"").toLowerCase()===String(username||"").toLowerCase() && c.password===password);
    if(!customer) throw new Error("Username or password is incorrect.");
    state.currentCustomer={...customer};
  },
  awardForCompletedOrder(state, order){
    if(order.pointsAwarded || !order.customerPhone) return 0;
    const customer=state.customers.find(c=>c.phone===order.customerPhone);
    if(!customer) return 0;
    const points=this.pointsForSubtotal(order.subtotal);
    customer.points += points;
    order.pointsAwarded = points;
    if(state.currentCustomer?.phone===customer.phone) state.currentCustomer={...customer};
    return points;
  },

  findByEmail(state,email){
    return state.customers.find(c=>String(c.email||"").toLowerCase()===String(email||"").toLowerCase());
  },
  findByUsername(state,username){
    return state.customers.find(c=>String(c.username||"").toLowerCase()===String(username||"").toLowerCase());
  },
  validateNewPassword(password){
    return /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password);
  },
  exportCSV(state){
    const rows=[["Username","Name","Email Address","Phone Number","Points Tally"],...state.customers.map(c=>[c.username||"",c.name,c.email||"",c.phone,c.points||0])];
    const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="Chef-Maurice-Rewards-Customers.csv";a.click();URL.revokeObjectURL(a.href);
  }
};
