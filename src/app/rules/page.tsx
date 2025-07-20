const RulesPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Правила на Сварка</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">I. Стойност на картите</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>7, 8, 9 - имат толкова точки, колкото е стойността им.</li>
          <li>10, J (Вале), Q (Дама), K (Поп) - имат по 10 точки.</li>
          <li>A (Асо) - има 11 точки.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">II. Комбинации</h2>
        <p className="text-lg leading-relaxed">
          Печелят само картите, които имат най-голям сбор в комбинациите.
          Комбинациите могат да бъдат от 1, 2 или 3 карти.
        </p>
        <ul className="list-disc list-inside text-lg leading-relaxed mt-4">
          <li>
            Ако имате 2 или 3 карти от една и съща боя, техните стойности се
            събират и това е резултатът ви (Пример: K♥, 10♥, 8♦. Валидна
            комбинация е K♥ и 10♥, като сборът е 20. 8♦ не участва в сбора,
            тъй като е от различна боя).
          </li>
          <li>
            Ако имате 2 или 3 карти с еднаква стойност (чифт или тройка),
            техните стойности се събират и това е резултатът ви (Пример: 8♥,
            8♦, K♣. Валидна комбинация е 8♥ и 8♦, като сборът е 16).
          </li>
          <li>
            При тройка от еднакви карти, стойността на комбинацията е равна на
            сбора им (Пример: три Осмици = 24 точки).
          </li>
          <li>
            Ако нямате нито една от горните комбинации, тогава най-силната ви
            карта е вашият резултат (Пример: A♥, 8♦, 9♣. Резултатът ви е 11
            от Асото).
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">III. Специални комбинации</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>
            <strong>„Сварка“ или „Флъш“:</strong> Три карти от една и съща боя.
            Това е най-силната комбинация. (Пример: A♥, K♥, Q♥ = 31 точки).
          </li>
          <li>
            <strong>Три еднакви карти:</strong> Ако са от една и съща боя, се
            считат за „Сварка“.
          </li>
          <li>
            <strong>7♣ (Чечак):</strong> Играе ролята на Жокер и може да се
            комбинира с други 2 карти, за да образува „Сварка“. Стойността на
            7♣ е 11 точки.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RulesPage; 