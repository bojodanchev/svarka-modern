const RulesPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Rules of Svarka</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Objective</h2>
        <p className="text-lg leading-relaxed">
          The goal of Svarka is to have a hand with a higher point total than
          your opponents. The game is played with a 32-card deck (7s through Aces).
        </p>

        <h2 className="text-2xl font-bold mt-6 mb-4">Scoring</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>Aces are worth 11 points.</li>
          <li>Kings, Queens, Jacks, and 10s are worth 10 points.</li>
          <li>9s are worth 9 points, 8s are worth 8, and 7s are worth 7.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">Special Combinations</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>Three of a kind: 3x the card's value (e.g., three 8s = 24 points).</li>
          <li>Three Aces: 33 points.</li>
          <li>Three 7s (with 7♣): 32.5 points.</li>
          <li>7♣, K♥, K♦: 31 points.</li>
          <li>7♣, A♥, K♥: 32 points.</li>
          <li>"Bomb" (three Q, K, or 10): 30 points.</li>
          <li>Flush (three cards of the same suit): Sum of card values.</li>
        </ul>
      </div>
    </div>
  );
};

export default RulesPage; 