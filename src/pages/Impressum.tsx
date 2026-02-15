import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Impressum() {
  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Startseite
        </Link>

        <h1 className="font-serif text-3xl text-sage-800 mb-8">Impressum</h1>

        <div className="prose prose-sage">
          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Angaben gemäß § 5 TMG</h2>
          <p className="text-sage-600">
            [VORNAME NACHNAME]<br />
            [STRASSE HAUSNUMMER]<br />
            [PLZ ORT]
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Kontakt</h2>
          <p className="text-sage-600">
            E-Mail: [EMAIL-ADRESSE]<br />
            Telefon: [TELEFONNUMMER] (optional)
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="text-sage-600">
            [VORNAME NACHNAME]<br />
            [STRASSE HAUSNUMMER]<br />
            [PLZ ORT]
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Streitschlichtung</h2>
          <p className="text-sage-600">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-sage-700 underline ml-1">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-sage-600 mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Haftung für Inhalte</h2>
          <p className="text-sage-600">
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
            Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen 
            zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Haftung für Links</h2>
          <p className="text-sage-600">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
            Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">Urheberrecht</h2>
          <p className="text-sage-600">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. 
            Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </div>
      </div>
    </div>
  );
}
