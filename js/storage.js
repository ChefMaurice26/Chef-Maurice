
window.CMStorage = {
  get(key, fallback){
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
