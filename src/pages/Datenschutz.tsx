import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Datenschutz() {
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

        <h1 className="font-serif text-3xl text-sage-800 mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-sage">
          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">1. Verantwortlicher</h2>
          <p className="text-sage-600">
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br /><br />
            [VORNAME NACHNAME]<br />
            [STRASSE HAUSNUMMER]<br />
            [PLZ ORT]<br />
            E-Mail: [EMAIL-ADRESSE]
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">2. Allgemeines zur Datenverarbeitung</h2>
          <p className="text-sage-600">
            Der Schutz deiner persönlichen Daten ist mir wichtig. Ich behandle deine personenbezogenen Daten 
            vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">3. Hosting</h2>
          <p className="text-sage-600">
            Diese Website wird bei Cloudflare gehostet. Cloudflare kann beim Aufruf dieser Website 
            technische Daten wie deine IP-Adresse erfassen. Dies ist notwendig für die Bereitstellung 
            und Sicherheit der Website.
          </p>
          <p className="text-sage-600 mt-2">
            Anbieter: Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA<br />
            Mehr Infos: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-sage-700 underline">Cloudflare Datenschutzerklärung</a>
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">4. Kunden-Galerien</h2>
          <p className="text-sage-600">
            Wenn du eine Kunden-Galerie besuchst und Fotos markierst, wird eine anonyme Besucher-ID 
            in deinem Browser gespeichert (LocalStorage). Diese dient nur dazu, deine Markierungen 
            wiederzuerkennen. Es werden dabei keine persönlichen Daten erhoben.
          </p>
          <p className="text-sage-600 mt-2">
            Optional kannst du einen Namen angeben, um deine Markierungen zu personalisieren. 
            Dieser wird zusammen mit deinen Markierungen gespeichert.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">5. Foto-Speicherung</h2>
          <p className="text-sage-600">
            Die Fotos in den Kunden-Galerien werden bei Cloudflare R2 gespeichert. 
            Der Zugriff erfolgt nur über geheime Links, die du von mir erhältst.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">6. Cookies</h2>
          <p className="text-sage-600">
            Diese Website verwendet nur technisch notwendige Cookies für die Funktion der Seite. 
            Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">7. Kontaktaufnahme</h2>
          <p className="text-sage-600">
            Wenn du mich per E-Mail kontaktierst, werden deine Angaben zur Bearbeitung deiner 
            Anfrage gespeichert. Diese Daten gebe ich nicht ohne deine Einwilligung weiter.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">8. Deine Rechte</h2>
          <p className="text-sage-600">
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung 
            der Verarbeitung deiner personenbezogenen Daten. Wende dich dazu einfach an mich.
          </p>

          <h2 className="text-xl font-medium text-sage-700 mt-6 mb-3">9. Änderungen</h2>
          <p className="text-sage-600">
            Ich behalte mir vor, diese Datenschutzerklärung anzupassen, damit sie stets den 
            aktuellen rechtlichen Anforderungen entspricht.
          </p>

          <p className="text-sage-400 mt-8 text-sm">
            Stand: {new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
