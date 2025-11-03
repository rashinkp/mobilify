import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import { setCartCount } from "./redux/slices/cartCount";
import { useGetCartCountQuery } from "./redux/slices/cartApiSlice";

const App = () => {
  const theme = useSelector((state) => state.theme.theme);
  const { userInfo } = useSelector((state) => state.userAuth);

  // Only fetch cart count when user is logged in
  const { data = {}, isLoading, isError, error } = useGetCartCountQuery(undefined, {
    skip: !userInfo,
  });

  const dispatch = useDispatch();
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  });


  useEffect(() => {
    // Reset cart count when user logs out
    if (!userInfo) {
      dispatch(setCartCount(0));
      return;
    }

    if (isLoading) {
      return;
    }

    if (isError) {
      // Silently handle 401 errors (user not authenticated)
      if (error?.status !== 401) {
        console.error("Error fetching cart count:", error);
      }
      dispatch(setCartCount(0));
      return;
    }

    if (data && data.totalQuantity !== undefined) {
      dispatch(setCartCount(data.totalQuantity));
    } else {
      dispatch(setCartCount(0));
    }
  }, [data, isLoading, isError, dispatch, userInfo, error]);


  return (
    <Routes>
      <Route path="/*" element={<UserRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
};

export default App;
