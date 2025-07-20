const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Svarka.bg. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 