# DeepSite Watermark Remover

Une extension Chrome qui détecte automatiquement et supprime le watermark DeepSite des pages statiques Hugging Face.

## Fonctionnalités

- Détecte automatiquement les pages statiques DeepSite (URLs se terminant par `.static.hf.space`)
- Supprime le watermark DeepSite du bas de la page
- Affiche une notification lorsque le watermark est supprimé
- S'intègre parfaitement avec des extensions de capture d'écran comme GoFullPage

## Installation

### Installation en mode développeur

1. Téléchargez ou clonez ce dépôt sur votre ordinateur
2. Ouvrez Chrome et accédez à `chrome://extensions/`
3. Activez le "Mode développeur" en haut à droite
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier `chrome-extension` que vous avez téléchargé

L'extension est maintenant installée et prête à être utilisée.

## Utilisation

1. Naviguez vers n'importe quelle page statique DeepSite (URL se terminant par `.static.hf.space`)
2. L'extension détectera automatiquement la page et supprimera le watermark DeepSite
3. Une notification apparaîtra brièvement pour confirmer que le watermark a été supprimé
4. Utilisez une extension comme GoFullPage pour capturer une capture d'écran complète de la page sans watermark

## Extensions recommandées

Pour capturer des captures d'écran complètes, nous recommandons d'utiliser l'une des extensions suivantes :

- [GoFullPage](https://chrome.google.com/webstore/detail/gofullpage-full-page-scre/fdpohaocaechififmbbbbbknoalclacl) - Capture une capture d'écran de la page entière
- [FireShot](https://chrome.google.com/webstore/detail/take-webpage-screenshots/mcbpblocgmgfnpjjppndjkmgjaogfceg) - Capture des captures d'écran avec des options d'édition et d'annotation

## Confidentialité

Cette extension :
- Ne collecte aucune donnée personnelle
- Ne communique avec aucun serveur externe
- Fonctionne entièrement localement sur votre navigateur
- N'accède qu'aux pages avec des URLs se terminant par `.static.hf.space`

## Licence

Ce projet est sous licence MIT.

---

Créé pour le projet ScrapDev.
