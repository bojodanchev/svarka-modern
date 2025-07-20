const TournamentsPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-6">Информация за Турнири</h1>
      <div className="max-w-3xl mx-auto bg-card text-card-foreground p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">I. Основни правила</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>
            Всички турнири ще се провеждат в предварително обявен ден и час.
          </li>
          <li>
            В деня на турнира ще бъде активен бутон за записване, видим в
            прозореца на турнира.
          </li>
          <li>
            Всеки потребител, желаещ да се включи, трябва да се регистрира,
            като кликне на бутона "Включи се".
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">II. Процес на игра</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>
            След регистрация, изчакайте началния час на турнира. Когато
            турнирът започне, ще се появи маса за игра.
          </li>
          <li>
            Ако напуснете масата по време на игра, ще се счита, че сте се
            отказали от турнира.
          </li>
          <li>
            Победителят от всяка маса продължава в следващия кръг, докато не
            бъде излъчен крайният победител.
          </li>
          <li>
            След приключване на играта на вашата маса, изчакайте останалите
            маси да приключат. Следващият кръг ще започне автоматично.
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-4">III. Допълнителна информация</h2>
        <ul className="list-disc list-inside text-lg leading-relaxed">
          <li>
            Залата за турнири е видима за всички, но само участниците могат да
            пишат в чата.
          </li>
          <li>
            Ако играч не се появи на масата до 1 минута, той се дисквалифицира
            и се връща входната му такса.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TournamentsPage; 