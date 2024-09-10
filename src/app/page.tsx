import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center my-12">
        <h1 className="text-4xl font-bold mb-4">Master Your Part 107 Drone License</h1>
        <p className="text-xl mb-8">Prepare for your FAA certification with our comprehensive quiz app</p>
        <Link 
          href="/quiz" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300"
        >
          Start Free Quiz
        </Link>
      </header>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Our Quiz?</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Up-to-date with latest FAA regulations</li>
            <li>Comprehensive coverage of all test topics</li>
            <li>Adaptive learning technology</li>
            <li>Detailed explanations for each answer</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>1000+ practice questions</li>
            <li>Simulated test environment</li>
            <li>Performance tracking and analytics</li>
            <li>Mobile-friendly for on-the-go studying</li>
          </ul>
        </div>
      </section>

      <section className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Pilots</h2>
        <p className="text-lg mb-6">Our quiz has helped over 10,000 students pass their Part 107 exam on the first try</p>
        <div className="flex justify-center items-center space-x-4">
          <span className="text-4xl font-bold text-blue-600">4.9</span>
          <div className="flex text-yellow-400 text-2xl">
            {'★'.repeat(5)}
          </div>
          <span className="text-lg">(500+ reviews)</span>
        </div>
      </section>

      <section className="bg-gray-100 p-8 rounded-lg mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-center">Ready to Become a Certified Drone Pilot?</h2>
        <p className="text-center mb-6">Start your journey today and ace your Part 107 exam with confidence</p>
        <div className="text-center">
          <Link 
            href="/quiz" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-lg transition duration-300"
          >
            Begin Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}