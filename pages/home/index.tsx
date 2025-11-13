interface HomeProps {
  userId: string | null;
}

export default function Home({ userId }: HomeProps) {
  return (
    <main>
      <h1>Welcome to the Home</h1>
      {userId !== null && <p>Your user ID is: {userId}</p>}
    </main>
  );
}
