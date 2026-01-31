function About(){
    return (
        <section id="about">
            <div className="about-container">
                <div className="about-headline">
                    <div className="about-left-heading">
                        <h2> Discover What We Can Build Together</h2>
                    </div>
                    <div className="about-right-heading">
                        <h3> Explore what’s possible with an AI-driven discovery experience designed to adapt to your needs. Our platform helps you interact with real housing data in a simple, intuitive way—making it easier to explore options, spot patterns, and gain clarity on what’s out there.</h3>
                    </div>
                </div>
                <div className="cards-container">
                    <div className="card">
                        <div className="card-icon">
                            <img src="/star.png"/>
                        </div>
                        <div className="card-heading">
                            <h3> Smart Personalization </h3>

                        </div>
                        <div className="card-content">
                            <p> Our AI filtering adapts to what matters most to you. Instead of rigid checkboxes, it understands intent—analyzing preferences, priorities, and patterns in housing data to surface options that best align with your goals. This creates a more thoughtful, personalized discovery experience that feels tailored, not generic.</p>

                        </div>

                    </div>

                    <div className="card">
                        <div className="card-icon">
                        <img src="/user.png"/>
                        </div>
                        <div className="card-heading">
                            <h3> Community Impact </h3>

                        </div>
                        <div className="card-content">
                            <p> Homes don’t exist in isolation, and neither should your search. Our AI considers neighborhood-level trends and shared characteristics to help you explore areas that align with your lifestyle. By revealing patterns across communities, it helps you understand how different environments may fit the way you want to live.</p>

                        </div>

                    </div>

                    <div className="card">
                        <div className="card-icon">
                            <img src="/pencil.png"/> 

                        </div>
                        <div className="card-heading">
                            <h3> Guided Refinement </h3>

                        </div>
                        <div className="card-content">
                            <p> Your vision evolves as you explore, and the AI evolves with you. Through interactive input and continuous refinement, the system helps you clarify what you’re really looking for—adjusting results as your preferences change. It’s a guided process that turns exploration into confident decision-making.</p>

                        </div>

                    </div>

                    
                    
                </div>
            </div>
        </section>
    )
}

export default About