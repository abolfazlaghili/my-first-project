import { SignIn } from '@clerk/nextjs';

export default function Page() {
  const appearance = {
    elements: {
      // Style the overall card container
      card: 'bg-gray-900 p-8 rounded-lg shadow-xl',
      // Customize the primary button with dark red background and a hover animation
      formButtonPrimary: 'bg-[#8B0000] hover:animate-pulse text-white font-semibold py-2 px-4 rounded transition duration-300',
      // You may add custom classes for other elements if needed
    },
    variables: {
      // Set dark red as the primary color for built-in elements (like links & accents)
      colorPrimary: '#8B0000',
      // More variables can be defined here
    },
  };

  return <SignIn appearance={appearance} />;
}