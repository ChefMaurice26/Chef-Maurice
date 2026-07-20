
(function(){
  const seed=window.CHEF_MAURICE_SEED;
  const state={
    view:"home", category:"All", ownerTab:"orders",
    menu:CMStorage.get("cm_prod_v7_menu",seed.menu),
    books:CMStorage.get("cm_prod_v7_books",seed.books),
    addons:CMStorage.get("cm_prod_v7_addons",{
      comboSides:[
        {id:"side-fries",name:"Fries",price:0,active:true,soldOut:false,limit:null},
        {id:"side-onion-rings",name:"Onion Rings",price:0,active:true,soldOut:false,limit:null},
        {id:"side-mac-cheese",name:"Mac & Cheese",price:0,active:true,soldOut:false,limit:null},
        {id:"side-hush-puppies",name:"Hush Puppies",price:0,active:true,soldOut:false,limit:null},
        {id:"side-fried-okra",name:"Fried Okra",price:0,active:true,soldOut:false,limit:null},
        {id:"side-corn",name:"Corn",price:0,active:true,soldOut:false,limit:null},
        {id:"side-chips",name:"Chips",price:0,active:true,soldOut:false,limit:null}
      ],
      drinks:[
        {id:"drink-tea",name:"Tea",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-coffee",name:"Coffee",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-water",name:"Bottled Water",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-coke",name:"Coca-Cola",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-diet-coke",name:"Diet Coke",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-sprite",name:"Sprite",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-fanta",name:"Fanta Orange",price:0,active:true,soldOut:false,limit:null},
        {id:"drink-rootbeer",name:"Root Beer",price:0,active:true,soldOut:false,limit:null}
      ],
      sandwichToppings:[
        {id:"top-lettuce",name:"Lettuce",price:0,active:true,soldOut:false,limit:null},
        {id:"top-tomato",name:"Tomato",price:0,active:true,soldOut:false,limit:null},
        {id:"top-cheese",name:"Cheese",price:0,active:true,soldOut:false,limit:null},
        {id:"top-onions",name:"Onions",price:0,active:true,soldOut:false,limit:null},
        {id:"top-pickles",name:"Pickles",price:0,active:true,soldOut:false,limit:null}
      ],
      breakfastBreads:[
        {id:"bf-pancakes",name:"Pancakes (2)",price:0,active:true,soldOut:false,limit:null},
        {id:"bf-waffles",name:"Waffles (2)",price:0,active:true,soldOut:false,limit:null},
        {id:"bf-grits-toast",name:"Grits with Toast",price:0,active:true,soldOut:false,limit:null}
      ],
      breakfastAddons:[
        {id:"bf-choc",name:"Chocolate Chips",price:1,active:true,soldOut:false,limit:null},
        {id:"bf-pecans",name:"Pecans",price:1,active:true,soldOut:false,limit:null},
        {id:"bf-apple",name:"Apple Topping",price:1,active:true,soldOut:false,limit:null},
        {id:"bf-strawberry",name:"Strawberry Topping",price:1,active:true,soldOut:false,limit:null},
        {id:"bf-hashbrown",name:"Patty Hashbrown",price:1,active:true,soldOut:false,limit:null}
      ],
      breakfastMeats:[
        {id:"bf-bacon",name:"Bacon (2)",price:0,active:true,soldOut:false,limit:null},
        {id:"bf-sausage",name:"Patty Sausage (2)",price:0,active:true,soldOut:false,limit:null},
        {id:"bf-ham",name:"Ham (2)",price:0,active:true,soldOut:false,limit:null}
      ],
      breakfastEggs:[
        {id:"bf-scrambled",name:"Scrambled",price:0,active:true,soldOut:false,limit:null},
        {id:"bf-boiled",name:"Boiled",price:0,active:true,soldOut:false,limit:null}
      ],
      breakfastDrinks:[
        {id:"bfd-apple",name:"Apple Juice",price:0,active:true,soldOut:false,limit:null},
        {id:"bfd-orange",name:"Orange Juice",price:0,active:true,soldOut:false,limit:null},
        {id:"bfd-tea",name:"Tea",price:0,active:true,soldOut:false,limit:null},
        {id:"bfd-coke",name:"Coca Cola",price:0,active:true,soldOut:false,limit:null},
        {id:"bfd-sprite",name:"Sprite",price:0,active:true,soldOut:false,limit:null},
        {id:"bfd-rootbeer",name:"Rootbeer",price:0,active:true,soldOut:false,limit:null},
        {id:"bfd-fanta",name:"Orange Fanta",price:0,active:true,soldOut:false,limit:null}
      ]
    }),
    cart:CMStorage.get("cm_prod_v7_cart",[]),
    orders:CMStorage.get("cm_prod_v7_orders",[]),
    customers:CMStorage.get("cm_prod_v7_customers",[]),
    photos:CMStorage.get("cm_prod_v7_photos",{}),
    currentCustomer:CMStorage.get("cm_prod_v7_current",null),
    paused:CMStorage.get("cm_prod_v7_paused",false),
    tipPct:CMStorage.get("cm_prod_v7_tip",0),
    lastOrder:null,
    cloudReady:false,
    cloudProfile:null,
    cloudSession:null
  };
  // Version 9 migration: preserve all prior data while adding owner-managed additional drinks.
  if(!state.addons.additionalDrinks){
    state.addons.additionalDrinks=(state.addons.drinks||[]).map(d=>({
      id:"extra-"+d.id,
      name:d.name,
      price:2,
      active:d.active!==false,
      soldOut:!!d.soldOut,
      limit:d.limit??null
    }));
    state.addons.additionalDrinks.push(
      {id:"extra-apple-juice",name:"Apple Juice",price:2,active:true,soldOut:false,limit:null},
      {id:"extra-orange-juice",name:"Orange Juice",price:2,active:true,soldOut:false,limit:null}
    );
  }
  // Version 8 migration: preserve all Version 7 data while adding owner-managed egg add-ons.
  if(!state.addons.eggAddons){
    state.addons.eggAddons=[
      {id:"egg-cheese",name:"Cheese",price:1,active:true,soldOut:false,limit:null},
      {id:"egg-onions",name:"Onions",price:0.5,active:true,soldOut:false,limit:null},
      {id:"egg-bell-peppers",name:"Bell Peppers",price:0.5,active:true,soldOut:false,limit:null},
      {id:"egg-jalapenos",name:"Jalapeños",price:0.5,active:true,soldOut:false,limit:null},
      {id:"egg-mushrooms",name:"Mushrooms",price:1,active:true,soldOut:false,limit:null},
      {id:"egg-extra",name:"Extra Egg",price:1.5,active:true,soldOut:false,limit:null},
      {id:"egg-bacon-crumbles",name:"Bacon Crumbles",price:2,active:true,soldOut:false,limit:null}
    ];
  }
  // Version 6.1 migration: guarantee the standard Breakfast Plate uses the full breakfast configurator.
  state.menu.forEach(item=>{
    if(item.id==="breakfast" || item.name==="Breakfast Plate"){
      item.category="Breakfast";
      item.breakfast=true;
      item.comboPrice=null;
      item.description="Weekend breakfast plate with bread or grits, meat, eggs, and drink";
    }
  });
  const icons={"Wings & Chicken":"🍗","Burgers":"🍔","Seafood":"🐟","Specialty Sandwiches":"🥪","Breakfast":"🥞","Snacks":"🌭","Sides":"🍟","Drinks":"🥤","Desserts":"🍰"};
  const money=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(n||0);
  const availableAddons=group=>(state.addons[group]||[]).filter(x=>x.active!==false);
  const addonStatusLabel=item=>item.soldOut?"Sold Out":item.limit!==null&&item.limit!==""?`Limited: ${item.limit}`:"Available";
  const optionHTML=(group,includePrice=false)=>availableAddons(group).map(x=>`<option value="${x.id}" ${x.soldOut?"disabled":""}>${x.name}${includePrice&&x.price?` (+${money(x.price)})`:""}${x.soldOut?" — Sold Out":x.limit!==null&&x.limit!==""?` — ${x.limit} left`:""}</option>`).join("");
  const selectedAddon=(group,id)=>(state.addons[group]||[]).find(x=>x.id===id);

  function save(){
    CMStorage.set("cm_prod_v7_menu",state.menu);CMStorage.set("cm_prod_v7_books",state.books);CMStorage.set("cm_prod_v7_addons",state.addons);CMStorage.set("cm_prod_v7_cart",state.cart);
    CMStorage.set("cm_prod_v7_orders",state.orders);CMStorage.set("cm_prod_v7_customers",state.customers);CMStorage.set("cm_prod_v7_photos",state.photos);
    CMStorage.set("cm_prod_v7_current",state.currentCustomer);CMStorage.set("cm_prod_v7_paused",state.paused);CMStorage.set("cm_prod_v7_tip",state.tipPct);
  }
  function go(view){state.view=view;render();window.scrollTo(0,0)}
  window.go=go;
  function topbar(){
    const count=state.cart.reduce((s,i)=>s+i.qty,0);
    return `<div class="topbar"><div class="nav-left"><button class="${state.view==="home"?"active":""}" onclick="go('home')">🏠 Home</button><button class="${state.view==="menu"?"active":""}" onclick="go('menu')">🍔 Menu</button></div><div class="brand"><img src="assets/chef-maurice.png">Chef Maurice's Kitchen <span style="font-size:.72rem;background:#f47b20;padding:4px 7px;border-radius:999px">Cloud v12</span></div><div class="nav-right"><button class="${state.view==="cart"?"active":""}" onclick="go('cart')">🛒 Cart (${count})</button><button class="${state.view==="rewards"?"active":""}" onclick="go('rewards')">⭐ Rewards</button><button class="${state.view==="account"?"active":""}" onclick="go('account')">👤 Account</button></div></div>`;
  }
  function shell(content){return `<div class="app-shell">${topbar()}<main>${content}</main></div>`}
  function photo(item){return state.photos[item.id]?`<img src="${state.photos[item.id]}" alt="${item.name}">`:(icons[item.category]||"🍽️")}
  function itemCard(item,index){return `<article class="card ${item.soldOut?"sold":""}"><div class="photo">${photo(item)}</div><small class="muted">${item.category}</small><h3>${item.name}</h3><p class="muted">${item.description||""}</p><div class="row between"><span class="price">${money(item.price)}</span><button class="btn orange" ${item.soldOut||state.paused?"disabled":""} onclick="openItem(${index})">${item.soldOut?"Sold Out":"Add"}</button></div></article>`}
  function home(){
    const points=state.currentCustomer?.points||0;
    return shell(`<section class="hero"><div><h1>Welcome to<br>Chef Maurice's Kitchen</h1><p>Fresh food. Friendly service. Every meal made to order.</p><button class="btn orange" ${state.paused?"disabled":""} onclick="go('menu')">${state.paused?"ONLINE ORDERING PAUSED":"START YOUR ORDER"}</button> <button class="btn light" onclick="go('books')">SHOP BOOKS</button></div><img src="assets/chef-maurice.png"></section><div class="quick"><div class="card" onclick="go('menu')"><b>🍔 Order Food</b></div><div class="card" onclick="go('rewards')"><b>⭐ ${points} Points</b><p class="muted">${state.currentCustomer?"Signed-in rewards balance":"Sign up or log in to earn points"}</p></div><div class="card" onclick="go('books')"><b>📚 Add a Book</b></div></div><div class="notice"><b>Rewards:</b> Earn 100 points for every $10 paid. Points are added after an order is marked Paid & Completed.</div><h2>Featured Favorites</h2><div class="grid">${state.menu.filter(i=>i.active!==false).slice(0,4).map(i=>itemCard(i,state.menu.indexOf(i))).join("")}</div>`);
  }
  function menuView(){
    const active=state.menu.filter(i=>i.active!==false && i.id!=="drink");
    const categories=["All",...new Set(active.map(i=>i.category))];
    if(!categories.includes("Drinks")) categories.splice(Math.max(categories.length-1,1),0,"Drinks");
    const chips=`<div class="chips">${categories.map(c=>`<button class="chip ${state.category===c?"active":""}" onclick='setCategory(${JSON.stringify(c)})'>${c}</button>`).join("")}</div>`;

    if(state.category==="Drinks"){
      const drinks=availableAddons("additionalDrinks");
      return shell(`<h1>Menu</h1>${chips}
        <div class="notice"><b>Drinks may be ordered by themselves.</b> Select Add beside any drink to send it directly to your cart.</div>
        <br>
        <div class="grid">${drinks.map(d=>`
          <article class="card ${d.soldOut?"sold":""}">
            <div class="photo">🥤</div>
            <small class="muted">Drinks</small>
            <h3>${d.name}</h3>
            ${d.limit!==null&&d.limit!==""?`<p class="muted">${d.limit} available</p>`:""}
            <div class="row between">
              <span class="price">${money(d.price||0)}</span>
              <button class="btn orange" ${d.soldOut?"disabled":""} onclick="addDrinkOnly('${d.id}')">${d.soldOut?"Sold Out":"Add"}</button>
            </div>
          </article>`).join("")||'<div class="card">No drinks are currently available.</div>'}</div>`);
    }

    const items=active.map(i=>[i,state.menu.indexOf(i)]).filter(([i])=>state.category==="All"||i.category===state.category);
    return shell(`<h1>Menu</h1>${chips}<div class="grid">${items.map(([i,n])=>itemCard(i,n)).join("")}</div>`);
  }
  window.setCategory=c=>{state.category=c;render()};
  window.addDrinkOnly=id=>{
    const drink=selectedAddon("additionalDrinks",id);
    if(!drink || drink.soldOut) return;
    state.cart.push({
      key:Date.now()+Math.random(),
      name:drink.name,
      price:Number(drink.price||0),
      qty:1,
      details:["Drink only"]
    });
    save();
    go("cart");
  };

  window.openItem=index=>{
    const item=state.menu[index];
    const flavors=item.flavors?`<label>Flavor<select id="flavor">${item.flavors.map(f=>`<option>${f}</option>`).join("")}</select></label>`:"";
    const combo=item.category!=="Sides"&&item.category!=="Drinks"&&item.category!=="Desserts"&&item.category!=="Snacks"&&item.category!=="Breakfast"?`<label><input id="combo" type="checkbox" style="width:auto" onchange="toggleCombo()"> Make it a combo for $2 more</label><div id="comboBox" style="display:none"><label>Choose a side<select id="side">${optionHTML("comboSides")}</select></label><label>Choose a drink<select id="drink">${optionHTML("drinks")}</select></label>
<h3>Additional Drinks</h3>
<div class="checks">${availableAddons("additionalDrinks").map(d=>`<label class="check ${d.soldOut?"sold":""}"><input type="checkbox" class="additional-drink" value="${d.id}" ${d.soldOut?"disabled":""}> ${d.name} (+${money(d.price||0)})${d.soldOut?" — Sold Out":d.limit!==null&&d.limit!==""?` — ${d.limit} left`:""}</label>`).join("")}</div>
<h3>Add up to 2 Extra Sides — $2 each</h3><div class="checks">${availableAddons("comboSides").map(s=>`<label class="check ${s.soldOut?"sold":""}"><input type="checkbox" class="extra-side" value="${s.id}" ${s.soldOut?"disabled":""} onchange="limitExtraSides(this)"> ${s.name} (+$2)${s.soldOut?" — Sold Out":s.limit!==null&&s.limit!==""?` — ${s.limit} left`:""}</label>`).join("")}</div><p class="muted" id="extraSideCount">0 of 2 extra sides selected</p></div>`:"";
    const deluxe=item.deluxe?`<label class="check"><input id="deluxe" type="checkbox" onchange="toggleDeluxe()"> Make It Deluxe for $2 more</label>`:"";
    const toppings=item.sandwich?`<h3>Choose toppings</h3><div class="checks">${availableAddons("sandwichToppings").map(t=>`<label class="check ${t.soldOut?"sold":""}"><input type="checkbox" class="topping" value="${t.id}" data-name="${t.name}" ${t.soldOut?"disabled":""}> ${t.name}${t.soldOut?" — Sold Out":t.limit!==null&&t.limit!==""?` — ${t.limit} left`:""}</label>`).join("")}</div>`:"";

    const breakfast=item.breakfast?`<h3>Breakfast Choices</h3>
      <label>Bread or Grits<select id="breakfastBread" onchange="toggleBreakfastAddons()">${optionHTML("breakfastBreads")}</select></label>
      <div id="breakfastAddons"><h3>Pancake or Waffle Add-ons</h3><div class="checks">${availableAddons("breakfastAddons").filter(a=>a.id!=="bf-hashbrown").map(a=>`<label class="check ${a.soldOut?"sold":""}"><input type="checkbox" class="breakfast-addon" value="${a.id}" data-name="${a.name}" data-price="${a.price||0}" ${a.soldOut?"disabled":""}> ${a.name} (+${money(a.price||0)})${a.soldOut?" — Sold Out":a.limit!==null&&a.limit!==""?` — ${a.limit} left`:""}</label>`).join("")}</div></div>
      <label>Meat<select id="breakfastMeat">${optionHTML("breakfastMeats")}</select></label>
      <label>Eggs (2)<select id="breakfastEggs">${optionHTML("breakfastEggs")}</select></label>
      <label>Egg Add-ons<select id="eggAddonSelect" onchange="addEggAddonFromDropdown()"><option value="">Choose an add-on</option>${optionHTML("eggAddons",true)}</select></label>
      <div id="selectedEggAddons" class="card" style="box-shadow:none;border:1px solid #ddd"><b>Selected Egg Add-ons</b><p class="muted" id="eggAddonEmpty">No egg add-ons selected.</p></div>
      ${(()=>{const h=selectedAddon("breakfastAddons","bf-hashbrown");return h&&h.active!==false?`<label class="check ${h.soldOut?"sold":""}"><input id="hashbrown" type="checkbox" ${h.soldOut?"disabled":""}> Add ${h.name} (+${money(h.price||0)})${h.soldOut?" — Sold Out":h.limit!==null&&h.limit!==""?` — ${h.limit} left`:""}</label>`:""})()}
      <label>Drink<select id="breakfastDrink">${optionHTML("breakfastDrinks")}</select></label>`:"";
    document.body.insertAdjacentHTML("beforeend",`<div class="modal" onclick="if(event.target===this)this.remove()"><div class="modal-box"><div class="row between"><h2>${item.name}</h2><button class="btn" onclick="this.closest('.modal').remove()">✕</button></div>${flavors}${combo}${deluxe}${toppings}${breakfast}<label>Quantity<input id="qty" type="number" min="1" value="1"></label><label>Special instructions<textarea id="notes"></textarea></label><button class="btn orange" onclick="addItem(${index})">Add to Cart</button></div></div>`);
  };
  window.toggleCombo=()=>{document.getElementById("comboBox").style.display=document.getElementById("combo").checked?"block":"none"};
  window.limitExtraSides=(changed)=>{
    const selected=[...document.querySelectorAll(".extra-side:checked")];
    if(selected.length>2){
      changed.checked=false;
      alert("You may add up to 2 additional sides.");
    }
    const count=document.querySelectorAll(".extra-side:checked").length;
    const label=document.getElementById("extraSideCount");
    if(label) label.textContent=`${count} of 2 extra sides selected`;
  };

  window.addEggAddonFromDropdown=()=>{
    const select=document.getElementById("eggAddonSelect");
    const id=select?.value;
    if(!id) return;
    const item=selectedAddon("eggAddons",id);
    if(!item || item.soldOut) return;
    if(document.querySelector(`.selected-egg-addon[data-id="${id}"]`)){
      alert("That egg add-on is already selected.");
      select.value="";
      return;
    }
    const empty=document.getElementById("eggAddonEmpty");
    if(empty) empty.style.display="none";
    document.getElementById("selectedEggAddons").insertAdjacentHTML("beforeend",
      `<div class="row between selected-egg-addon" data-id="${item.id}" data-name="${item.name}" data-price="${item.price||0}"><span>${item.name} (+${money(item.price||0)})</span><button type="button" class="btn danger" onclick="removeEggAddon('${item.id}')">Remove</button></div>`);
    select.value="";
  };
  window.removeEggAddon=id=>{
    document.querySelector(`.selected-egg-addon[data-id="${id}"]`)?.remove();
    if(!document.querySelector(".selected-egg-addon")){
      const empty=document.getElementById("eggAddonEmpty");
      if(empty) empty.style.display="block";
    }
  };
  window.toggleBreakfastAddons=()=>{
    const choice=document.getElementById("breakfastBread")?.value||"";
    const box=document.getElementById("breakfastAddons");
    const show=choice.startsWith("Pancakes")||choice.startsWith("Waffles");
    if(box) box.style.display=show?"block":"none";
    if(!show) document.querySelectorAll(".breakfast-addon").forEach(x=>x.checked=false);
  };

  window.toggleDeluxe=()=>{
    const checked=document.getElementById("deluxe")?.checked;
    const deluxeToppings=["Lettuce","Tomato","Pickles","Onions"];
    document.querySelectorAll(".topping").forEach(box=>{
      if(deluxeToppings.includes(box.dataset.name)) box.checked=checked;
    });
  };
  window.addItem=index=>{
    const item=state.menu[index],combo=document.getElementById("combo")?.checked,deluxe=document.getElementById("deluxe")?.checked;
    let price=combo?(item.price+2):item.price;const details=[];
    if(deluxe){price+=2;details.push("Make It Deluxe")}
    if(combo){
      const side=selectedAddon("comboSides",document.getElementById("side").value);
      const drink=selectedAddon("drinks",document.getElementById("drink").value);
      details.push(`Combo: ${side?.name||""}, ${drink?.name||""}`);
      const additionalDrinkItems=[...document.querySelectorAll(".additional-drink:checked")].map(x=>selectedAddon("additionalDrinks",x.value)).filter(Boolean);
      if(additionalDrinkItems.length){
        price += additionalDrinkItems.reduce((sum,x)=>sum+Number(x.price||0),0);
        details.push(`Additional Drinks: ${additionalDrinkItems.map(x=>x.name).join(", ")}`);
      }
      const extraSideItems=[...document.querySelectorAll(".extra-side:checked")].map(x=>selectedAddon("comboSides",x.value)).filter(Boolean);
      if(extraSideItems.length){
        price += extraSideItems.length*2;
        details.push(`Extra Sides: ${extraSideItems.map(x=>x.name).join(", ")}`);
      }
    }
    if(document.getElementById("flavor")) details.push(`Flavor: ${document.getElementById("flavor").value}`);
    document.querySelectorAll(".topping:checked").forEach(x=>details.push(x.dataset.name));
    if(item.breakfast){
      const bread=selectedAddon("breakfastBreads",document.getElementById("breakfastBread").value);
      details.push(`Bread: ${bread?.name||""}`);
      const breakfastAddonItems=[...document.querySelectorAll(".breakfast-addon:checked")].map(x=>selectedAddon("breakfastAddons",x.value)).filter(Boolean);
      if(breakfastAddonItems.length){price+=breakfastAddonItems.reduce((s,x)=>s+Number(x.price||0),0);details.push(`Breakfast Add-ons: ${breakfastAddonItems.map(x=>x.name).join(", ")}`)}
      const meat=selectedAddon("breakfastMeats",document.getElementById("breakfastMeat").value);
      const eggs=selectedAddon("breakfastEggs",document.getElementById("breakfastEggs").value);
      details.push(`Meat: ${meat?.name||""}`);
      details.push(`Eggs: ${eggs?.name||""}`);
      const eggAddonItems=[...document.querySelectorAll(".selected-egg-addon")].map(el=>({name:el.dataset.name,price:Number(el.dataset.price||0)}));
      if(eggAddonItems.length){
        price+=eggAddonItems.reduce((sum,x)=>sum+x.price,0);
        details.push(`Egg Add-ons: ${eggAddonItems.map(x=>x.name).join(", ")}`);
      }
      if(document.getElementById("hashbrown")?.checked){const h=selectedAddon("breakfastAddons","bf-hashbrown");price+=Number(h?.price||0);details.push(h?.name||"Patty Hashbrown")}
      const breakfastDrink=selectedAddon("breakfastDrinks",document.getElementById("breakfastDrink").value);
      details.push(`Breakfast Drink: ${breakfastDrink?.name||""}`);
    }
    if(document.getElementById("notes").value) details.push(document.getElementById("notes").value);
    state.cart.push({key:Date.now()+Math.random(),name:item.name,price,qty:Number(document.getElementById("qty").value),details});
    save();document.querySelector(".modal").remove();go("cart");
  };
  function booksView(){return shell(`<h1>Books by Frederick LeFlore</h1><div class="grid">${state.books.filter(b=>b.active!==false).map(b=>`<article class="card"><div class="photo">${state.photos["book:"+b.id]?`<img src="${state.photos["book:"+b.id]}" alt="${b.name}">`:"📖"}</div><h3>${b.name}</h3><div class="row between"><span class="price">${money(b.price)}</span><button class="btn orange" ${b.soldOut?"disabled":""} onclick="addBook('${b.id}')">${b.soldOut?"Sold Out":"Add"}</button></div></article>`).join("")}</div>`)}
  window.addBook=id=>{const b=state.books.find(x=>x.id===id);state.cart.push({key:Date.now()+Math.random(),name:b.name,price:b.price,qty:1,details:["Book pickup"],book:true,promo:b.promo});save();go("cart")};
  function cartView(){
    const t=CMOrdering.totals(state);
    return shell(`<h1>Your Cart</h1>${state.cart.length?state.cart.map(c=>`<div class="cart-row"><div><b>${c.qty} × ${c.name}</b><div class="muted">${c.details.join(" • ")}</div></div><div><b>${money(c.price*c.qty)}</b><br><button class="btn" onclick="removeItem('${c.key}')">Remove</button></div></div>`).join("")+`<div class="card"><h3>Add a Tip</h3><div class="row">${[0,5,10,15,20].map(p=>`<button class="btn ${state.tipPct===p?"orange":"light"}" onclick="setTip(${p})">${p===0?"No Tip":p+"%"}</button>`).join("")}</div></div><br><div class="summary"><div><span>Subtotal</span><b>${money(t.subtotal)}</b></div><div><span>Tax</span><b>${money(t.tax)}</b></div><div><span>Tip (${t.tipPct}%)</span><b>${money(t.tip)}</b></div><div class="total"><span>Total</span><b>${money(t.total)}</b></div></div><br><button class="btn orange" onclick="go('checkout')">Continue to Checkout</button>`:`<div class="card">Your cart is empty.</div>`}`);
  }
  window.removeItem=key=>{state.cart=state.cart.filter(x=>String(x.key)!==String(key));save();render()};
  window.setTip=p=>{state.tipPct=p;save();render()};
  function checkoutView(){
    const totals=CMOrdering.totals(state),dates=CMOrdering.nextOpenDates();
    return shell(`<h1>Checkout</h1><div class="grid"><div class="card"><label>Name<input id="checkoutName" value="${state.currentCustomer?.name||"Test Customer"}"></label><label>Pickup timing<select id="pickupMode" onchange="updateSchedule()"><option>ASAP</option><option>Scheduled</option></select></label><div id="scheduleBox" style="display:none"><label>Pickup date<select id="pickupDate" onchange="updateSchedule()">${dates.map(d=>`<option value="${d.toISOString().slice(0,10)}">${d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</option>`).join("")}</select></label><label>Pickup time<select id="pickupTime"></select></label></div></div><div class="card"><div class="notice">Square test mode only. No real charge.</div><h3>Total: ${money(totals.total)}</h3><p class="muted">Rewards points are added only after the owner marks the order Paid & Completed.</p><button class="btn orange" onclick="placeOrder()">Place Test Order</button></div></div>`);
  }
  window.updateSchedule=()=>{
    const scheduled=document.getElementById("pickupMode").value==="Scheduled";
    document.getElementById("scheduleBox").style.display=scheduled?"block":"none";
    if(scheduled){
      const slots=CMOrdering.slotsFor(document.getElementById("pickupDate").value);
      document.getElementById("pickupTime").innerHTML=slots.length?slots.map(s=>`<option>${s}</option>`).join(""):`<option>No available times</option>`;
    }
  };
  window.placeOrder=async()=>{
    const totals=CMOrdering.totals(state);let pickup=document.getElementById("pickupMode").value;
    if(pickup==="Scheduled") pickup=`${document.getElementById("pickupDate").value} at ${document.getElementById("pickupTime").value}`;
    const order={id:1000+state.orders.length+1,name:document.getElementById("checkoutName").value,total:totals.total,subtotal:totals.subtotal,tip:totals.tip,tipPct:totals.tipPct,status:"Received",pickup,items:[...state.cart],customerPhone:state.cloudProfile?.phone||"",pointsAwarded:0};
    try{
      const cloudOrder=await CMCloud.createOrder(order);
      order.cloudId=cloudOrder.id;
      order.id=cloudOrder.order_number;
    }catch(error){
      alert("The cloud order could not be saved: "+error.message);
      return;
    }
    state.orders.unshift(order);state.cart=[];state.tipPct=0;state.lastOrder=order;save();go("confirmation");
  };
  function confirmationView(){const o=state.lastOrder||state.orders[0];return shell(`<div class="success"><h1>✅ Order Received</h1><p>Order #${o.id}</p><p>Pickup: ${o.pickup}</p><p>Rewards points will be added after payment is completed.</p></div>`)}
  function rewardsView(){
    const profile=state.cloudProfile;
    if(!profile) return shell(`<h1>Chef Maurice Rewards</h1>
      <div class="notice"><b>Earn 100 points for every $10 paid.</b></div>
      <div class="grid">
        <div class="card">
          <h2>Create Account</h2>
          <label>Username<input id="cloudSignupUsername"></label>
          <label>Name<input id="cloudSignupName"></label>
          <label>Email Address<input id="cloudSignupEmail" type="email"></label>
          <label>Phone Number<input id="cloudSignupPhone"></label>
          <label>Password<input id="cloudSignupPassword" type="password"></label>
          <p class="muted">Use at least 6 characters, including a number and special character.</p>
          <button class="btn green" onclick="cloudSignup()">Create Account</button>
        </div>
        <div class="card">
          <h2>Log In</h2>
          <label>Email Address<input id="cloudLoginEmail" type="email"></label>
          <label>Password<input id="cloudLoginPassword" type="password"></label>
          <button class="btn dark" onclick="cloudLogin()">Log In</button>
          <br><br>
          <button class="btn light" onclick="cloudForgotPassword()">Forgot Password?</button>
        </div>
      </div>`);
    return shell(`<section class="hero"><div>
      <h2>Welcome, ${profile.full_name||profile.username}</h2>
      <h1>${profile.points||0} Points</h1>
      <p>Signed in as ${profile.email}</p>
      <button class="btn light" onclick="cloudLogout()">Log Out</button>
    </div><div style="font-size:8rem">⭐</div></section>`);
  }

  window.cloudSignup=async()=>{
    const password=cloudSignupPassword.value;
    if(!/^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password)){
      alert("Password must be at least 6 characters and include at least 1 number and 1 special character.");
      return;
    }
    const { error }=await CMCloud.signUp({
      email:cloudSignupEmail.value.trim(),
      password,
      username:cloudSignupUsername.value.trim(),
      fullName:cloudSignupName.value.trim(),
      phone:cloudSignupPhone.value.trim()
    });
    if(error) alert(error.message);
    else alert("Account created. Check your email if confirmation is required, then log in.");
  };

  window.cloudLogin=async()=>{
    const { error }=await CMCloud.signIn({
      email:cloudLoginEmail.value.trim(),
      password:cloudLoginPassword.value
    });
    if(error) alert(error.message);
  };

  window.cloudOwnerLogin=async()=>{
    const { error }=await CMCloud.signIn({
      email:ownerLoginEmail.value.trim(),
      password:ownerLoginPassword.value
    });
    if(error){
      alert(error.message);
      return;
    }

    state.cloudSession=CMCloud.currentSession;
    state.cloudProfile=CMCloud.currentProfile;

    if(!CMCloud.isOwner()){
      alert("This account does not have owner access.");
      render();
      return;
    }

    await openSecureOwnerDashboard();
  };

  window.cloudLogout=async()=>{ await CMCloud.signOut(); go("home"); };

  window.cloudForgotPassword=async()=>{
    const email=prompt("Enter your account email address:");
    if(!email) return;
    const { error }=await CMCloud.sendPasswordReset(email.trim());
    if(error) alert(error.message);
    else alert("Password reset email requested. Check your inbox.");
  };

  window.legacySignupCustomer=()=>{try{CMRewards.signup(state,{username:signupUsername.value.trim(),name:signupName.value.trim(),email:signupEmail.value.trim(),phone:signupPhone.value.trim(),password:signupPassword.value,secretQuestion:signupSecretQuestion.value,secretAnswer:signupSecretAnswer.value.trim()});save();render()}catch(e){alert(e.message)}};
  window.legacyLoginCustomer=()=>{try{CMRewards.login(state,loginUsername.value.trim(),loginPassword.value);save();render()}catch(e){alert(e.message)}};
  window.legacyLogoutCustomer=()=>{state.currentCustomer=null;save();render()};

  window.openForgotUsername=()=>{
    document.body.insertAdjacentHTML("beforeend",`<div class="modal"><div class="modal-box"><div class="row between"><h2>Recover Username</h2><button class="btn" onclick="this.closest('.modal').remove()">✕</button></div><label>Email Address<input id="recoverUsernameEmail" type="email"></label><button class="btn orange" onclick="showUsernameQuestion()">Continue</button><div id="usernameQuestionArea"></div></div></div>`);
  };
  window.showUsernameQuestion=()=>{
    const customer=CMRewards.findByEmail(state,recoverUsernameEmail.value.trim());
    if(!customer){alert("No rewards account was found for that email address.");return}
    document.getElementById("usernameQuestionArea").innerHTML=`<div class="notice"><b>Secret Question:</b> ${customer.secretQuestion||"No secret question on file."}</div><label>Secret Answer<input id="recoverUsernameAnswer"></label><button class="btn green" onclick="revealUsername('${customer.id}')">Show Username</button>`;
  };
  window.revealUsername=id=>{
    const customer=state.customers.find(c=>String(c.id)===String(id));
    if(!customer)return;
    if(String(recoverUsernameAnswer.value.trim()).toLowerCase()!==String(customer.secretAnswer||"").toLowerCase()){
      alert("The secret answer is incorrect.");return;
    }
    document.getElementById("usernameQuestionArea").innerHTML=`<div class="success"><b>Your username is:</b> ${customer.username}</div>`;
  };
  window.openForgotPassword=()=>{
    document.body.insertAdjacentHTML("beforeend",`<div class="modal"><div class="modal-box"><div class="row between"><h2>Reset Password</h2><button class="btn" onclick="this.closest('.modal').remove()">✕</button></div><label>Username<input id="recoverPasswordUsername"></label><label>Email Address<input id="recoverPasswordEmail" type="email"></label><button class="btn orange" onclick="showPasswordQuestion()">Send Reset Email</button><div id="passwordQuestionArea"></div></div></div>`);
  };
  window.showPasswordQuestion=()=>{
    const customer=CMRewards.findByUsername(state,recoverPasswordUsername.value.trim());
    if(!customer || String(customer.email||"").toLowerCase()!==String(recoverPasswordEmail.value.trim()).toLowerCase()){
      alert("The username and email address do not match our records.");return;
    }
    document.getElementById("passwordQuestionArea").innerHTML=`<div class="notice"><b>Prototype email sent:</b> In the live app, a secure reset link will be emailed to ${customer.email}. For this local prototype, continue below on this device.</div><label>Secret Question<input value="${customer.secretQuestion||""}" disabled></label><label>Secret Answer<input id="recoverPasswordAnswer"></label><label>New Password<input id="recoverNewPassword" type="password"></label><p class="muted">Minimum 6 characters, including at least 1 number and 1 special character.</p><button class="btn green" onclick="completePasswordReset('${customer.id}')">Reset Password</button>`;
  };
  window.completePasswordReset=id=>{
    const customer=state.customers.find(c=>String(c.id)===String(id));
    if(!customer)return;
    if(String(recoverPasswordAnswer.value.trim()).toLowerCase()!==String(customer.secretAnswer||"").toLowerCase()){
      alert("The secret answer is incorrect.");return;
    }
    if(!CMRewards.validateNewPassword(recoverNewPassword.value)){
      alert("Password must be at least 6 characters and include at least 1 number and 1 special character.");return;
    }
    customer.password=recoverNewPassword.value;
    save();
    document.getElementById("passwordQuestionArea").innerHTML=`<div class="success"><b>Password updated.</b> You may now close this window and log in.</div>`;
  };

  function accountView(){
    const profile=state.cloudProfile;
    return shell(`<h1>My Account</h1><div class="grid">
      <div class="card">
        <h3>Customer Account</h3>
        ${profile
          ? `<p><b>${profile.username||profile.full_name}</b></p><p>${profile.email}</p><p>${profile.points||0} points</p><button class="btn light" onclick="cloudLogout()">Log Out</button>`
          : `<p>Not signed in.</p><button class="btn orange" onclick="go('rewards')">Sign Up or Log In</button>`}
      </div>
      ${CMCloud.isOwner()
        ? `<div class="card"><h3>Administration</h3><p>Secure owner account verified.</p><button class="btn dark" onclick="openSecureOwnerDashboard()">Open Dashboard</button></div>`
        : `<div class="card">
            <h3>Owner Login</h3>
            <p class="muted">Use an owner or manager account to open the dashboard.</p>
            <label>Email Address<input id="ownerLoginEmail" type="email"></label>
            <label>Password<input id="ownerLoginPassword" type="password"></label>
            <button class="btn dark" onclick="cloudOwnerLogin()">Log In as Owner</button>
          </div>`}
    </div>`);
  }
  window.openSecureOwnerDashboard=async()=>{
    if(!CMCloud.isOwner()){ alert("Owner access required."); return; }
    try{
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    }catch(err){
      localStorage.removeItem(key);
      return fallback;
    }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); },
  clearApp(){
    Object.keys(localStorage).filter(k=>k.startsWith("cm_prod_")).forEach(k=>localStorage.removeItem(k));
  }
};
