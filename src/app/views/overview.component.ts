import { Component } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'overview',
  template: `
    <h1><em>eHinman &ndash; Kollationstool für Musikdrucke </em></h1> <p>&nbsp; </p><img class="displayed" src="../assets/images/Mockup.png" width="80%"><p>&nbsp; </p> <p>&nbsp; </p><p class="center"> Kleine Differenzen zwischen historischen Drucken eines musikalischen Werks können große Auswirkung auf deren Einordnung in die Entstehungs - bzw. Überlieferungsgeschichte haben. </p><p class="center"> Das &bdquo; <em>Zentrum Musik &ndash; Edition &ndash; Medien </em>&ldquo; (<em>ZenMEM</em>) hat seinen besonderen Schwerpunkt auf dem Gebiet nichttextueller bzw. hybrider Objekte im Umfeld von Musikeditionen. Das Erstellen historisch - kritischer Ausgaben musikalischer Werke basiert auf der Auswertung von Autografen der Komponisten, von Abschriften, von Drucken unterschiedlichster Verleger sowie zusätzlicher sekundärer Quellen, z.B. Briefen oder Tagebüchern. Dabei muss der Editor die verfügbaren Quellen analysieren, kleinste Unterschiede erkennen, dokumentieren und die Abweichungen bewerten. Insbesondere bei den in der Regel undatierten Druckausgaben mit ihren mehrfachen und teils überarbeiteten späteren Abzügen stellt die chronologische Ordnung eine Herausforderung dar. Bislang bereitet der hierzu nötige akribische Vergleich dieser Abzüge ohne dafür geeignete Werkzeuge einen enormen Arbeitsaufwand für den Musikwissenschaftler. Deshalb soll mit dem eHinman ein Tool geschaffen werden, das Wissenschaftlerinnen und Wissenschaftlern diese Arbeit künftig erleichtert &ndash; dieses Tool käme aber zugleich auch praktischen Musikerinnen und Musikern, z.B. Dirigenten oder Notensetzern, zugute: Mithilfe des hier beschriebenen Tools lassen sich verfügbare unterschiedliche Druckstadien einer Sinfonie oder Oper oder ähnlich strukturierte Ausgaben direkt am Computer miteinander vergleichen. Mittels Algorithmen sollen längerfristig automatisch Unterschiede erkannt und farblich markiert werden, gleichzeitig hat der Editor die Möglichkeit, einzelne Kopien übereinanderzulegen, um kleinste, für das menschliche Auge oft erst nach intensivem Vergleich ersichtliche Differenzen, wie z.B. unterschiedliche Tonhöhen, abweichende Bögen, Artikulations - oder Dynamikzeichen sowie unterschiedliche Schlüsselformen, Balkensteigungen, Notenabstände etc. erkennen zu können &ndash; zuvor eine aufwendige manuelle Prozedur. Mit einem solchen Werkzeug lassen sich die auf dem eingehenden Vergleich von Vorlagen beruhenden Datierungshypothesen in Zukunft sehr viel müheloser und erheblich schneller erstellen und überprüfen, zugleich erhalten Notensetzer für ihre Herstellungsprozesse ein sehr effizientes Kontrollinstrument. </p><p class="center"> Eine Anbindung des Werkzeugs an das IIIF - Format ist geplant &ndash; damit könnten dann auch Ausgaben aus unterschiedlichen Bibliotheken und Archiven direkt am Bildschirm kollationiert werden. </p><p class="center">Die Idee dieses Werkzeugs knüpft an den in den 1940 - er Jahren von Charlton Hinman entwickelten und in der Shakespeare - Forschung eingesetzten &bdquo;Hinman - Collator &ldquo; an, bei dem unterschiedliche Auflagen über ein kompliziertes Beleuchtungsverfahren mit Hilfe von Spiegel übereinandergeblendet wurden, so dass Eingriffe in die Druckplatten leicht erkennbar wurden. Ein vergleichbares Tool hat vor einigen Jahren Laurent Pugin im Rahmen des Aruspix - Projekts an der McGill - Universität entwickelt &ndash; sein, auf Musikdrucke des 16. / 17. Jahrhunderts zentriertes Verfahren war aber als Vorstufe eines Optical Music - Recognition - Prozesses konzipiert. Das nun entwickelte Werkzeug soll auf Musik mit größerer Zeichendichte und - vielfalt, aber auch auf Texte anwendbar sein und eine aufgabenspezifische Vorbereitung der Vorlagen ermöglichen.</p>

  `,
  styles: [`
    .displayed {
      display:block;
      margin-left:auto;
      margin-right:auto;
      }
    .center {
      display:block;
      margin-left:5%;
      margin-right:5%;
      }
    h1 {
        text-align:center;
    }
  `],
})
export class OverviewComponent {

}
