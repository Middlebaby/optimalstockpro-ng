import { Package, BarChart3, Bell, Truck, QrCode, Smartphone } from "lucide-react";

const SquareFlyer = () => (
  <div 
    className="w-[1080px] h-[1080px] bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#0a1628] p-16 flex flex-col justify-between relative overflow-hidden"
    style={{ fontFamily: "'Sora', sans-serif" }}
  >
    {/* Background decoration */}
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl" />
    
    {/* Header */}
    <div className="relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
          <Package className="w-10 h-10 text-white" />
        </div>
        <span className="text-4xl font-bold text-white">OptimalStock Pro</span>
      </div>
      
      <h1 className="text-7xl font-bold text-white leading-tight mb-6">
        Take Our Survey
      </h1>
      <div className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 text-[#0a1628] text-5xl font-bold px-8 py-4 rounded-2xl">
        Get 1 Month FREE
      </div>
    </div>
    
    {/* Features Grid */}
    <div className="relative z-10 grid grid-cols-2 gap-6 my-12">
      {[
        { icon: QrCode, label: "Barcode Scanner" },
        { icon: BarChart3, label: "Real-time Tracking" },
        { icon: Bell, label: "Low Stock Alerts" },
        { icon: Truck, label: "Supplier Management" },
      ].map((feature, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-4 border border-white/20">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <feature.icon className="w-8 h-8 text-white" />
          </div>
          <span className="text-white text-2xl font-medium">{feature.label}</span>
        </div>
      ))}
    </div>
    
    {/* Footer */}
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20">
        <Smartphone className="w-8 h-8 text-emerald-400" />
        <span className="text-white text-xl">optimalstockpro-ng.lovable.app/survey</span>
      </div>
      <div className="text-emerald-400 text-2xl font-semibold">
        Built for Nigerian Businesses
      </div>
    </div>
  </div>
);

const StoryFlyer = () => (
  <div 
    className="w-[1080px] h-[1920px] bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#0a1628] p-12 flex flex-col justify-between relative overflow-hidden"
    style={{ fontFamily: "'Sora', sans-serif" }}
  >
    {/* Background decoration */}
    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-3xl" />
    <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-500/15 to-transparent rounded-full blur-3xl" />
    
    {/* Header */}
    <div className="relative z-10 text-center pt-8">
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
          <Package className="w-12 h-12 text-white" />
        </div>
        <span className="text-5xl font-bold text-white">OptimalStock Pro</span>
      </div>
    </div>
    
    {/* Main Content */}
    <div className="relative z-10 text-center flex-1 flex flex-col justify-center -mt-20">
      <h1 className="text-8xl font-bold text-white leading-tight mb-8">
        TAKE OUR<br />SURVEY
      </h1>
      
      <div className="inline-block mx-auto bg-gradient-to-r from-emerald-400 to-teal-400 text-[#0a1628] text-6xl font-bold px-12 py-6 rounded-3xl mb-16">
        GET 1 MONTH FREE
      </div>
      
      {/* Features */}
      <div className="space-y-5 max-w-[800px] mx-auto">
        {[
          { icon: QrCode, label: "Barcode Scanner" },
          { icon: BarChart3, label: "Real-time Tracking" },
          { icon: Bell, label: "Low Stock Alerts" },
          { icon: Truck, label: "Supplier Management" },
        ].map((feature, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-5 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-9 h-9 text-white" />
            </div>
            <span className="text-white text-3xl font-medium">{feature.label}</span>
          </div>
        ))}
      </div>
    </div>
    
    {/* Footer */}
    <div className="relative z-10 text-center pb-8">
      <div className="bg-white/10 backdrop-blur-sm px-8 py-5 rounded-2xl border border-white/20 inline-block mb-6">
        <span className="text-white text-2xl">optimalstockpro-ng.lovable.app/survey</span>
      </div>
      <p className="text-emerald-400 text-2xl font-semibold">
        Built for Nigerian Businesses
      </p>
    </div>
  </div>
);

const WideFlyer = () => (
  <div 
    className="w-[1920px] h-[1080px] bg-gradient-to-r from-[#0a1628] via-[#0d2847] to-[#0a1628] p-16 flex relative overflow-hidden"
    style={{ fontFamily: "'Sora', sans-serif" }}
  >
    {/* Background decoration */}
    <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl" />
    
    {/* Left Side */}
    <div className="relative z-10 flex-1 flex flex-col justify-center pr-16">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center">
          <Package className="w-12 h-12 text-white" />
        </div>
        <span className="text-5xl font-bold text-white">OptimalStock Pro</span>
      </div>
      
      <h1 className="text-8xl font-bold text-white leading-tight mb-8">
        Take Our Survey
      </h1>
      
      <div className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 text-[#0a1628] text-5xl font-bold px-10 py-5 rounded-2xl mb-10 w-fit">
        Get 1 Month FREE
      </div>
      
      <div className="flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 flex items-center gap-3">
          <Smartphone className="w-7 h-7 text-emerald-400" />
          <span className="text-white text-xl">optimalstockpro-ng.lovable.app/survey</span>
        </div>
      </div>
    </div>
    
    {/* Right Side - Features */}
    <div className="relative z-10 flex-1 flex flex-col justify-center gap-6 pl-16 border-l border-white/10">
      <p className="text-emerald-400 text-2xl font-semibold mb-4">
        Inventory Management Made Simple
      </p>
      
      {[
        { icon: QrCode, label: "Barcode Scanner", desc: "Scan products instantly" },
        { icon: BarChart3, label: "Real-time Tracking", desc: "Monitor stock levels live" },
        { icon: Bell, label: "Low Stock Alerts", desc: "Never run out of stock" },
        { icon: Truck, label: "Supplier Management", desc: "Organize all your vendors" },
      ].map((feature, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-5 border border-white/20">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <feature.icon className="w-9 h-9 text-white" />
          </div>
          <div>
            <span className="text-white text-2xl font-semibold block">{feature.label}</span>
            <span className="text-white/60 text-lg">{feature.desc}</span>
          </div>
        </div>
      ))}
      
      <p className="text-white/60 text-xl mt-4">
        Built for Nigerian Businesses
      </p>
    </div>
  </div>
);

const Flyers = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">OptimalStock Pro Flyers</h1>
        <p className="text-gray-400 mb-8">Right-click and save, or use browser screenshot tools. Scale browser to 50% for full view.</p>
        
        <div className="space-y-16">
          {/* Square Flyer */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Square (1080×1080) - Instagram/Facebook Posts</h2>
            <div className="overflow-auto border border-gray-700 rounded-lg">
              <SquareFlyer />
            </div>
          </div>
          
          {/* Story Flyer */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Story (1080×1920) - Instagram/Facebook Stories</h2>
            <div className="overflow-auto border border-gray-700 rounded-lg">
              <StoryFlyer />
            </div>
          </div>
          
          {/* Wide Flyer */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Wide (1920×1080) - Twitter/LinkedIn/YouTube</h2>
            <div className="overflow-auto border border-gray-700 rounded-lg">
              <WideFlyer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flyers;
