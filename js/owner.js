
window.CMOwner = {
  updateOrderStatus(state, orderId, status){
    const order=state.orders.find(o=>o.id===orderId);
    if(!order) return;
    order.status=status;
    if(status==="Paid & Completed") CMRewards.awardForCompletedOrder(state,order);
  },
  uploadPhoto(state, itemId, input, done){
    const file=input.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{state.photos[itemId]=e.target.result;done();};
    reader.readAsDataURL(file);
  }
};
