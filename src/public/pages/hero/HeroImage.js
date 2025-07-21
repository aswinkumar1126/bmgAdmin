import React from 'react';
import './HeroImage.css';
import banner from './benner.png';

const HeroImage = () => {
    return (
        <section className="hero-image-section">
            <img
                src={banner}
                alt="Stylish woman with jewelry"
                className="hero-image"
            />
        </section>
    );
};

export default HeroImage;
