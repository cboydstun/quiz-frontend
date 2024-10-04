import { ApolloWrapper } from "../components/ApolloWrapper";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./styles/global.css";

export const metadata = {
  title: "Part 107 Drone License Quiz App",
  description:
    "Prepare for your FAA certification with our comprehensive quiz app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
        <ApolloWrapper>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
            {children}
          </main>
          <Footer />
        </ApolloWrapper>
      </body>
    </html>
  );
}
