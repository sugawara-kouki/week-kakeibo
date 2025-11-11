interface HomePageProps {
  userId: string | null;
}

export default function HomePage({ userId }: HomePageProps) {
  return (
    <main>
      <h1>Welcome to the Home Page</h1>
      {userId !== null && <p>Your user ID is: {userId}</p>}
    </main>
  );
}
