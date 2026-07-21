window.CMOrdering = {
  totals(state){
    const subtotal=state.cart.reduce((sum,item)=>sum+(item.price*item.qty),0);
    const tipPct=Number(state.tipPct||0);
    const tip=subtotal*tipPct/100;
    const tax=subtotal*0.07;
    return {subtotal,tipPct,tip,tax,total:subtotal+tip+tax};
  },
  nextOpenDates(){
    const dates=[];const today=new Date();
    for(let i=0;i<21 && dates.length<8;i++){
      const d=new Date(today);d.setDate(today.getDate()+i);
      if([0,4,5,6].includes(d.getDay())) dates.push(d);
    }
    return dates;
  },
  slotsFor(dateStr){
    if(!dateStr) return [];
    const d=new Date(dateStr+"T12:00:00");
    let start,end;
    if([4,5].includes(d.getDay())){start=17;end=19.5}
    else if([0,6].includes(d.getDay())){start=10;end=18.5}
    else return [];
    const slots=[];
    for(let t=start;t<=end;t+=0.5){
      const slot=new Date(d);slot.setHours(Math.floor(t),t%1?30:0,0,0);
      if(slot.getTime()>=Date.now()+30*60000) slots.push(slot.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}));
    }
    return slots;
  }
};
