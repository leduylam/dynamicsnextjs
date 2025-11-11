import React, { useEffect } from "react";
import { CartProvider } from "./cart/cart.context";
import { AuthProvider, useAuth } from "./auth/auth-context";

export interface State {
  isAuthorized: boolean;
  displaySidebar: boolean;
  displayFilter: boolean;
  displayModal: boolean;
  displayShop: boolean;
  displayCart: boolean;
  displaySearch: boolean;
  modalView: string;
  modalData: any;
  drawerView: string | null;
  toastText: string;
}

const initialState = {
  isAuthorized: false,
  displaySidebar: false,
  displayFilter: false,
  displayModal: false,
  displayShop: false,
  displayCart: false,
  displaySearch: false,
  modalView: "LOGIN_VIEW",
  drawerView: null,
  modalData: null,
  toastText: "",
};

type Action =
  | {
      type: "SET_AUTHORIZED";
    }
  | {
      type: "SET_UNAUTHORIZED";
    }
  | {
      type: "OPEN_SIDEBAR";
    }
  | {
      type: "CLOSE_SIDEBAR";
    }
  | {
      type: "OPEN_CART";
    }
  | {
      type: "CLOSE_CART";
    }
  | {
      type: "OPEN_SEARCH";
    }
  | {
      type: "CLOSE_SEARCH";
    }
  | {
      type: "SET_TOAST_TEXT";
      text: ToastText;
    }
  | {
      type: "OPEN_FILTER";
    }
  | {
      type: "CLOSE_FILTER";
    }
  | {
      type: "OPEN_SHOP";
    }
  | {
      type: "CLOSE_SHOP";
    }
  | {
      type: "OPEN_MODAL";
    }
  | {
      type: "CLOSE_MODAL";
    }
  | {
      type: "SET_MODAL_VIEW";
      view: MODAL_VIEWS;
    }
  | {
      type: "SET_DRAWER_VIEW";
      view: DRAWER_VIEWS;
    }
  | {
      type: "SET_MODAL_DATA";
      data: any;
    }
  | {
      type: "SET_USER_AVATAR";
      value: string;
    };

type MODAL_VIEWS =
  | "SIGN_UP_VIEW"
  | "LOGIN_VIEW"
  | "FORGET_PASSWORD"
  | "PRODUCT_VIEW";
type DRAWER_VIEWS = "CART_SIDEBAR" | "MOBILE_MENU";
type ToastText = string;

export const UIContext = React.createContext<State | any>(initialState);

UIContext.displayName = "UIContext";

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case "SET_AUTHORIZED": {
      return {
        ...state,
        isAuthorized: true,
      };
    }
    case "SET_UNAUTHORIZED": {
      return {
        ...state,
        isAuthorized: false,
      };
    }
    case "OPEN_SIDEBAR": {
      return {
        ...state,
        displaySidebar: true,
      };
    }
    case "CLOSE_SIDEBAR": {
      return {
        ...state,
        displaySidebar: false,
        drawerView: null,
      };
    }
    case "OPEN_CART": {
      return {
        ...state,
        displayCart: true,
      };
    }
    case "CLOSE_CART": {
      return {
        ...state,
        displayCart: false,
      };
    }
    case "OPEN_SEARCH": {
      return {
        ...state,
        displaySearch: true,
      };
    }
    case "CLOSE_SEARCH": {
      return {
        ...state,
        displaySearch: false,
      };
    }
    case "OPEN_FILTER": {
      return {
        ...state,
        displayFilter: true,
      };
    }
    case "CLOSE_FILTER": {
      return {
        ...state,
        displayFilter: false,
      };
    }
    case "OPEN_SHOP": {
      return {
        ...state,
        displayShop: true,
      };
    }
    case "CLOSE_SHOP": {
      return {
        ...state,
        displayShop: false,
      };
    }
    case "OPEN_MODAL": {
      return {
        ...state,
        displayModal: true,
        displaySidebar: false,
      };
    }
    case "CLOSE_MODAL": {
      return {
        ...state,
        displayModal: false,
      };
    }
    case "SET_MODAL_VIEW": {
      return {
        ...state,
        modalView: action.view,
      };
    }
    case "SET_DRAWER_VIEW": {
      return {
        ...state,
        drawerView: action.view,
      };
    }
    case "SET_MODAL_DATA": {
      return {
        ...state,
        modalData: action.data,
      };
    }
    case "SET_TOAST_TEXT": {
      return {
        ...state,
        toastText: action.text,
      };
    }
    case "SET_USER_AVATAR": {
      return {
        ...state,
        userAvatar: action.value,
      };
    }
  }
}

