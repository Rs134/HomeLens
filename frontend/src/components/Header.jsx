import {Link, Outlet} from "react-router"
import React from 'react';

function Header() {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-container">
                    <span className="logo-icon">🏠</span>
                    <div className="logo-content">
                        <span className="logo-text">HomeLens</span>
                    </div>
                </div>
                
                <nav className="nav">
                    <a href="#home" className="nav-link">Home</a>
                    <a href="#about" className="nav-link">About</a>
                    <a href="#services" className="nav-link">Services</a>
                    <a href="#contact" className="nav-link">Contact</a>
                </nav>

                <div className="header-actions">
                    <button className="btn">Get Started</button>
                </div>
            </div>
            <Outlet/>
        </header>
    );
}

export default Header;