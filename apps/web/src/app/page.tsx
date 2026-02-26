import ApiStatus from './components/ApiStatus';
import Architecture from './components/Architecture';
import Hero from './components/Hero';

export default function Index() {
  return (
    <main>
      <div className="flex justify-center py-6">
        <ApiStatus />
      </div>
      <Hero />
      <Architecture />
    </main>
  );
}
