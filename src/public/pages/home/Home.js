import React, { useState, useEffect } from "react";
import Banner from "../banner/Banner";
import { useBannersQuery } from "../../../admin/hooks/banners/useBannersQuery";
import SkeletonLoader from "../../components/loader/SkeletonLoader";
import Error from "../../components/error/Error";
import { useVideos } from "../../hook/video/useVideoQuery";
import Video from "../video/video";
import { useProductsQuery } from "../../hook/product/useProductsQuery";
import Product from "../../pages/product/Product";
import './Home.css';
import CategorySection from "../category/CategorySection";
import ProtectedRecentlyViewedWrapper from "../recentlyViewed/ProtectedRecentlyViewedWrapper";
import RatesPage from "../metalRates/metalRates";
import NewArrivalProductService from "../../service/newArrivals";
import NewArrivalsPage from "../newAriivals/NewArrivalsPage";
import HeroImage from "../hero/HeroImage";

function Home() {


    const {
        data: bannersData,
        isLoading: bannersLoading,
        isError: bannersError,
    } = useBannersQuery();

    const {
        data: videoData,
        isLoading: videoLoading,
        isError: videoError,
    } = useVideos();

    const {
        data: productData,
        isLoading: productsLoading,
        isError: productsError,
    } = useProductsQuery();

    const bannerData = bannersData?.data || [];
    const videosData = (videoData?.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const products = productData || [];
    const topTenProducts = products.slice(0, 10);

    const firstVideoUrl =
        videosData.length > 0
            ? `https://app.bmgjewellers.com${videosData[0].video_path}`
            : null;

    // if (bannersLoading || videoLoading || productsLoading)
    //     return <SkeletonLoader count={6} />;

    // if (bannersError || videoError || productsError)
    //     return (
    //         <Error
    //             error={bannersError || videoError || productsError}
    //             onRetry={() => window.location.reload()}
    //         />
    //     );

    return (
        <div className="home-section">
            {/* <HeroImage /> */}
            <Banner images={bannerData} loading={bannersLoading} />

            {/* Show RatesPage only on smaller screens */}
            <RatesPage />

            <CategorySection />

            <Product
                products={topTenProducts}
                loading={productsLoading}
                error={productsError}
            />

            

            {/* <NewArrivalsPage /> */}
            
            <ProtectedRecentlyViewedWrapper />

            {firstVideoUrl && (
                <Video
                    videoUrl={firstVideoUrl}
                    loading={videoLoading}
                    error={videoError}
                />
            )}
        </div>
    );
}

export default Home;