export const UIProvider: React.FC = (props) => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState);
  const { user, loading } = useAuth();
  
  // ✅ FIX: useCallback để stable function references (tránh infinite loop)
  const authorize = React.useCallback(() => dispatch({ type: "SET_AUTHORIZED" }), []);
  const unauthorize = React.useCallback(() => dispatch({ type: "SET_UNAUTHORIZED" }), []);
  const openSidebar = React.useCallback(() => dispatch({ type: "OPEN_SIDEBAR" }), []);
  const closeSidebar = React.useCallback(() => dispatch({ type: "CLOSE_SIDEBAR" }), []);
  const toggleSidebar = React.useCallback(() =>
    state.displaySidebar
      ? dispatch({ type: "CLOSE_SIDEBAR" })
      : dispatch({ type: "OPEN_SIDEBAR" }), [state.displaySidebar]);
  const closeSidebarIfPresent = React.useCallback(() =>
    state.displaySidebar && dispatch({ type: "CLOSE_CART" }), [state.displaySidebar]);
  const openCart = React.useCallback(() => dispatch({ type: "OPEN_CART" }), []);
  const closeCart = React.useCallback(() => dispatch({ type: "CLOSE_CART" }), []);
  const toggleCart = React.useCallback(() =>
    state.displaySidebar
      ? dispatch({ type: "CLOSE_CART" })
      : dispatch({ type: "OPEN_CART" }), [state.displaySidebar]);
  const closeCartIfPresent = React.useCallback(() =>
    state.displaySidebar && dispatch({ type: "CLOSE_CART" }), [state.displaySidebar]);

  const openFilter = React.useCallback(() => dispatch({ type: "OPEN_FILTER" }), []);
  const closeFilter = React.useCallback(() => dispatch({ type: "CLOSE_FILTER" }), []);

  const openShop = React.useCallback(() => dispatch({ type: "OPEN_SHOP" }), []);
  const closeShop = React.useCallback(() => dispatch({ type: "CLOSE_SHOP" }), []);

  const openModal = React.useCallback(() => dispatch({ type: "OPEN_MODAL" }), []);
  const closeModal = React.useCallback(() => dispatch({ type: "CLOSE_MODAL" }), []);
  const openSearch = React.useCallback(() => dispatch({ type: "OPEN_SEARCH" }), []);
  const closeSearch = React.useCallback(() => dispatch({ type: "CLOSE_SEARCH" }), []);

  const setUserAvatar = React.useCallback((_value: string) =>
    dispatch({ type: "SET_USER_AVATAR", value: _value }), []);
  const setModalView = React.useCallback((view: MODAL_VIEWS) =>
    dispatch({ type: "SET_MODAL_VIEW", view }), []);
  const setDrawerView = React.useCallback((view: DRAWER_VIEWS) =>
    dispatch({ type: "SET_DRAWER_VIEW", view }), []);
  const setModalData = React.useCallback((data: any) =>
    dispatch({ type: "SET_MODAL_DATA", data }), []);
    
  useEffect(() => {
    if (loading) return;
    if (user) authorize();
    else unauthorize();
  }, [user, loading, authorize, unauthorize]);

  const value = React.useMemo(
    () => ({
      ...state,
      authorize,
      unauthorize,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      closeSidebarIfPresent,
      openCart,
      closeCart,
      toggleCart,
      closeCartIfPresent,
      openFilter,
      closeFilter,
      openShop,
      closeShop,
      openModal,
      closeModal,
      openSearch,
      closeSearch,
      setModalView,
      setDrawerView,
      setUserAvatar,
      setModalData,
    }),
    // ✅ FIX: state thay đổi → value update
    // dispatch từ useReducer là stable, không cần include trong deps
    [state]
  );
  return <UIContext.Provider value={value} {...props} />;
};

export const useUI = () => {
  const context = React.useContext(UIContext);
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`);
  }
  return context;
};

// @ts-ignore
export const ManagedUIContext: React.FC = ({ children, initialAuthData }) => (
  <AuthProvider initialData={initialAuthData}>
    <CartProvider>
      {/* @ts-ignore */}
      <UIProvider>{children}</UIProvider>
    </CartProvider>
  </AuthProvider>
);
