import React, { useEffect, useRef } from 'react';
import { useRatesQuery } from '../../hook/rate/useRatesQuery';
import GoldCoin from '../../assets/coins/goldcoin-removebg-preview.png';
import SilverCoin from '../../assets/coins/silvercoin-removebg-preview.png';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useMediaQuery } from 'react-responsive';
import './RatesPage.css';

const RatesPage = () => {
    const { data: rates, isLoading, isError, error } = useRatesQuery();
    const isTablet = useMediaQuery({ maxWidth: 992 });
    const coinRefs = useRef([]);
    const containerRef = useRef(null);

    // GSAP Animations
    useEffect(() => {
        if (!containerRef.current || !isTablet) return;

        const ctx = gsap.context(() => {
            if (coinRefs.current[0] && coinRefs.current[1]) {
                const [goldCoin, silverCoin] = coinRefs.current;

                gsap.to(goldCoin, {
                    y: -5,
                    yoyo: true,
                    repeat: -1,
                    duration: 2,
                    ease: "sine.inOut"
                });

                gsap.to(silverCoin, {
                    y: -5,
                    yoyo: true,
                    repeat: -1,
                    duration: 2.5,
                    ease: "sine.inOut",
                    delay: 0.3
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, [isTablet, rates]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120 }
        }
    };

    if (!isTablet) return null;

    if (isLoading) return (
        <div className="rp-loading">
            <div className="rp-loading-spinner"></div>
            <p>Loading rates...</p>
        </div>
    );

    if (isError) return (
        <div className="rp-error">
            <p>Error: {error.message}</p>
        </div>
    );

    const RateCard = ({ type, rate, coinImg }) => {
        const isGold = type === 'Gold';
        return (
            <motion.div
                className={`rp-card ${isGold ? 'rp-gold' : 'rp-silver'}`}
                variants={cardVariants}
                whileTap={{ scale: 0.96 }}
            >
                <div className="rp-coin-container">
                    <img
                        ref={el => {
                            if (el) {
                                coinRefs.current[isGold ? 0 : 1] = el;
                            }
                        }}
                        src={coinImg}
                        alt={type}
                        className="rp-coin"
                    />
                </div>
                <div className="rp-rate-content">
                    <h3>{type}</h3>
                    <p className="rp-rate-value">
                        <span className="rp-rate-amount">₹{rate?.toLocaleString() || '--'}</span>
                        <span className="rp-rate-per">/gram</span>
                    </p>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="rates-page-container" ref={containerRef}>
            <motion.div
                className="rp-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="rp-row">
                    {rates && (
                        <>
                            <RateCard
                                type="Gold"
                                rate={rates?.GOLDRATE}
                                coinImg={GoldCoin}
                            />
                            <RateCard
                                type="Silver"
                                rate={rates?.SILVERRATE}
                                coinImg={SilverCoin}
                            />
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default RatesPage;