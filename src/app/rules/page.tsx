const RulesPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Правила на Сварка</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Цел</h2>
        <p className="text-lg leading-relaxed">
          Целта на Сварка е да имате ръка с по-висок сбор точки от
          опонентите си. Играта се играе с тесте от 32 карти (от 7-ци до Аса).
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">Точкуване</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>Асата струват 11 точки.</li>
          <li>Попове, Дами, Валета и 10-ки струват 10 точки.</li>
          <li>9-ките са 9 точки, 8-ците са 8, а 7-ците са 7.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">Специални комбинации</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>Три еднакви карти: 3 пъти стойността на картата (напр. три 8-ци = 24 точки).</li>
          <li>Три Аса: 33 точки.</li>
          <li>Три 7-ци (със 7♣): 32.5 точки.</li>
          <li>7♣, K♥, K♦: 31 точки.</li>
          <li>7♣, A♥, K♥: 32 точки.</li>
          <li>"Бомба" (три Q, K, или 10): 30 точки.</li>
          <li>"Флъш" (три карти от една боя): Сбор от стойностите на картите.</li>
        </ul>
      </div>
    </div>
  );
};

export default RulesPage; 