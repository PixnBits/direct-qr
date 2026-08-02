import { Education } from "@/components/Education";
import { Footer } from "@/components/Footer";
import { Generator } from "@/components/Generator";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Validator } from "@/components/Validator";

export default function App() {
  return (
    <div className="min-h-dvh">
      <a
        href="#generate"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-fg"
      >
        Skip to generator
      </a>
      <Header />
      <main>
        <Hero />
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
          <Generator />
          <Validator />
          <Education />
        </div>
      </main>
      <Footer />
    </div>
  );
}
