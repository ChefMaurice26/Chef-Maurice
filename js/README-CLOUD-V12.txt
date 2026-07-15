
(function(){
  const SUPABASE_URL = "https://qububoefefjicecefqzr.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4PRkvLz6DAKYv0GODqoNNQ_vKCpLtg-";

  if (!window.supabase?.createClient) {
    console.error("Supabase library failed to load.");
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  async function profileFor(userId){
    if(!userId) return null;
    const { data, error } = await client
      .from("profiles")
      .select("id,username,full_name,email,phone,points,role,is_active")
      .eq("id", userId)
      .single();
    if(error){
      console.warn("Profile load failed:", error.message);
      return null;
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
      return client.auth.signInWithPassword({ email, password });
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
  };
})();
