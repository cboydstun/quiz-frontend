import { ApolloWrapper } from '../components/ApolloWrapper';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ApolloWrapper>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </ApolloWrapper>
      </body>
    </html>
  );
}