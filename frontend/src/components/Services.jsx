import { Link } from "react-router"
function Services (){
    return(
        <section id="services">
                <div className="services-headline">
                    <p className="services-note"> We Appreciate Your Trust Greatly </p>
                    <h1 className="services-title"> Transform Your Perspective Now </h1>
                    <p className="services-content"> Take the next step toward clarity and confidence. This is your chance to explore housing data through a smarter lens—one that adapts to your needs, highlights meaningful patterns, and helps you better understand what’s possible. When you’re ready, let the AI guide you forward and reshape the way you discover homes.</p>
                    <Link to="/api"> <button className="services-button"> Try Now </button> </Link>
                </div>
                <div className="services-image">
                    <img src="/services-img.jpg"/>
                    <img src="/services-img2.jpg"/>
                    <img src="/services-img3.jpg"/>
                </div>
        </section>
    )
}
export default Services