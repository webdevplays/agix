
export default function DexScreenerSection() {
  return (
    <section id="chart" className="py-16 sm:py-24 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-headline">
            Live Chart
          </h2>
        </div>
        <div className="mt-12 rounded-lg overflow-hidden border">
          <style>{`#dexscreener-embed{position:relative;width:100%;padding-bottom:125%;}@media(min-width:1400px){#dexscreener-embed{padding-bottom:65%;}}#dexscreener-embed iframe{position:absolute;width:100%;height:100%;top:0;left:0;border:0;}`}</style>
          <div id="dexscreener-embed">
            <iframe src="https://dexscreener.com/solana/71oaXri7rvp8LJugWaCpgpMwydF7vk8tmdoxCzESJYfW?embed=1&loadChartSettings=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
