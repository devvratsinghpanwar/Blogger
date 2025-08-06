
import Footer from "./ui/Footer";
import Orb from "./ui/Orb";
const LandingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen">
        <div className="relative w-full h-[600px]">
        
        <Orb
          hoverIntensity={2.5}
          rotateOnHover={true}
          hue={0}
          forceHoverState={false}
        />
        <div
          className="
            pointer-events-none                 
            absolute inset-0
            flex flex-col justify-center items-center
            text-white                            
            z-10
            px-4
          "
        >
          <h1 className="text-3xl font-bold text-center">
            Welcome to BLOGGER
          </h1>
          <p className="text-center mt-2 text-2xl">READ, WRITE, and SHARE</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default LandingPage