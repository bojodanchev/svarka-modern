const ContactsPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Контакти</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <p className="text-lg leading-relaxed text-center">
          За връзка с нас, моля, изпратете имейл на:
          <a href="mailto:support@svarka.bg" className="text-primary hover:underline">
            support@svarka.bg
          </a>
        </p>
      </div>
    </div>
  );
};

export default ContactsPage; 