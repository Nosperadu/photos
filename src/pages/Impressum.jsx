import React from "react";

export default function Impressum() {
  return (
    <main className="wrap">
      <h2>Impressum</h2>
      <p>Angaben gemäß § 5 TMG</p>
      <p>
        <strong>Jonas Németh</strong><br />
        Hülßestr. 10<br />
        01237 Dresden<br />
        Deutschland
      </p>
      <p>
        E-Mail:{" "}
        <a href="photo@jonas-nemeth.de">
          photo@jonas-nemeth.de
        </a>
      </p>

      <h2>Datenschutzerklärung</h2>

      <h3>Allgemeiner Hinweis</h3>
      <p>
        Diese Website dient ausschließlich der Präsentation meiner fotografischen
        Arbeiten. Es werden keine Cookies gesetzt, keine Tracking-Tools
        eingesetzt und keine externen Dienste wie Google Analytics verwendet.
      </p>

      <h3>Verantwortlicher</h3>
      <p>
        Jonas Németh<br />
        Hülßestr. 10<br />
        01237 Dresden<br />
        Deutschland
        E-Mail:{" "}
        <a href="photo@jonas-nemeth.de">
          photo@jonas-nemeth.de
        </a>
      </p>

      <h3>Hosting</h3>
      <p>
        Diese Website wird über <strong>GitHub Pages</strong> bereitgestellt.
        Beim Aufruf der Seiten werden durch GitHub (GitHub Inc., 88 Colin P.
        Kelly Jr. Street, San Francisco, CA 94107, USA) technische
        Verbindungsdaten wie IP-Adresse, Datum und Uhrzeit des Zugriffs
        verarbeitet. Die Daten werden ausschließlich zur Sicherstellung des
        Betriebs und zur Fehlererkennung gespeichert. Weitere Informationen
        finden sich in der{" "}
        <a
          href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
          target="_blank"
          rel="noopener noreferrer"
        >
          Datenschutzerklärung von GitHub
        </a>
        .
      </p>

      <h3>Kontaktaufnahme</h3>
      <p>
        Bei einer Kontaktaufnahme per E-Mail werden die angegebenen Daten
        ausschließlich zur Bearbeitung der Anfrage verwendet. Eine Weitergabe an
        Dritte erfolgt nicht.
      </p>

      <h3>Rechte der betroffenen Personen</h3>
      <p>
        Besucher dieser Website haben das Recht auf Auskunft über die
        gespeicherten Daten, deren Berichtigung, Löschung sowie Einschränkung
        der Verarbeitung. Ebenso besteht ein Beschwerderecht bei der zuständigen
        Aufsichtsbehörde.
      </p>
    </main>
  );
}