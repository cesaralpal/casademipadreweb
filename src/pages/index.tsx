import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard'); // Replace with the path to your dashboard page
  }, [router]);

  // Optional: Return a loading indicator while redirecting
  return <div>Loading...</div>;
};

export default HomePage;
