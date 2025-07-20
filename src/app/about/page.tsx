const AboutPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">За нас</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <p className="text-lg leading-relaxed">
          Сварката е игра на карти, която подхожда на темперамента на
          балканските народи. Изключително развлекателна и емоционална игра, в
          която целта е сборът от картите на един играч да е по-голям от този
          на другите играчи, за да спечели.
        </p>
        <p className="text-lg leading-relaxed mt-4">
          Блъфовете са препоръчителни. Така се изразява чувството за хумор на
          играчите и емоцията е 100%. Играе се сравнително лесно, което я
          прави и толкова популярна.
        </p>
      </div>
    </div>
  );
};

export default AboutPage; 