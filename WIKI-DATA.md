# Bibliothek: Daten und spätere Anbindung

Die Bibliothek ist ein lokaler Wiki-Prototyp mit einem räumlichen Wissensgraphen.
Es gibt noch keine Datenbank, Netzwerkabfragen oder Server-Endpunkte.

## Verhalten

- 11 ausdrücklich gekennzeichnete Beispieleinträge zum Einstieg.
- Einträge suchen, erstellen, bearbeiten und miteinander verknüpfen.
- Jeder Eintrag erzeugt einen leuchtenden 3D-Knoten; Verbindungen werden als Kanten gezeigt.
- Der Graph lässt sich ausblenden; seine Rotation separat anhalten. Die globale Animationspause und reduzierte Bewegung gelten ebenfalls.
- Texte werden mit `textContent` dargestellt. HTML wird nicht ausgeführt.
- Speicherung in `localStorage`, Schlüssel `werkstatt-wiki-v1`. Kein Cloud-Sync. Löschen der Browserdaten entfernt lokale Einträge.

## Browser-Adapter v1

`window.werkstattWiki.list()` liefert eine Kopie der Einträge.
`window.werkstattWiki.replace(entries)` validiert und ersetzt den vollständigen Datenbestand; UI und Graph werden sofort aktualisiert, auch bei pausierter Animation. Der Import wird lokal gespeichert. Eine ungültige Eingabe oder fehlgeschlagene Speicherung verändert den bisherigen Bestand nicht.

```js
window.werkstattWiki.replace([
  {
    id: 'illuna',
    title: 'Illuna',
    kind: 'Projekt',
    body: 'Meine Notizen zu Illuna.',
    links: ['prototypen']
  },
  {
    id: 'prototypen',
    title: 'Prototypen',
    kind: 'Wissen',
    body: 'Was habe ich beim Testen gelernt?',
    links: []
  }
]);
```

Erlaubt: bis zu 150 Einträge; eindeutige IDs (1–80 Zeichen, Buchstaben/Ziffern/`-`/`_`), Titel (1–100 Zeichen), `kind` = `Projekt`, `Wissen` oder `Idee`, `body` bis 20.000 Zeichen, `links` mit vorhandenen IDs. Keine Selbstverknüpfungen. Doppelte Kanten werden im Graphen nur einmal gezeigt; die Detailansicht zeigt auch eingehende Verknüpfungen.

Für die spätere Datenbankanbindung kann ein authentifiziertes Backend seine Datensätze auf dieses Format abbilden und an den Adapter liefern. Wiki-Änderungen werden aktuell ausschließlich lokal gespeichert: Für einen echten Sync sind zusätzlich eine Schreib-API, Authentifizierung und Konfliktbehandlung nötig. Datenbankzugangsdaten gehören nicht in diese HTML-Datei.

Der Agenten-Adapter ist davon unabhängig; siehe `AGENT-UPDATES.md`.
