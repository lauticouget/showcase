import './global.css';
import { ApolloWrapper } from '@/lib/graphql/ApolloWrapper';

export const metadata = {
  title: 'Lautaro Couget — Full-Stack Developer',
  description:
    'Portfolio showcasing full-stack development with Next.js, GraphQL, and AWS.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
