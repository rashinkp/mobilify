import React from "react";
import Banner1 from "../../assets/Banner1_Home.svg";
import Banner2 from "../../assets/Banner2_Home.svg";
import ProductCard from "../../components/user/ProductCard.jsx";
import Footer from "../../components/user/Footer";
import { RotatingLines } from "react-loader-spinner";
import useProductApi from "../../hooks/useProductApi.jsx";
import { useGetAllProductsQuery } from "../../redux/slices/productApiSlice.js";
import { Package, ShoppingBag } from "lucide-react";
const HomePage = () => {
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch,
  } = useGetAllProductsQuery({
    limit: 8,
    sortBy: "createdAt",
    order: "desc",
  });

  const {
    data: bestSellingData,
    isLoading: isBestSellingLoading,
    isError: isBestSellingError,
    error: bestSellingError,
  } = useGetAllProductsQuery({
    limit: 8,
    sortBy: "salesCount",
    order: "desc",
  });

  const products = productsData?.products || [];
  const bestSelling = bestSellingData?.products || [];

  if (isProductsError || isBestSellingError) {
    return (
      <div>
        Error:{" "}
        {isProductsError ? productsError.message : bestSellingError.message}
      </div>
    );
  }

  if (isProductsLoading || isBestSellingLoading) {
    return (
      <div className="h-screen w-full absolute top-0 z-50 left-0 backdrop-blur-sm bg-black/30 flex justify-center items-center">
        <RotatingLines
          visible={true}
          height="50"
          width="50"
          color="grey"
          strokeColor="#fff"
          strokeWidth="2"
          animationDuration="8"
          ariaLabel="rotating-lines-loading"
        />
      </div>
    );
  }

  return (
    <div>
      <img
        src="https://res.cloudinary.com/dxogdfuse/image/upload/f_auto,q_auto/oj073er3vty1c0hwhyju"
        className="w-full mb-20 object-fill"
        alt=""
        onError={(e) => {
          e.target.src = Banner1;
        }}
      />
      <div className="px-16">
        <p className="font-extrabold text-4xl dark:text-lightText">
          New <span className="text-primary">arrival</span> for you
        </p>
        {products.length > 0 ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 5xl:grid-cols-5 justify-center px-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                refetch={refetch}
              />
            ))}
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center justify-center py-20 px-4">
            <Package className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
              No New Arrivals
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-center max-w-md">
              We're currently updating our collection. Check back soon for exciting new products!
            </p>
          </div>
        )}
      </div>
      <img
        src="https://res.cloudinary.com/dxogdfuse/image/upload/f_auto,q_auto/vvhklpagahmmqbovd7sw"
        className="w-full mt-20 object-cover mb-20"
        alt=""
        onError={(e) => {
          e.target.src = Banner2;
        }}
      />
      <div className="px-16">
        <p className="font-extrabold text-4xl dark:text-lightText">
          Flash sale for <span className="text-primary">best</span> sellers
        </p>
        {bestSelling.length > 0 ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 5xl:grid-cols-5 justify-center px-4">
            {bestSelling.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center justify-center py-20 px-4">
            <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
              No Best Sellers Available
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-center max-w-md">
              Best sellers will appear here once products start selling. Explore our collection to discover amazing deals!
            </p>
          </div>
        )}
      </div>
      <div className="px-20 mt-20 mb-20">
        <p className="font-extrabold text-center text-4xl dark:text-lightText">
          Empower <span className="text-primary">Your</span> World, One Mobile
          at a Time.
        </p>
      </div>
      <div className="flex justify-center items-center w-full px-4 mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
