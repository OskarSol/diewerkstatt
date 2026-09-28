# die werkstatt

Eine interaktive Klemmbaustein-Welt mit Werkhalle, Büro, Garten und Bibliothek.

## Ausprobieren

Die fertige, eigenständige Seite liegt in **`dist/index.html`** und lässt sich direkt im Browser öffnen. Für zuverlässige lokale Speicherung und die browserabhängige Spracheingabe empfiehlt sich ein lokaler Webserver oder HTTPS.

## Lokal entwickeln

Voraussetzung: eine mit Vite 7 kompatible Node.js-Version und npm.

```bash
npm ci
npm run build
npm run dev
```

Die lokale Vorschau läuft standardmäßig auf `http://localhost:4173`. Nach Änderungen in `src/` erneut `npm run build` ausführen. Der Build bündelt JavaScript und HTML zu einer einzigen Datei in `dist/index.html`.

## Funktionen

- Vier verbundene Räume mit animierter Klemmbaustein-Szene.
- Schwebender Roboterkopf mit leuchtenden Kugeln, steuerbar über die Pfeiltasten.
- BMW M2, Aston Martin, Garten und die Hunde Josie und Kara.
- Projektstationen mit lokalen Ordnern und Datei-Uploads.
- Fünf Demo-Agenten mit Projekt, Aufgabe, Status und Konsole.
- Bibliothek mit Wiki, Suche, verknüpften Einträgen und einblendbarem 3D-Wissensgraphen.
- Chat mit vorbereiteten Antworten, motivierenden Zitaten und optionaler Browser-Spracheingabe.

## Daten und Integrationen

Dies ist ein funktionaler Frontend-Prototyp. Chat und Agenten verwenden Demo-Ausgaben. Eine echte KI-Verbindung, Agenten-Webhooks und eine externe Wissensdatenbank sind noch nicht angeschlossen.

Projektdateien liegen lokal in IndexedDB; Wiki-Einträge in localStorage. Es gibt keinen Cloud-Sync. Das Löschen der Browserdaten entfernt diese lokalen Inhalte. Browserdaten sind nicht Bestandteil dieses Repositories.

- [Agenten-Adapter](AGENT-UPDATES.md)
- [Wiki-Datenmodell und Datenbankanbindung](WIKI-DATA.md)

## Struktur

```text
src/                 UI, Szene, Bewegung, Projektdateien, Agenten und Wiki
build.mjs            Build der eigenständigen HTML-Datei
dist/index.html      Fertige Anwendung
vite.config.js       Lokale Vorschau
```

Die Ansicht lässt sich ziehen, drehen und zoomen. Die Animationen können pausiert werden; reduzierte Bewegung wird berücksichtigt.
