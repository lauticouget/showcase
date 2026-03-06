import Architecture from './components/Architecture';
import { CreateUserButton } from './components/CreateUserButton';
import Hero from './components/Hero';
import { UsersList } from './components/UsersList';

export default function Index() {
  return (
    <main className="pt-14">
      <Hero />
      <Architecture />
      <CreateUserButton />
      <UsersList />
    </main>
  );
}
