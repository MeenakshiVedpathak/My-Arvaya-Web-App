import { useState, useEffect } from "react";

export const LAB_CART_KEY = "arvaya_lab_cart";

export const getStoredLabCart = () => {
  try {
    const raw = localStorage.getItem(LAB_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read lab cart from storage", e);
    return [];
  }
};

export const saveStoredLabCart = (cart) => {
  try {
    localStorage.setItem(LAB_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("arvaya_lab_cart_updated"));
  } catch (e) {
    console.error("Failed to save lab cart", e);
  }
};

export const getLabItemKey = (item) => {
  if (!item) return "";
  return String(item.id || item.service_key || item.key || item.title || item.service_name || "");
};

export const addToLabCart = (item, qty = 1) => {
  if (!item) return [];
  const key = getLabItemKey(item);
  const cart = getStoredLabCart();
  let updated;
  const existingIndex = cart.findIndex(c => getLabItemKey(c) === key);
  if (existingIndex > -1) {
    updated = cart.map((c, i) => i === existingIndex ? { ...c, qty: c.qty + qty } : c);
  } else {
    updated = [...cart, {
      id: key,
      title: item.title || item.service_name || "Diagnostic Test",
      category: item.category || "Diagnostic Care",
      price: item.price || 0,
      oldPrice: item.oldPrice,
      discount: item.discount,
      fasting: item.fasting || (item.fasting_required ? "Fasting Required" : "No Fasting Required"),
      reportTime: item.reportTime || item.report_time || "24 Hours",
      subitems: item.subitems || [],
      tests: item.tests || null,
      qty: qty > 0 ? qty : 1,
      slotDate: item.slotDate || null,
      slotTime: item.slotTime || null,
      slotLabel: item.slotLabel || null,
      slotId: item.slotId || null,
      rawItem: item
    }];
  }
  saveStoredLabCart(updated);
  return updated;
};

export const updateLabCartQty = (key, delta) => {
  const cart = getStoredLabCart();
  const updated = cart.map(c => {
    if (getLabItemKey(c) === key) {
      const newQty = c.qty + delta;
      return newQty > 0 ? { ...c, qty: newQty } : null;
    }
    return c;
  }).filter(Boolean);
  saveStoredLabCart(updated);
  return updated;
};

export const removeFromLabCart = (key) => {
  const cart = getStoredLabCart();
  const updated = cart.filter(c => getLabItemKey(c) !== key);
  saveStoredLabCart(updated);
  return updated;
};

export const assignSlotToLabCartItem = (key, slotInfo) => {
  const cart = getStoredLabCart();
  const updated = cart.map(c => {
    if (key === "ALL" || getLabItemKey(c) === key) {
      return {
        ...c,
        slotDate: slotInfo.date,
        slotTime: slotInfo.time || slotInfo.label,
        slotLabel: slotInfo.label || slotInfo.time,
        slotId: slotInfo.slot_id ?? slotInfo.id ?? slotInfo.slot?.id ?? null,
      };
    }
    return c;
  });
  saveStoredLabCart(updated);
  return updated;
};

export const clearLabCart = () => {
  saveStoredLabCart([]);
  return [];
};

export function useLabCart() {
  const [cart, setCart] = useState(getStoredLabCart);

  useEffect(() => {
    const handleSync = () => {
      setCart(getStoredLabCart());
    };
    window.addEventListener("arvaya_lab_cart_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("arvaya_lab_cart_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const totalCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  const totalPrice = cart.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 1)), 0);
  const totalOldPrice = cart.reduce((acc, item) => acc + (((item.oldPrice || item.price) || 0) * (item.qty || 1)), 0);

  return {
    cart,
    totalCount,
    totalPrice,
    totalOldPrice,
    addToCart: (item, qty) => setCart(addToLabCart(item, qty)),
    updateQty: (key, delta) => setCart(updateLabCartQty(key, delta)),
    removeFromCart: (key) => setCart(removeFromLabCart(key)),
    assignSlot: (key, slotInfo) => setCart(assignSlotToLabCartItem(key, slotInfo)),
    clearCart: () => setCart(clearLabCart())
  };
}
