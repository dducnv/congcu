export const TitlePage = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-center uppercase text-mono text-2xl md:text-3xl lg:text-4xl font-bold mb-6">
      {children}
    </h1>
  );
};
