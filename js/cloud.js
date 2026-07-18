
window.CMRewards = {
  pointsForSubtotal(subtotal){
    return Math.floor(Number(subtotal || 0) / 10) * 100;
  },
  signup(state, payload){
    if(!/^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(payload.password)){
      throw new Error("Password must be at least 6 characters and include at least 1 number and 1 special character.");
    }
    return data;
  }

  window.CMCloud = {
    client,
    currentSession: null,
    currentProfile: null,

    async initialize(){
      const { data } = await client.auth.getSession();
      this.currentSession = data.session || null;
      this.currentProfile = this.currentSession
        ? await profileFor(this.currentSession.user.id)
        : null;

      client.auth.onAuthStateChange(async (_event, session)=>{
        this.currentSession = session || null;
        this.currentProfile = session ? await profileFor(session.user.id) : null;
        window.dispatchEvent(new CustomEvent("cm-cloud-auth-change", {
          detail: { session: this.currentSession, profile: this.currentProfile }
        }));
      });

      return { session: this.currentSession, profile: this.currentProfile };
    },

    async signUp({email,password,username,fullName,phone}){
      return client.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            phone
          },
          emailRedirectTo: window.location.origin
        }
      });
    },

    async signIn({email,password}){
      const result = await client.auth.signInWithPassword({ email, password });
      if(!result.error){
        this.currentSession = result.data.session || null;
        this.currentProfile = this.currentSession
          ? await profileFor(this.currentSession.user.id)
          : null;
      }
      return result;
    },

    async signOut(){
      return client.auth.signOut();
    },

    async sendPasswordReset(email){
      return client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?reset=password`
      });
    },

    async updatePassword(password){
      return client.auth.updateUser({ password });
    },

    async refreshProfile(){
      this.currentProfile = this.currentSession
        ? await profileFor(this.currentSession.user.id)
        : null;
      return this.currentProfile;
    },

    isOwner(){
      return ["owner","manager"].includes(this.currentProfile?.role)
        && this.currentProfile?.is_active !== false;
    },

    async createOrder(order){
      const sessionUser = this.currentSession?.user || null;
      const pickupType = order.pickup?.startsWith("20") ? "Scheduled" : "ASAP";
      const pickupTime = pickupType === "Scheduled"
        ? new Date(order.pickup.replace(" at ", " ")).toISOString()
        : null;

      const { data: created, error } = await client
        .from("orders")
        .insert({
          customer_id: sessionUser?.id || null,
          customer_name: order.name,
          customer_email: sessionUser?.email || null,
          customer_phone: this.currentProfile?.phone || null,
          pickup_type: pickupType,
          pickup_time: pickupTime,
          status: "Received",
          payment_status: "unpaid",
          subtotal: order.subtotal,
          tax: Math.max(0, order.total - order.subtotal - order.tip),
          tip_percent: order.tipPct || 0,
          tip: order.tip || 0,
          total: order.total,
          customer_notes: ""
        })
        .select("id,order_number")
        .single();

      if(error) throw error;

      const rows = (order.items || []).map(item=>({
        order_id: created.id,
        item_type: item.book ? "book" : (item.details?.includes("Drink only") ? "drink" : "food"),
        item_name: item.name,
        quantity: item.qty || 1,
        unit_price: item.price || 0,
        line_total: (item.price || 0) * (item.qty || 1),
        details: item.details || []
      }));

      if(rows.length){
        const { error: itemsError } = await client.from("order_items").insert(rows);
        if(itemsError) throw itemsError;
      }
      return created;
    },

    async loadOwnerOrders(){
      if(!this.isOwner()) throw new Error("Owner access required.");
      const { data, error } = await client
        .from("orders")
        .select("*,order_items(*)")
        .order("created_at", { ascending:false })
        .limit(100);
      if(error) throw error;
      return data || [];
    },

    async updateOrderStatus(orderId,status){
      if(!this.isOwner()) throw new Error("Owner access required.");
      const paymentStatus = status === "Paid & Completed" ? "paid" : undefined;
      const changes = { status };
      if(paymentStatus) changes.payment_status = paymentStatus;
      const { error } = await client.from("orders").update(changes).eq("id",orderId);
      if(error) throw error;
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
