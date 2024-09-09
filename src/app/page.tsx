import QuestionList from "../components/QuestionList";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Questions</h1>
      <QuestionList />
    </main>
  );
}
