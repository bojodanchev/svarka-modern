const AboutPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">About Svarka.bg</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <p className="text-lg leading-relaxed">
          Svarka is a card game that suits the temperament of the Balkan peoples.
          It is an extremely entertaining and emotional game, in which the goal
          is for a player's hand to have a higher total than the other players'
          in order to win.
        </p>
        <p className="text-lg leading-relaxed mt-4">
          Bluffing is recommended. This is how players express their sense of
          humor, and the emotion is 100%. The game is relatively easy to play,
          which makes it so popular.
        </p>
      </div>
    </div>
  );
};

export default AboutPage; 