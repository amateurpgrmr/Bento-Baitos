import React, { createContext, useState, useEffect } from 'react';
export const CartContext = createContext();
export function CartProvider({children}) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bb_cart')) || [];
    } catch { return []; }
  });

  useEffect(()=> {
    localStorage.setItem('bb_cart', JSON.stringify(cart));
  },[cart]);

  function addItem(item) {
    setCart(prev => {
      const found = prev.find(i => i.item_id===item.item_id && JSON.stringify(i.customizations)===JSON.stringify(item.customizations));
      if (found) return prev.map(i => i===found ? {...i, quantity: i.quantity+item.quantity} : i);
      return [...prev, item];
    });
  }
  function updateQty(index, qty){
    setCart(prev=>{
      const copy=[...prev]; copy[index].quantity = qty; return copy;
    });
  }
  function remove(index){
    setCart(prev=> prev.filter((_,i)=>i!==index));
  }
  function clear(){ setCart([]); }
  function subtotal(){ return cart.reduce((s,i)=> s + i.unit_price_cents * i.quantity, 0); }

  return <CartContext.Provider value={{cart, addItem, updateQty, remove, clear, subtotal}}>{children}</CartContext.Provider>
}
